import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from './context/AuthContext';
import DocumentEditor from "./pages/DocumentEditor";
import DocumentViewer from "./components/DocumentViewer";
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import UrlRedirect from './components/UrlRedirect';
import UrlInfo from './components/UrlInfo';
import ImageInfo from './components/ImageInfo';
import EmailInterface from './components/EmailInterface';
import Crop from './pages/Crop';
import PlatformStats from "./pages/PlatformStats";
import WordCounter from './pages/WordCounter';
import TypingTest from './pages/TypingTest';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideSidebarPaths = ['/login', '/register'];
  const showSidebar = !hideSidebarPaths.includes(location.pathname);

  useEffect(() => {
    // Redirect www to non-www
    if (window.location.hostname.startsWith('www.')) {
      const newUrl = window.location.href.replace('www.', '');
      window.location.replace(newUrl);
    }

    // Handle cross-domain session sync
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]);

  return (
    <>
      <Navbar />
        {showSidebar && <Sidebar />}
        <div className={`${showSidebar ? 'ml-64' : ''} pt-[70px]`}>
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
          <Route path="/s/:shortId" element={<UrlRedirect />} />
          <Route path="/info/s/:shortId" element={
            <PrivateRoute>
              <UrlInfo />
            </PrivateRoute>
          } />
          <Route path="/s/:shortId" element={<UrlRedirect />} />
          <Route path="/info/i/:imageId" element={
            <PrivateRoute>
              <ImageInfo />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
          <Route path="/crop" element={
            <PrivateRoute>
              <Crop />
            </PrivateRoute>
          } />
          <Route path="/wordcounter" element={
            <PrivateRoute>
              <WordCounter />
            </PrivateRoute>
          } />
          <Route path="/stats" element={<PlatformStats />} />
          <Route path="/typingtest" element={
            <PrivateRoute>
              <TypingTest />
            </PrivateRoute>
          } />
          <Route path="/email" element={
            <PrivateRoute>
              <EmailInterface />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </>
  );
};

const AppWrapper = () => {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
};

export default AppWrapper;