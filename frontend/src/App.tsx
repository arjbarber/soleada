import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Kids from './pages/Kids';
import TeensContact from './pages/TeensContact';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import PostFeed from './pages/PostFeed';
import Sidebar from './components/Sidebar';
import TranslatorWidget from './components/TranslatorWidget';

import { useAuth } from './AuthContext';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('lifestory');
  const { userType, isAuthenticated } = useAuth();

  // Apply theme to document
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Redirection helper based on user type
  const getAuthRedirectPath = () => {
    return userType === 'kids' ? '/kids' : '/dashboard';
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getAuthRedirectPath()} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getAuthRedirectPath()} replace /> : <Register />}
      />
      
      <Route path="/teens/contact" element={<TeensContact />} />

      {/* Child specific route */}
      <Route
        path="/kids"
        element={
          isAuthenticated ? (
            userType === 'kids' ? <Kids /> : <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Adult / Teen Dashboard */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            userType !== 'kids' ? (
              <UserDashboard
                userType={userType}
                theme={theme}
                setTheme={setTheme}
              />
            ) : (
              <Navigate to="/kids" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Feed with Sidebar */}
      <Route
        path="/feed"
        element={
          isAuthenticated ? (
            <div className="app-layout">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}>
                <TranslatorWidget />
              </Sidebar>
              <PostFeed activeTab={activeTab} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;