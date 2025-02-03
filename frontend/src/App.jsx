import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from './context/AuthContext';
import DocumentEditor from "./pages/DocumentEditor";
import DocumentViewer from "./components/DocumentViewer";
import Navbar from './components/Navbar';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/u/:handle" element={<UserProfile />} />
        <Route path="/user/:handle" element={<UserProfile />} />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        <Route path="/new" element={
          <PrivateRoute>
            <DocumentEditor />
          </PrivateRoute>
        } />
        <Route path="/d/:documentId" element={<DocumentViewer />} />
        <Route path="/d/:documentId/edit" element={
          <PrivateRoute>
            <DocumentEditor />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
};

const AppWrapper = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWrapper;