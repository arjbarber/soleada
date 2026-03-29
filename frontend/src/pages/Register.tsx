import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../api';
import { useAuth, userTypeToBackendType } from '../AuthContext';
import type { UserType } from '../data/mockData';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [accountType, setAccountType] = useState<UserType>('adults');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'ES' | 'EN'>(() => {
    return (localStorage.getItem('preferredLanguage') as 'ES' | 'EN') || 'EN';
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (lang: 'ES' | 'EN') => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const t = {
    title: language === 'ES' ? 'Crear Cuenta' : 'Create Account',
    subtitle: language === 'ES' ? 'Únete a la comunidad de Soleada hoy' : 'Join the Soleada community today',
    roleLabel: language === 'ES' ? 'Me uno como:' : 'I am joining as:',
    kid: language === 'ES' ? 'Niño/a' : 'Kid',
    teen: language === 'ES' ? 'Adolescente / Adulto' : 'Teen / Adult',
    founder: language === 'ES' ? 'Fundador/a' : 'Founder',
    usernameLabel: language === 'ES' ? 'Usuario' : 'Username',
    usernamePlaceholder: language === 'ES' ? 'Tu usuario' : 'Your username',
    passwordLabel: language === 'ES' ? 'Contraseña' : 'Password',
    signupBtn: language === 'ES' ? 'Registrarse' : 'Sign Up',
    signingUpBtn: language === 'ES' ? 'Creando cuenta…' : 'Creating account…',
    error: language === 'ES' ? 'No se pudo crear la cuenta. Inténtalo de nuevo.' : 'Could not create account. Please try again.',
    hasAccount: language === 'ES' ? '¿Ya tienes una cuenta?' : 'Already have an account?',
    loginLink: language === 'ES' ? 'Inicia sesión' : 'Log in',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError('');
    setLoading(true);

    try {
      const backendType = userTypeToBackendType(accountType);
      const newUser = await signupUser(username, password, backendType, language === 'ES' ? 1 : 0);
      // The signup endpoint returns the user object directly
      setUser(newUser);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(247, 197, 68, 0.15) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

      <div className="auth-card animate-in" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', zIndex: 10 }}>
          <div className="language-toggle" style={{ background: 'rgba(255,255,255,0.8)' }}>
            <span className={language === 'ES' ? 'active' : ''} onClick={() => handleLanguageChange('ES')}>ES</span>
            {' | '}
            <span className={language === 'EN' ? 'active' : ''} onClick={() => handleLanguageChange('EN')}>EN</span>
          </div>
        </div>

        <div className="auth-header">
          <h1 className="gradient-text">{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form className="auth-form delay-1" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>{t.roleLabel}</label>
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
                <span>{t.kid}</span>
              </div>
              <div 
                className={`type-card ${accountType === 'adults' ? 'selected' : ''}`}
                onClick={() => setAccountType('adults')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{t.teen}</span>
              </div>
              <div 
                className={`type-card ${accountType === 'founder' ? 'selected' : ''}`}
                onClick={() => setAccountType('founder')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>{t.founder}</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="username">{t.usernameLabel}</label>
            <input 
              type="text" 
              id="username" 
              className="auth-input" 
              placeholder={t.usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">{t.passwordLabel}</label>
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
            {loading ? t.signingUpBtn : t.signupBtn}
          </button>
        </form>

        <div className="auth-footer delay-2">
          <span>{t.hasAccount}</span>
          <button type="button" className="auth-link" onClick={() => navigate('/login')}>
            {t.loginLink}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
