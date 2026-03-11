import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignOut.css';

const API = process.env.REACT_APP_API_URL || '';

const SignOut = ({ currentUser, onSignOut, requireConfirm = false }) => {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const doSignOut = async () => {
    try {
      await fetch(`${API}/api/auth/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser }),
      });
    } catch { /* fire and forget */ }

    if (onSignOut) onSignOut();
    navigate('/');
  };

  const handleClick = () => {
    if (requireConfirm) {
      setConfirming(true);
    } else {
      doSignOut();
    }
  };

  return (
    <>
      <button className="so-btn" onClick={handleClick}>
        Sign Out
      </button>

      {confirming && (
        <div className="so-confirm-overlay">
          <div className="so-confirm-modal">
            <p>Are you sure you want to sign out?</p>
            <div className="so-confirm-btns">
              <button className="so-cancel-btn" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button className="so-confirm-btn" onClick={doSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignOut;