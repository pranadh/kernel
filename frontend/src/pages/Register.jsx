import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import axios from "../api";
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const handleRegister = async (formData) => {
    try {
      const { data } = await axios.post("/api/users/register", formData);
      localStorage.setItem("token", data.token);
      setUser(data);
      navigate('/');
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Registration failed",
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#101113] flex"> {/* Removed pt-[70px] */}
      <AuthForm onSubmit={handleRegister} isLogin={false} />
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

export default Register;