import React from 'react';

// SVG Icons
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <SunIcon />
        </div>
        <span className="logo-text">Soleada</span>
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${activeTab === 'lifestory' ? 'active' : ''}`}
          onClick={() => setActiveTab('lifestory')}
        >
          <UsersIcon /> LifeStory Pools
        </button>
        <button
          className={`nav-item ${activeTab === 'founder' ? 'active' : ''}`}
          onClick={() => setActiveTab('founder')}
        >
          <BriefcaseIcon /> Founder Match
        </button>
        <button
          className={`nav-item ${activeTab === 'corporate' ? 'active' : ''}`}
          onClick={() => setActiveTab('corporate')}
        >
          <BuildingIcon /> Corporate Conversations
        </button>
        
        <div className="nav-divider"></div>
        
        <button
          className={`nav-item ${activeTab === 'supporter' ? 'active' : ''}`}
          onClick={() => setActiveTab('supporter')}
        >
          <HomeIcon /> Business Supporter
        </button>
      </nav>

      {/* Render the translator widget passed as children */}
      {children}
    </aside>
  );
};

export default Sidebar;
