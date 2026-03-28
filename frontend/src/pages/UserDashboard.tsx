import React, { useState, useEffect } from 'react';
import { mockPosts, mockChats } from '../data/mockData';
import type { UserType, Post } from '../data/mockData';
import PostCard from '../components/PostCard';

interface UserDashboardProps {
  userType: UserType;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userType, theme, setTheme }) => {
  const [activeChatId, setActiveChatId] = useState<string>(mockChats[0].id);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [sidebarView, setSidebarView] = useState<'chat' | 'settings' | 'profile'>('chat');

  useEffect(() => {
    setLoadingPosts(true);
    // Simulate fetching user-specific posts
    setTimeout(() => {
      setPosts(mockPosts);
      setLoadingPosts(false);
    }, 400);
  }, [userType]);

  const activeChat = mockChats.find(c => c.id === activeChatId);
  const activeChatMessages = activeChat?.messages || [];

  return (
    <div className="dashboard-container">
      {userType !== 'kids' && (
        <div className="chat-sidebar glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="chat-header" style={{ marginBottom: '1.5rem' }}>
            <h2>Soleada</h2>
          </div>
          
          <div className="sidebar-dynamic-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {sidebarView === 'chat' && (
              <>
                <div className="chat-dropdown-container">
                  <select 
                    value={activeChatId} 
                    onChange={(e) => setActiveChatId(e.target.value)}
                    className="chat-dropdown"
                  >
                    {mockChats.map(chat => (
                      <option key={chat.id} value={chat.id}>{chat.title}</option>
                    ))}
                  </select>
                </div>

                <div className="chat-messages">
                  {activeChatMessages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                      <div className="chat-bubble-text">{msg.text}</div>
                    </div>
                  ))}
                </div>
                
                <div className="chat-input-area">
                  <input type="text" placeholder="Type a message..." className="chat-input" />
                  <button className="btn-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </>
            )}

            {sidebarView === 'settings' && (
              <div className="settings-view" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--nika-orange)' }}>Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label>Notifications</label>
                    <select className="auth-input"><option>Enabled</option><option>Disabled</option></select>
                  </div>
                  <div className="input-group">
                    <label>Theme Option</label>
                    <select 
                      className="auth-input"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Privacy Setting</label>
                    <select className="auth-input"><option>Friends Only</option><option>Public</option><option>Private</option></select>
                  </div>
                  <button className="btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
                </div>
              </div>
            )}

            {sidebarView === 'profile' && (
              <div className="profile-view" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--nika-orange)' }}>Your Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--nika-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                    {userType.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ textTransform: 'capitalize' }}>{userType} Account</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage your profile information.</p>
                  </div>
                  
                  <div className="input-group" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <label>Display Name</label>
                    <input type="text" className="auth-input" defaultValue="User" />
                  </div>
                  <div className="input-group" style={{ width: '100%' }}>
                    <label>Bio</label>
                    <textarea className="auth-input" rows={3} placeholder="Tell us about yourself..." style={{ resize: 'vertical' }}></textarea>
                  </div>
                  <button className="btn-primary" style={{ width: '100%' }}>Update Profile</button>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-footer" style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1.25rem', 
            borderTop: '1px solid rgba(0,0,0,0.05)', 
            display: 'flex', 
            justifyContent: 'space-evenly' 
          }}>
            <button 
              className="btn-icon"
              onClick={() => setSidebarView('chat')}
              title="Chat"
              style={sidebarView === 'chat' ? { background: 'var(--nika-orange)', color: 'white' } : {}}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setSidebarView('settings')}
              title="Settings"
              style={sidebarView === 'settings' ? { background: 'var(--nika-orange)', color: 'white' } : {}}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <button 
              className="btn-icon" 
              onClick={() => setSidebarView('profile')}
              title="Profile"
              style={sidebarView === 'profile' ? { background: 'var(--nika-orange)', color: 'white' } : {}}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
          </div>
        </div>
      )}

      <div className={`posts-main ${userType === 'kids' ? 'full-width' : ''}`}>
        <div className="posts-header">
          <h2>user</h2>
        </div>
        
        <div className="posts-feed">
          {loadingPosts ? (
            <div className="posts-loading">
               <div className="spinner"></div>
            </div>
          ) : (
            posts.map((post, idx) => (
              <PostCard key={post.id} post={post} delayIndex={idx} />
            ))
          )}
        </div>

        <div className="posts-footer">
           <button className="btn-primary" style={{ width: '100%', borderRadius: '12px' }}>Post Update</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
