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
  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className="landing-navbar animate-in">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <SunIcon />
          </div>
          <span className="landing-logo-text">soleada</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="landing-hero">
        <p className="landing-tagline animate-in delay-1">LEARN · CREATE · BUILD</p>

        <h1 className="landing-headline animate-in delay-1">
          Where <span className="accent">stories</span> become <br />
          skills & ideas become <span className="italic">businesses</span>
        </h1>

        <p className="landing-subtitle animate-in delay-2">
          A refined platform designed for the next generation of creative minds and founders.
        </p>
      </div>

      {/* CARDS */}
      <div className="landing-cards">
        <Link to="/login" className="landing-card animate-in delay-2">
          <div className="landing-card-icon">→</div>
          <h2 className="landing-card-title">log in</h2>
          <p className="landing-card-desc">Continue your journey and access your ventures.</p>
        </Link>

        <Link to="/register" className="landing-card animate-in delay-3">
          <div className="landing-card-icon">+</div>
          <h2 className="landing-card-title">create account</h2>
          <p className="landing-card-desc">Join the community and start building your future.</p>
        </Link>
      </div>
    </div>
  );
};

export default Landing;
