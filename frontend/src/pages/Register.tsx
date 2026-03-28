import React, { useState } from 'react';

interface RegisterProps {
  onRegister: () => void;
  onNavigateLogin: () => void;
}

type AccountType = 'kids' | 'adults' | 'founder';

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateLogin }) => {
  const [accountType, setAccountType] = useState<AccountType>('adults');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && username) {
      onRegister();
    }
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(247, 197, 68, 0.15) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

      <div className="auth-card animate-in">
        <div className="auth-header">
          <h1 className="gradient-text">Create Account</h1>
          <p>Join the Nika Network today</p>
        </div>

        <form className="auth-form delay-1" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>I am joining as:</label>
            <div className="account-type-selector">
              <div 
                className={`type-card ${accountType === 'kids' ? 'selected' : ''}`}
                onClick={() => setAccountType('kids')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <span>Kid</span>
              </div>
              <div 
                className={`type-card ${accountType === 'adults' ? 'selected' : ''}`}
                onClick={() => setAccountType('adults')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Teen / Adult</span>
              </div>
              <div 
                className={`type-card ${accountType === 'founder' ? 'selected' : ''}`}
                onClick={() => setAccountType('founder')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>Founder</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              className="auth-input" 
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="auth-input" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="auth-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
            Sign Up
          </button>
        </form>

        <div className="auth-footer delay-2">
          <span>Already have an account?</span>
          <button type="button" className="auth-link" onClick={onNavigateLogin}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
