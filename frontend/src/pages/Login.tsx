import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { useAuth } from '../AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language] = useState<'ES' | 'EN'>(() => (localStorage.getItem('preferredLanguage') as 'ES' | 'EN') || 'EN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    welcome: language === 'ES' ? 'Bienvenido' : 'Welcome Back',
    subtitle: language === 'ES' ? 'Inicia sesión en tu cuenta Soleada' : 'Login to your Soleada account',
    usernameLabel: language === 'ES' ? 'Usuario' : 'Username',
    usernamePlaceholder: language === 'ES' ? 'Tu usuario' : 'Your username',
    passwordLabel: language === 'ES' ? 'Contraseña' : 'Password',
    loginBtn: language === 'ES' ? 'Iniciar Sesión' : 'Log In',
    loggingInBtn: language === 'ES' ? 'Iniciando sesión…' : 'Logging in…',
    invalidError: language === 'ES' ? 'Usuario o contraseña inválidos.' : 'Invalid username or password.',
    connectError: language === 'ES' ? 'No se pudo conectar al servidor. Inténtalo de nuevo.' : 'Could not connect to server. Please try again.',
    noAccount: language === 'ES' ? '¿No tienes una cuenta?' : "Don't have an account?",
    createOne: language === 'ES' ? 'Crea una' : 'Create one',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError('');
    setLoading(true);

    try {
      const data = await loginUser(username, password);
      if (data.success && data.result) {
        setUser(data.result);
        if (data.result.type === 0) {
          navigate('/kids');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(t.invalidError);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t.connectError);
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

        <div className="auth-header">
          <h1 className="gradient-text">{t.welcome}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form className="auth-form delay-1" onSubmit={handleSubmit}>
          
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
            {loading ? t.loggingInBtn : t.loginBtn}
          </button>
        </form>

        <div className="auth-footer delay-2">
          <span>{t.noAccount}</span>
          <button type="button" className="auth-link" onClick={() => navigate('/register')}>
            {t.createOne}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
