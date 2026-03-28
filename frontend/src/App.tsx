import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

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

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Dashboard — redirect to login if not authenticated */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <UserDashboard
              userType={userType}
              theme={theme}
              setTheme={setTheme}
            />
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
