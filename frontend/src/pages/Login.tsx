import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { useAuth, backendTypeToUserType } from '../AuthContext';
import type { UserType } from '../data/mockData';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [accountType, setAccountType] = useState<UserType>('adults');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'ES' | 'EN'>('EN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError('');
    setLoading(true);

    try {
      const data = await loginUser(username, password);
      if (data.success && data.result && data.result.length > 0) {
        setUser(data.result[0]);
        navigate('/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background gradients */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(247, 197, 68, 0.15) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

      <div className="auth-card animate-in" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', zIndex: 10 }}>
          <div className="language-toggle" style={{ background: 'rgba(255,255,255,0.8)' }}>
            <span className={language === 'ES' ? 'active' : ''} onClick={() => setLanguage('ES')}>ES</span>
            {' | '}
            <span className={language === 'EN' ? 'active' : ''} onClick={() => setLanguage('EN')}>EN</span>
          </div>
        </div>

        <div className="auth-header">
          <h1 className="gradient-text">Welcome Back</h1>
          <p>Login to your Soleada account</p>
        </div>

        <form className="auth-form delay-1" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>Login as:</label>
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

          {error && (
            <div className="auth-error" style={{
              color: '#ef4444',
              fontSize: '0.875rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '0.5rem', width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer delay-2">
          <span>Don't have an account?</span>
          <button type="button" className="auth-link" onClick={() => navigate('/register')}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
