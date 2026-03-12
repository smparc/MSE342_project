import React, { useState, useEffect } from 'react';
import './UserTags.css';

const API = process.env.REACT_APP_API_URL || '';

const TAG_LABELS = {
  program: 'Program',
  year:    'Year',
  country: 'Destination',
  school:  'Host School',
  term:    'Term',
};

const TAG_ICONS = {
  program: '🎓',
  year:    '📅',
  country: '🌏',
  school:  '🏫',
  term:    '📆',
};

const UserTags = ({ username }) => {
  const [tags, setTags]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!username) return;
    fetch(`${API}/api/users/${username}/tags`)
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then(data => { setTags(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [username]);

  if (loading) return <div className="ut-loading">Loading tags...</div>;
  if (error)   return null;

  if (tags.length === 0) {
    return <div className="ut-empty">No tags yet</div>;
  }

  return (
    <div className="ut-container">
      {tags.map(tag => (
        <div key={tag.tag_id} className={`ut-tag ut-tag--${tag.tag_type}`}>
          <span className="ut-tag-icon">{TAG_ICONS[tag.tag_type] || '🏷'}</span>
          <div className="ut-tag-content">
            <span className="ut-tag-type">{TAG_LABELS[tag.tag_type] || tag.tag_type}</span>
            <span className="ut-tag-value">{tag.tag_value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserTags;