import React, { useState } from 'react';
import './UserTypeSelect.css';

const API = process.env.REACT_APP_API_URL || '';

const USER_TYPES = [
  { value: 'current_exchange', label: 'Current Exchange Student',
    description: 'Currently studying abroad at a host institution.' },
  { value: 'prospective', label: 'Prospective Exchange Student',
    description: 'Planning or applying for a future exchange program.' },
  { value: 'alumni', label: 'Exchange Alumni',
    description: 'Completed an exchange program and sharing experience.' },
  { value: 'browsing', label: 'Just Browsing',
    description: 'A UW student exploring exchange options for the future.' },
];

const UserTypeSelect = ({ currentUser, currentUserType = '', onSaved }) => {
  const [selected, setSelected] = useState(currentUserType);
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/users/${currentUser}/type`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: selected }),
      });
      setSaved(true);
      if (onSaved) onSaved(selected);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uts-container">
      <h2 className="uts-title">What best describes you?</h2>
      <p className="uts-subtitle">
        This helps other users understand your experience and intentions.
      </p>

      <div className="uts-options">
        {USER_TYPES.map(type => (
          <label key={type.value} className={`uts-option ${selected === type.value ? 'uts-option--selected' : ''}`}>
            <input
              type="radio"
              name="user_type"
              value={type.value}
              checked={selected === type.value}
              onChange={() => setSelected(type.value)}
              aria-label={type.label}
            />
            <div className="uts-option-content">
              <span className="uts-option-label">{type.label}</span>
              <span className="uts-option-desc">{type.description}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="uts-footer">
        <button
          className="uts-save-btn"
          onClick={handleSave}
          disabled={!selected || loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {saved && <span className="uts-saved-msg">✓ Saved successfully!</span>}
      </div>
    </div>
  );
};

export default UserTypeSelect;