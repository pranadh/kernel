import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const { data } = await axios.post('/api/users/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          let currentUser = null;
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
            setUser(currentUser);
          }
  
          const { data } = await axios.get('/api/users/me');
          const updatedUser = {
            ...data,
            avatar: currentUser?.avatar || data.avatar
          };
  
          setUser(updatedUser);
          // Store the merged data, not just API response
          localStorage.setItem('user', JSON.stringify(updatedUser));
  
        } catch (error) {
          console.error('Auth load error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);
  
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading,
      login,
      logout,
      updateUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;