import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Kids from './pages/Kids';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import PostFeed from './pages/PostFeed';
import Sidebar from './components/Sidebar';
import TranslatorWidget from './components/TranslatorWidget';

import type { UserType } from './data/mockData';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userType, setUserType] = useState<UserType>('adults');
  const [activeTab, setActiveTab] = useState('lifestory');

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
        element={<Login onLogin={(type) => setUserType(type)} />}
      />
      <Route
        path="/register"
        element={<Register onRegister={(type) => setUserType(type)} />}
      />
      <Route path="/kids" element={<Kids />} />
      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <UserDashboard
            userType={userType}
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      {/* Feed with Sidebar */}
      <Route
        path="/feed"
        element={
          <div className="app-layout">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}>
              <TranslatorWidget />
            </Sidebar>
            <PostFeed activeTab={activeTab} />
          </div>
        }
      />
    </Routes>
  );
};

export default App;
