import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { mockPosts, type Post } from '../data/mockData';

interface PostFeedProps {
  activeTab: string;
}

const PostFeed: React.FC<PostFeedProps> = ({ activeTab }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate fetching data from backend
    setLoading(true);
    setPosts([]); // clear immediately for animation re-trigger
    
    setTimeout(() => {
      if (activeTab === 'supporter') {
        setPosts([]);
      } else {
        const filtered = mockPosts.filter((p) => p.category === activeTab);
        setPosts(filtered);
      }
      setLoading(false);
    }, 400); // 400ms fake network delay
  }, [activeTab]);

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
          <p style={{ marginTop: '1rem' }}>Matching profiles using Gemini...</p>
        </div>
      ) : activeTab === 'supporter' ? (
        <div style={{ padding: '2rem' }}>
          <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Your Business Homepage</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Welcome back. All incoming orders and action items are fully resolved. You have zero critical pitfalls currently flagged by the system.
            </p>
          </div>
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post, idx) => (
            <PostCard key={post.id} post={post} delayIndex={idx} />
          ))}
          {posts.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No anonymized posts found for this pool.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFeed;
