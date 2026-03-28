import React from 'react';
import type { Post } from '../data/mockData';

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px', marginRight: '4px' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

interface PostCardProps {
  post: Post;
  delayIndex: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, delayIndex }) => {
  return (
    <article className={`post-card animate-in delay-${(delayIndex % 3) + 1}`}>
      <div className="post-header">
        <div className="post-meta">
          <span className="post-type-badge">{post.category}</span>
          <span className="post-author">
            <ShieldIcon /> Anonymized User
          </span>
        </div>
        {post.similarityScore && (
          <div className="similarity-score" title="Match Similarity">
            <ActivityIcon />
            {post.similarityScore}% Match
          </div>
        )}
      </div>

      <p className="post-content">"{post.content}"</p>

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
        <button className="action-btn">
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
