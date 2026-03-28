import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import type { UserType } from './data/mockData';
import './App.css';

type AppView = 'login' | 'register' | 'app';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [currentUserType, setCurrentUserType] = useState<UserType>('adults');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={(type) => {
          setCurrentUserType(type);
          setCurrentView('app');
        }} 
        onNavigateRegister={() => setCurrentView('register')} 
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register 
        onRegister={(type) => {
          setCurrentUserType(type);
          setCurrentView('app');
        }} 
        onNavigateLogin={() => setCurrentView('login')} 
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Dynamic Background Elements */}
      <style>{`
        @keyframes subtle-drift {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes subtle-drift-alt {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(30px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.18) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0, animation: 'subtle-drift 15s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(247, 197, 68, 0.15) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0, animation: 'subtle-drift-alt 18s ease-in-out infinite' }} />

      <UserDashboard userType={currentUserType} theme={theme} setTheme={setTheme} />
    </div>
  );
}

export default App;
