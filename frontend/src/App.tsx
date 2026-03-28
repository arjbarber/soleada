import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TranslatorWidget from './components/TranslatorWidget';
import PostFeed from './pages/PostFeed';
import Login from './pages/Login';
import Register from './pages/Register';

type AppView = 'login' | 'register' | 'app';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [activeTab, setActiveTab] = useState<string>('lifestory');

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={() => setCurrentView('app')} 
        onNavigateRegister={() => setCurrentView('register')} 
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register 
        onRegister={() => setCurrentView('app')} 
        onNavigateLogin={() => setCurrentView('login')} 
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(247, 197, 68, 0.1) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}>
        <TranslatorWidget />
      </Sidebar>
      
      <PostFeed activeTab={activeTab} />
    </div>
  );
}

export default App;
