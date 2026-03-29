import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserType } from '../data/mockData';
import PostCard from '../components/PostCard';
import type { DisplayPost } from '../components/PostCard';
import { useAuth } from '../AuthContext';
import {
  createPost,
  getAllPosts,
  getUserById,
  getChats,
  getChat,
  createChatAPI,
  sendMessage,
  type BackendPost,
  type BackendChat,
  type BackendChatMessage,
} from '../api';

interface UserDashboardProps {
  userType: UserType;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

/** Convert backend post type number to a category label */
function postTypeToCategory(type: number): string {
  switch (type) {
    case 0: return 'lifestory';
    case 1: return 'founder';
    case 2: return 'corporate';
    default: return 'lifestory';
  }
}

/** Convert category name to backend type number */
function categoryToPostType(category: string): number {
  switch (category) {
    case 'lifestory': return 0;
    case 'founder': return 1;
    case 'corporate': return 2;
    default: return 0;
  }
}

/** Normalize a BackendPost into a format the PostCard can render */
function toDisplayPost(bp: BackendPost, authorName: string): DisplayPost {
  return {
    id: bp._id,
    category: postTypeToCategory(bp.type) as 'lifestory' | 'founder' | 'corporate',
    content: bp.body,
    contentSpanish: bp.bodySpanish,
    tags: bp.genre ?? [],
    attributes: [],
    timestamp: 'Just now',
    title: bp.title,
    authorName,
    authorId: bp.authorId,
  };
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userType, theme, setTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const isSpanish = localStorage.getItem('preferredLanguage') === 'ES' || user?.primaryLang === 1;
  const lang = isSpanish ? 'ES' : 'EN';
  
  const t = {
    messages: lang === 'ES' ? 'Mensajes' : 'Messages',
    noConvos: lang === 'ES' ? 'Ninguna conversación aún' : 'No conversations yet',
    clickConnect: lang === 'ES' ? '¡Haz clic en "Connect" en una publicación para comenzar a chatear!' : 'Click "Connect" on a post to start chatting!',
    noMessages: lang === 'ES' ? 'Aún no hay mensajes. ¡Di hola!' : 'No messages yet. Say hello!',
    typeMessage: lang === 'ES' ? 'Escribe un mensaje...' : 'Type a message...',
    settings: lang === 'ES' ? 'Ajustes' : 'Settings',
    notifications: lang === 'ES' ? 'Notificaciones' : 'Notifications',
    themeOption: lang === 'ES' ? 'Opción de Tema' : 'Theme Option',
    privacy: lang === 'ES' ? 'Privacidad' : 'Privacy Setting',
    saveChanges: lang === 'ES' ? 'Guardar Cambios' : 'Save Changes',
    yourProfile: lang === 'ES' ? 'Tu Perfil' : 'Your Profile',
    account: lang === 'ES' ? 'Cuenta' : 'Account',
    displayName: lang === 'ES' ? 'Nombre de Usuario' : 'Display Name',
    bio: lang === 'ES' ? 'Biografía' : 'Bio',
    updateProfile: lang === 'ES' ? 'Actualizar Perfil' : 'Update Profile',
    logOut: lang === 'ES' ? 'Cerrar Sesión' : 'Log Out',
    yourFeed: lang === 'ES' ? 'Tu Feed' : 'Your Feed',
    signedInAs: lang === 'ES' ? 'Sesión iniciada como' : 'Signed in as',
    postUpdate: lang === 'ES' ? 'Publicar Actualización' : 'Post Update',
    noPosts: lang === 'ES' ? 'Aún no hay publicaciones' : 'No posts yet',
    shareFirst: lang === 'ES' ? 'Haz clic en "Publicar Actualización" a continuación para compartir tu historia.' : 'Click "Post Update" below to share your first story.',
    createNew: lang === 'ES' ? 'Crear una Nueva Publicación' : 'Create a New Post',
    category: lang === 'ES' ? 'Categoría' : 'Category',
    title: lang === 'ES' ? 'Título' : 'Title',
    yourStory: lang === 'ES' ? 'Tu Historia' : 'Your Story',
    publishing: lang === 'ES' ? 'Publicando...' : 'Publishing...',
    publishPost: lang === 'ES' ? 'Publicar Post' : 'Publish Post',
  };

  // ─── Chat state ───
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<BackendChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [sidebarView, setSidebarView] = useState<'chat' | 'settings' | 'profile'>('chat');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Post state ───
  const [posts, setPosts] = useState<DisplayPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // ─── New post modal state ───
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('lifestory');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // ─── Toast state ───
  const [toast, setToast] = useState<string | null>(null);

  // ─── Username cache to avoid re-fetching ───
  const usernameCacheRef = useRef<Record<string, string>>({});

  // ─── Load ALL posts from backend ───
  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const raw = await getAllPosts();

      // Pre-populate cache with current user
      usernameCacheRef.current[user._id] = user.username;

      // Collect unique authorIds we haven't cached yet
      const unknownIds = [...new Set(raw.map(p => p.authorId))]
        .filter(id => !usernameCacheRef.current[id]);

      // Resolve usernames in parallel
      const lookups = await Promise.allSettled(
        unknownIds.map(id => getUserById(id))
      );
      lookups.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          usernameCacheRef.current[unknownIds[i]] = result.value.username;
        }
      });

      setPosts(raw.map(bp => toDisplayPost(
        bp,
        usernameCacheRef.current[bp.authorId] || 'Unknown User'
      )));
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ─── Load chats from backend ───
  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoadingChats(true);
    try {
      const data = await getChats(user._id);

      // Resolve unknown user names for chats
      const unknownIds = [...new Set(data.map(c => c.userOne === user._id ? c.userTwo : c.userOne))]
        .filter(id => !usernameCacheRef.current[id]);

      if (unknownIds.length > 0) {
        const lookups = await Promise.allSettled(
          unknownIds.map(id => getUserById(id))
        );
        lookups.forEach((result, i) => {
          if (result.status === 'fulfilled' && result.value) {
            usernameCacheRef.current[unknownIds[i]] = result.value.username;
          }
        });
      }

      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Scroll to latest message when opening a chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const activeChat: BackendChat | undefined = activeChatId
    ? chats.find(c => c._id === activeChatId)
    : undefined;

  // ─── Send a chat message ───
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId || !user || !activeChat) return;

    const lang = user.primaryLang ?? 0;
    const otherUser = activeChat.userOne === user._id ? activeChat.userTwo : activeChat.userOne;

    // Optimistically add message to the local state
    const optimisticMsg: BackendChatMessage = {
      user: user._id,
      contentEnglish: lang === 0 ? messageInput : '',
      contentSpanish: lang === 1 ? messageInput : '',
    };

    setChats(prev =>
      prev.map(c =>
        c._id === activeChatId
          ? { ...c, messages: [...c.messages, optimisticMsg] }
          : c
      )
    );
    const msgText = messageInput;
    setMessageInput('');

    try {
      await sendMessage(activeChatId, user._id, otherUser, msgText, lang);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // ─── Connect: create or open a chat with a post's author ───
  const handleConnect = async (post: DisplayPost) => {
    if (!user) return;
    const authorId = post.authorId;
    if (!authorId) return;

    // Don't connect with yourself
    if (authorId === user._id) {
      setToast("That's your own post!");
      return;
    }

    // Check if chat already exists locally
    const existing = chats.find(
      c =>
        (c.userOne === user._id && c.userTwo === authorId) ||
        (c.userOne === authorId && c.userTwo === user._id)
    );

    if (existing) {
      // Open the existing chat
      setSidebarView('chat');
      setActiveChatId(existing._id);
      setToast(`Opened chat with ${post.authorName}`);
      return;
    }

    // Try to find on backend
    try {
      const found = await getChat(user._id, authorId);
      if (found) {
        // Add to local list if not there and open it
        setChats(prev => {
          if (prev.find(c => c._id === found._id)) return prev;
          return [...prev, found];
        });
        setSidebarView('chat');
        setActiveChatId(found._id);
        setToast(`Opened chat with ${post.authorName}`);
        return;
      }
    } catch {
      // Not found, continue to create
    }

    // Create a new chat
    try {
      const newChat = await createChatAPI(user._id, authorId);
      setChats(prev => [...prev, newChat]);
      setSidebarView('chat');
      setActiveChatId(newChat._id);
      setToast(`Connected with ${post.authorName}!`);
    } catch (err) {
      console.error('Failed to create chat:', err);
      setToast('Could not connect. Try again.');
    }
  };

  // ─── Create a new post ───
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostTitle.trim() || !newPostBody.trim()) return;

    setIsSubmittingPost(true);
    try {
      await createPost(
        newPostTitle.trim(),
        newPostBody.trim(),
        user._id,
        categoryToPostType(newPostCategory)
      );
      // Re-fetch from the database to ensure we only show persisted posts
      await fetchPosts();
      setNewPostTitle('');
      setNewPostBody('');
      setNewPostCategory('lifestory');
      setShowPostModal(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Display name from the backend user, or fallback
  const displayName = user?.username || 'User';
  const accountTypeLabel = userType === 'kids' ? (lang === 'ES' ? 'Niño/a' : 'Kid') : userType === 'founder' ? (lang === 'ES' ? 'Fundador' : 'Founder') : (lang === 'ES' ? 'Adolescente / Adulto' : 'Teen / Adult');

  /** Helper: get the "other" user name for a chat */
  const chatContactName = (chat: BackendChat): string => {
    if (!user) return 'Unknown';
    const otherId = chat.userOne === user._id ? chat.userTwo : chat.userOne;
    return usernameCacheRef.current[otherId] || otherId;
  };

  /** Helper: get last message preview */
  const chatPreview = (chat: BackendChat): string => {
    if (chat.messages.length === 0) return lang === 'ES' ? 'Sin mensajes' : 'No messages yet';
    const last = chat.messages[chat.messages.length - 1];
    return lang === 'ES' && last.contentSpanish ? last.contentSpanish : (last.contentEnglish || last.contentSpanish || '...');
  };

  /** Helper: get initial for avatar */
  const chatInitial = (chat: BackendChat): string => {
    const name = chatContactName(chat);
    return name.charAt(0).toUpperCase();
  };

  /** Deterministic color from a string */
  const stringToColor = (str: string): string => {
    const colors = ['#FF6B35', '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  /** Helper: get display text from a message */
  const getMessageText = (msg: BackendChatMessage): string => {
    return lang === 'ES' && msg.contentSpanish ? msg.contentSpanish : (msg.contentEnglish || msg.contentSpanish || '');
  };

  return (
    <div className="dashboard-container">
      {userType !== 'kids' && (
        <div className="chat-sidebar glass" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          
          {/* Sidebar Header */}
          <div className="chat-sidebar-header">
            <div className="landing-logo">
              <div className="landing-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', color: 'white' }}>
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
              </div>
              <span className="landing-logo-text">soleada</span>
            </div>
            {activeChatId && (
              <button 
                className="btn-icon" 
                onClick={() => setActiveChatId(null)}
                title="Back to contacts"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
          </div>

          <div className="sidebar-dynamic-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {sidebarView === 'chat' && !activeChatId && (
              /* ═══ CONTACTS LIST ═══ */
              <div className="contacts-list">
                <div className="contacts-list-header">
                  <span>{t.messages}</span>
                  <span className="contacts-count">{chats.length}</span>
                </div>
                {loadingChats ? (
                  <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div className="spinner"></div>
                  </div>
                ) : chats.length === 0 ? (
                  <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>{t.noConvos}</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.6 }}>{t.clickConnect}</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat._id}
                      className="contact-item"
                      onClick={() => setActiveChatId(chat._id)}
                    >
                      <div className="contact-avatar" style={{ background: stringToColor(chatContactName(chat)) }}>
                        {chatInitial(chat)}
                      </div>
                      <div className="contact-info">
                        <div className="contact-top-row">
                          <span className="contact-name">{chatContactName(chat)}</span>
                        </div>
                        <div className="contact-bottom-row">
                          <span className="contact-preview">{chatPreview(chat)}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {sidebarView === 'chat' && activeChatId && activeChat && (
              /* ═══ ACTIVE CONVERSATION ═══ */
              <>
                <div className="conversation-header">
                  <div className="contact-avatar small" style={{ background: stringToColor(chatContactName(activeChat)) }}>
                    {chatInitial(activeChat)}
                  </div>
                  <div>
                    <div className="conversation-name">{chatContactName(activeChat)}</div>
                  </div>
                </div>

                <div className="chat-messages">
                  {activeChat.messages.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <p>{t.noMessages}</p>
                    </div>
                  ) : (
                    activeChat.messages.map((msg, idx) => (
                      <div key={msg._id || idx} className={`chat-bubble ${msg.user === user?._id ? 'user' : 'other'}`}>
                        <div className="chat-bubble-text">{getMessageText(msg)}</div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    placeholder={t.typeMessage}
                    className="chat-input"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button type="submit" className="btn-icon send-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </>
            )}

            {sidebarView === 'settings' && (
              <div className="settings-view" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <h3>{t.settings}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                  <div className="input-group">
                    <label>{t.notifications}</label>
                    <select className="auth-input"><option>{lang === 'ES' ? 'Activado' : 'Enabled'}</option><option>{lang === 'ES' ? 'Desactivado' : 'Disabled'}</option></select>
                  </div>
                  <div className="input-group">
                    <label>{t.themeOption}</label>
                    <select 
                      className="auth-input"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    >
                      <option value="light">{lang === 'ES' ? 'Modo Claro' : 'Light Mode'}</option>
                      <option value="dark">{lang === 'ES' ? 'Modo Oscuro' : 'Dark Mode'}</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>{t.privacy}</label>
                    <select className="auth-input"><option>{lang === 'ES' ? 'Solo Amigos' : 'Friends Only'}</option><option>{lang === 'ES' ? 'Público' : 'Public'}</option><option>{lang === 'ES' ? 'Privado' : 'Private'}</option></select>
                  </div>
                  <button className="btn-primary" style={{ marginTop: '1rem' }}>{t.saveChanges}</button>
                </div>
              </div>
            )}

            {sidebarView === 'profile' && (
              <div className="profile-view" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <h3>{t.yourProfile}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', marginTop: '1.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--nika-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ textTransform: 'capitalize' }}>{displayName}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{accountTypeLabel} {t.account}</p>
                  </div>
                  
                  <div className="input-group" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <label>{t.displayName}</label>
                    <input type="text" className="auth-input" defaultValue={displayName} />
                  </div>
                  <div className="input-group" style={{ width: '100%' }}>
                    <label>{t.bio}</label>
                    <textarea className="auth-input" rows={3} placeholder={lang === 'ES' ? "Cuéntanos sobre ti..." : "Tell us about yourself..."} style={{ resize: 'vertical' }}></textarea>
                  </div>
                  <button className="btn-primary" style={{ width: '100%' }}>{t.updateProfile}</button>
                  <button 
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                    onClick={handleLogout}
                  >
                    {t.logOut}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer navigation */}
          <div className="sidebar-footer">
            <button 
              className={`btn-icon ${sidebarView === 'chat' ? 'active' : ''}`}
              onClick={() => { setSidebarView('chat'); setActiveChatId(null); }}
              title="Chat"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
            <button 
              className={`btn-icon ${sidebarView === 'settings' ? 'active' : ''}`}
              onClick={() => setSidebarView('settings')}
              title="Settings"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <button 
              className={`btn-icon ${sidebarView === 'profile' ? 'active' : ''}`}
              onClick={() => setSidebarView('profile')}
              title="Profile"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
          </div>
        </div>
      )}

      <div className={`posts-main ${userType === 'kids' ? 'full-width' : ''}`}>
        <div className="posts-header">
          <h2>{t.yourFeed}</h2>
          {user && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t.signedInAs} <strong>{user.username}</strong>
            </span>
          )}
        </div>
        
        <div className="posts-feed">
          {loadingPosts ? (
            <div className="posts-loading">
               <div className="spinner"></div>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: 'var(--text-muted)', padding: '3rem' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <p style={{ fontWeight: 500, fontSize: '1rem' }}>{t.noPosts}</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{t.shareFirst}</p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <PostCard 
                key={post.id} 
                post={post} 
                delayIndex={idx}
                onConnect={(p) => handleConnect(p as DisplayPost)}
              />
            ))
          )}
        </div>

        <div className="posts-footer">
           <button 
             className="btn-primary" 
             style={{ width: '100%', borderRadius: '12px' }}
             onClick={() => setShowPostModal(true)}
           >
             {t.postUpdate}
           </button>
        </div>
      </div>

      {/* ═══ NEW POST MODAL ═══ */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-card glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.createNew}</h3>
              <button className="btn-icon" onClick={() => setShowPostModal(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreatePost}>
              <div className="input-group">
                <label>{t.category}</label>
                <div className="category-selector">
                  {['lifestory', 'founder', 'corporate'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`category-chip ${newPostCategory === cat ? 'active' : ''}`}
                      onClick={() => setNewPostCategory(cat)}
                    >
                      {cat === 'lifestory' ? '💬 LifeStory' : cat === 'founder' ? '🚀 Founder' : '🏢 Corporate'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>{t.title}</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Give your post a title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>{t.yourStory}</label>
                <textarea
                  className="auth-input"
                  placeholder="Share your experience, pitch, or business description..."
                  value={newPostBody}
                  onChange={(e) => setNewPostBody(e.target.value)}
                  rows={5}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isSubmittingPost || !newPostTitle.trim() || !newPostBody.trim()}
                style={{ width: '100%', opacity: isSubmittingPost ? 0.7 : 1 }}
              >
                {isSubmittingPost ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    {t.publishing}
                  </>
                ) : (
                  t.publishPost
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ TOAST NOTIFICATION ═══ */}
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
