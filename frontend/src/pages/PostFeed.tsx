import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import type { DisplayPost } from '../components/PostCard';
import { useAuth } from '../AuthContext';
import { getAllPosts, getUserById, createChatAPI, getChat, type BackendPost } from '../api';
import { mockPosts, type Post } from '../data/mockData';
import { BusinessApp } from '../components/BusinessApp'

interface PostFeedProps {
  activeTab: string;
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

/** Normalize backend post to display format */
function toDisplayPost(bp: BackendPost, authorName: string): DisplayPost {
  return {
    id: bp._id,
    category: postTypeToCategory(bp.type) as 'lifestory' | 'founder' | 'corporate',
    content: bp.body,
    tags: bp.genre ?? [],
    attributes: [],
    timestamp: 'Recently',
    title: bp.title,
    authorName,
    authorId: bp.authorId,
  };
}

const PostFeed: React.FC<PostFeedProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<DisplayPost[]>([]);
  const [loading, setLoading] = useState(false);
  const usernameCacheRef = useRef<Record<string, string>>({});

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setPosts([]);
    try {
      const raw = await getAllPosts();

      // Pre-populate cache with current user
      usernameCacheRef.current[user._id] = user.username;

      // Resolve unknown author names
      const unknownIds = [...new Set(raw.map(p => p.authorId))]
        .filter(id => !usernameCacheRef.current[id]);
      const lookups = await Promise.allSettled(
        unknownIds.map(id => getUserById(id))
      );
      lookups.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          usernameCacheRef.current[unknownIds[i]] = result.value.username;
        }
      });

      const all = raw.map(bp => toDisplayPost(
        bp,
        usernameCacheRef.current[bp.authorId] || 'Unknown User'
      ));
      if (activeTab === 'supporter') {
        setPosts([]);
      } else {
        const filtered = all.filter(p => p.category === activeTab);
        setPosts(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleConnect = async (post: DisplayPost) => {
    if (!user || !post.authorId) return;
    if (post.authorId === user._id) {
      // Navigate to dashboard to see own chat
      navigate('/dashboard');
      return;
    }
    // Try to create or find a chat then navigate to dashboard
    try {
      const found = await getChat(user._id, post.authorId);
      if (!found) {
        await createChatAPI(user._id, post.authorId);
      }
    } catch {
      // ignore
    }
    navigate('/dashboard');
  };

  let title = 'LifeStory Pools';
  let subtitle = 'Connect with others who share similar life experiences and find relatability.';
  if (activeTab === 'founder') {
    title = 'Founder Match';
    subtitle = 'Anonymized elevator pitches. Find co-founders or align with investors.';
  } else if (activeTab === 'corporate') {
    title = 'Corporate Conversations';
    subtitle = 'Discover businesses with shared values and robust goals.';
  } else if (activeTab === 'supporter') {
    title = 'Business Supporter Home';
    subtitle = 'Centralize orders, documents, and track unseen pitfalls.';
  }

  return (
    <div className="main-content">
      <header className="header">
        <h2 className="header-title">{title}</h2>
        <p className="header-subtitle">{subtitle}</p>
      </header>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid rgba(255,107,53,0.3)', borderTopColor: 'var(--nika-orange)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem' }}>Loading posts...</p>
        </div>
      ) : activeTab === 'supporter' ? (
        <div style={{ padding: '2rem' }}>
          <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Your Business Homepage</h3>
            {/* <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Welcome back. All incoming orders and action items are fully resolved. You have zero critical pitfalls currently flagged by the system.
            </p> */}
            <BusinessApp></BusinessApp>
          </div>
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post, idx) => (
            <PostCard 
              key={post.id} 
              post={post} 
              delayIndex={idx}
              onConnect={(p) => handleConnect(p as DisplayPost)}
            />
          ))}
          {posts.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No posts found for this pool. Create one from the dashboard!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFeed;
