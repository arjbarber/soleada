import React, { useState } from 'react';
import { auth } from "../config/firebase";
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../api';
import { useAuth, userTypeToBackendType } from '../AuthContext';
import type { UserType } from '../data/mockData';
import { signInWithCustomToken } from "firebase/auth";


const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [accountType, setAccountType] = useState<UserType>('adults');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const backendType = userTypeToBackendType(accountType);
      const { firebaseToken, backendUser } = await signupUser(email, username, password, backendType);

      // Sign in with the custom token
      await signInWithCustomToken(auth, firebaseToken);

      // Store the user in your context
      setUser(backendUser);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background gradients */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(247, 197, 68, 0.15) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

      <div className="auth-card animate-in">
        <div className="auth-header">
          <h1 className="gradient-text">Create Account</h1>
          <p>Join the Soleada community today</p>
        </div>

        <form className="auth-form delay-1" onSubmit={handleSubmit}>
          {/* Account Type Selector */}
          <div className="input-group">
            <label>I am joining as:</label>
            <div className="account-type-selector">
              {['kids', 'adults', 'founder'].map(type => (
                <div
                  key={type}
                  className={`type-card ${accountType === type ? 'selected' : ''}`}
                  onClick={() => setAccountType(type as UserType)}
                >
                  {/* Add your SVG icons here */}
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
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

          {/* Username Input */}
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

          {/* Password Input */}
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

          {/* Error message */}
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
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer delay-2">
          <span>Already have an account?</span>
          <button type="button" className="auth-link" onClick={() => navigate('/login')}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;

