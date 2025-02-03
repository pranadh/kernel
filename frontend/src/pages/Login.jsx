import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import axios from "../api";
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const validateForm = (formData) => {
    const errors = [];
    if (!formData.handle) errors.push("Handle is required");
    if (!formData.password) errors.push("Password is required");
    return errors;
  };

  const handleLogin = async (formData) => {
    const errors = validateForm(formData);
    if (errors.length > 0) {
      setToast({ show: true, message: errors[0], type: 'error' });
      return;
    }

    try {
      const { data } = await axios.post("/api/users/login", formData);
      localStorage.setItem("token", data.token);
      setUser(data);
      navigate('/');
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Invalid credentials",
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#101113] flex"> {/* Removed pt-[70px] */}
      <AuthForm onSubmit={handleLogin} isLogin={true} />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'error' })}
        />
      )}
    </div>
  );
};

export default Login;