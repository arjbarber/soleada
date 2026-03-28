import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
  onNavigateRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="auth-container">
      {/* Background gradients similar to App.tsx but positioned for auth */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(247, 197, 68, 0.15) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

      <div className="auth-card animate-in">
        <div className="auth-header">
          <h1 className="gradient-text">Welcome Back</h1>
          <p>Login to your Nika Network account</p>
        </div>

        <form className="auth-form delay-1" onSubmit={handleSubmit}>
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
            Log In
          </button>
        </form>

        <div className="auth-footer delay-2">
          <span>Don't have an account?</span>
          <button type="button" className="auth-link" onClick={onNavigateRegister}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
