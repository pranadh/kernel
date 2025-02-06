import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to format user data and ensure consistent avatar URL format
  const formatUserData = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      avatar: userData.avatar?.startsWith('http') 
        ? userData.avatar 
        : userData.avatar 
          ? `https://i.exlt.tech/avatar/${userData.avatar}` 
          : null
    };
  };

  const login = async (credentials) => {
    const { data } = await axios.post('/api/users/login', credentials);
    const formattedUser = formatUserData(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(formattedUser));
    setUser(formattedUser);
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
          // First try to use stored user data
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(formatUserData(parsedUser));
          }
          // Then fetch fresh data
          const { data } = await axios.get('/api/users/me');
          const formattedUser = formatUserData(data);
          setUser(formattedUser);
          localStorage.setItem('user', JSON.stringify(formattedUser));
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
    const formattedUser = formatUserData(userData);
    setUser(formattedUser);
    localStorage.setItem('user', JSON.stringify(formattedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: (userData) => setUser(formatUserData(userData)), 
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