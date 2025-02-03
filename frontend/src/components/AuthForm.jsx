import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api';
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiAtSign, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaRegUserCircle } from "react-icons/fa";
import logo from '../assets/logo.png';

const AuthForm = ({ onSubmit, isLogin }) => {
  const [handle, setHandle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    handle: false,
    username: false,
    password: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [handleAvailability, setHandleAvailability] = useState({
    isChecking: false,
    isAvailable: true,
    message: ''
  });

  const infoBoxes = [
    { icon: <FiUser />, text: "Create your unique profile" },
    { icon: <FiLock />, text: "Secure authentication" },
    { icon: <FiMail />, text: "Connect with others" },
    { icon: <FiUser />, text: "Join communities" },
    { icon: <FiMail />, text: "Share your thoughts" },
    { icon: <FiLock />, text: "Privacy focused" }
  ];

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const validateHandle = (value) => {
    if (!value) return 'Handle is required.';
    if (value.length < 1 || value.length > 12) return 'Handle must be between 1 and 12 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Handle can only contain letters, numbers and underscores';
    return '';
  };

  const checkHandleAvailability = useCallback(
    debounce(async (handle) => {
      if (!handle || handle.length < 1 || isLogin) return;
      
      try {
        setHandleAvailability(prev => ({ ...prev, isChecking: true }));
        const response = await axios.get(`/api/users/${handle}`);
        
        setHandleAvailability({
          isChecking: false,
          isAvailable: false,
          message: 'Handle already exists'
        });
      } catch (error) {
        if (error.response?.status === 404) {
          setHandleAvailability({
            isChecking: false,
            isAvailable: true,
            message: ''
          });
        }
      }
    }, 500),
    [isLogin]
  );

  const handleHandleChange = (e) => {
    const value = e.target.value;
    setHandle(value);
    if (!isLogin && value) {
      checkHandleAvailability(value);
    }
  };

  const validateUsername = (value) => {
    if (!value) return 'Username is required.';
    if (value.length < 1 || value.length > 12) return 'Username must be between 1 and 12 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers and underscores';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required.';
    if (value.length < 1) return 'Password must have at least 1 character.';
    return '';
  };

  useEffect(() => {
    const newErrors = {};
    newErrors.handle = validateHandle(handle);
    if (!isLogin) {
      newErrors.username = validateUsername(username);
      // Add API validation to error check
      if (!handleAvailability.isAvailable && handle) {
        newErrors.handle = handleAvailability.message;
      }
    }
    newErrors.password = validatePassword(password);

    setErrors(newErrors);
    
    const valid = Object.values(newErrors).every(error => error === '') &&
                 (isLogin ? true : username.length > 0) &&
                 handle.length > 0 &&
                 password.length >= 1 &&
                 (!isLogin ? handleAvailability.isAvailable : true);
    
    setIsFormValid(valid);
  }, [handle, username, password, isLogin, handleAvailability.isAvailable]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    setTouched({
      handle: true,
      username: true,
      password: true
    });

    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const formData = isLogin ? { handle, password } : { username, handle, password };
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-70px)] flex">
      <div className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-center">
        <div className="flex justify-center mb-12">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-neutral-200">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="mt-3 text-sm text-neutral-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link 
                to={isLogin ? "/register" : "/login"}
                className="text-violet-600 hover:text-violet-300 transition-colors"
              >
                {isLogin ? 'Register' : 'Sign In'}
              </Link>
            </p>
          </div>

          <div className="bg-[#101113] border border-neutral-800 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Handle<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-auto h-[3.25rem] left-0 pl-3 flex items-center pointer-events-none">
                      <FiAtSign className="text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      value={handle}
                      onChange={handleHandleChange}
                      onBlur={() => handleBlur('handle')}
                      className={`mt-1 w-full pl-10 pr-4 py-2 bg-neutral-800/50 rounded-s border 
                                ${touched.handle && (errors.handle || !handleAvailability.isAvailable) 
                                  ? 'border-red-500' 
                                  : handleAvailability.isAvailable && handle.length > 0
                                    ? 'border-neutral-700'
                                    : 'border-neutral-700'} 
                                focus:border-violet-600 focus:outline-none text-white 
                                placeholder:text-neutral-500`}
                      placeholder="Enter your handle"
                    />
                  </div>
                  {handleAvailability.isChecking && (
                    <p className="mt-1 text-sm text-neutral-400">Checking handle availability...</p>
                  )}
                  {touched.handle && errors.handle && (
                    <p className="mt-1 text-sm text-red-600">{errors.handle}</p>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Username<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-auto h-[3.25rem] left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-neutral-400" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => handleBlur('username')}
                        className={`mt-1 w-full pl-10 pr-4 py-2 bg-neutral-800/50 rounded-s border 
                                 ${touched.username && errors.username ? 'border-red-500' : 'border-neutral-700'} 
                                 focus:border-violet-600 focus:outline-none text-white 
                                 placeholder:text-neutral-500`}
                        placeholder="Enter your username"
                      />
                    </div>
                    {touched.username && errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Password<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-auto h-[3.25rem] left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-neutral-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={`mt-1 w-full pl-10 pr-12 py-2 bg-neutral-800/50 rounded-s border 
                               ${touched.password && errors.password ? 'border-red-500' : 'border-neutral-700'} 
                               focus:border-violet-600 focus:outline-none text-white 
                               placeholder:text-neutral-500`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-4 right-1 pr-3 flex items-center text-neutral-400 
                               hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-3 px-4 rounded-sm
                         ${isFormValid 
                           ? 'bg-violet-600 hover:bg-violet-700' 
                           : 'bg-zinc-700 cursor-not-allowed'}
                         text-white font-medium transition-colors duration-200 
                         disabled:opacity-50
                         flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <FiLogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    ) : (
                      <>
                        <FaRegUserCircle className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;