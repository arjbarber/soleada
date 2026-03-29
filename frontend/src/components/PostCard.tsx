import React from 'react';
import type { Post } from '../data/mockData';

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px', marginRight: '4px' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Supports both the mock Post shape and the backend display shape
export interface DisplayPost {
  id: string;
  category: string;
  content: string;
  contentSpanish?: string;
  tags: string[];
  attributes: string[];
  similarityScore?: number;
  timestamp: string;
  title?: string;
  authorName?: string;
  authorId?: string;
}

interface PostCardProps {
  post: Post | DisplayPost;
  delayIndex: number;
  onConnect?: (post: Post | DisplayPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, delayIndex, onConnect }) => {
  const displayPost = post as DisplayPost;
  const isSpanish = localStorage.getItem('preferredLanguage') === 'ES';
  const content = isSpanish && displayPost.contentSpanish ? displayPost.contentSpanish : post.content;

  return (
    <article className={`post-card animate-in delay-${(delayIndex % 3) + 1}`}>
      <div className="post-header">
        <div className="post-meta">
          <span className="post-type-badge">{post.category}</span>
          {displayPost.title && (
            <span className="post-title-text">{displayPost.title}</span>
          )}
          <span className="post-author">
            <UserIcon /> {displayPost.authorName || 'Unknown User'}
          </span>
        </div>
        {post.similarityScore && (
          <div className="similarity-score" title="Match Similarity">
            <ActivityIcon />
            {post.similarityScore}% Match
          </div>
        )}
      </div>

      <p className="post-content">"{content}"</p>

      <div className="post-tags">
        {post.tags.map((tag, idx) => (
          <span key={idx} className="post-tag">#{tag}</span>
        ))}
        {post.attributes.map((attr, idx) => (
          <span key={`attr-${idx}`} className="post-tag" style={{ background: 'rgba(255, 107, 53, 0.05)', color: 'var(--nika-orange)' }}>
             {attr}
          </span>
        ))}
      </div>

      <div className="post-footer">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.timestamp}</span>
        <button 
          className="action-btn"
          onClick={() => onConnect?.(post)}
        >
          Connect
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </article>
  );
};

export default PostCard;
