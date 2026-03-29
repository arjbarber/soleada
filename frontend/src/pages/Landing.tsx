import React from 'react';
import { Link } from 'react-router-dom';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const Landing: React.FC = () => {
  const [lang, setLang] = React.useState<'ES' | 'EN'>(() => {
    return (localStorage.getItem('preferredLanguage') as 'ES' | 'EN') || 'EN';
  });

  const handleLang = (newLang: 'ES' | 'EN') => {
    setLang(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  const t = {
    tagline: lang === 'ES' ? 'APRENDE · CREA · CONSTRUYE' : 'LEARN · CREATE · BUILD',
    where: lang === 'ES' ? 'Donde ' : 'Where ',
    stories: lang === 'ES' ? 'historias' : 'stories',
    become: lang === 'ES' ? ' se convierten' : ' become ',
    br: lang === 'ES' ? 'en habilidades e ideas en ' : 'skills & ideas become ',
    businesses: lang === 'ES' ? 'negocios' : 'businesses',
    subtitle: lang === 'ES' ? 'Una plataforma refinada diseñada para la nueva generación de mentes creativas y fundadores.' : 'A refined platform designed for the next generation of creative minds and founders.',
    login: lang === 'ES' ? 'iniciar sesión' : 'log in',
    loginDesc: lang === 'ES' ? 'Continúa tu viaje y accede a tus emprendimientos.' : 'Continue your journey and access your ventures.',
    create: lang === 'ES' ? 'crear cuenta' : 'create account',
    createDesc: lang === 'ES' ? 'Únete a la comunidad y comienza a construir tu futuro.' : 'Join the community and start building your future.'
  };

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className="landing-navbar animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <SunIcon />
          </div>
          <span className="landing-logo-text">soleada</span>
        </div>
        <div className="language-toggle" style={{ background: 'rgba(255,255,255,0.8)' }}>
          <span className={lang === 'ES' ? 'active' : ''} onClick={() => handleLang('ES')}>ES</span>
          {' | '}
          <span className={lang === 'EN' ? 'active' : ''} onClick={() => handleLang('EN')}>EN</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="landing-hero">
        <p className="landing-tagline animate-in delay-1">{t.tagline}</p>

        <h1 className="landing-headline animate-in delay-1">
          {t.where}<span className="accent">{t.stories}</span>{t.become}<br />
          {t.br}<span className="italic">{t.businesses}</span>
        </h1>

        <p className="landing-subtitle animate-in delay-2">
          {t.subtitle}
        </p>
      </div>

      {/* CARDS */}
      <div className="landing-cards">
        <Link to="/login" className="landing-card animate-in delay-2">
          <div className="landing-card-icon">→</div>
          <h2 className="landing-card-title">{t.login}</h2>
          <p className="landing-card-desc">{t.loginDesc}</p>
        </Link>

        <Link to="/register" className="landing-card animate-in delay-3">
          <div className="landing-card-icon">+</div>
          <h2 className="landing-card-title">{t.create}</h2>
          <p className="landing-card-desc">{t.createDesc}</p>
        </Link>
      </div>
    </div>
  );
};

export default Landing;
