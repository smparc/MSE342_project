import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeleteAccount.css';
import { FirebaseContext } from '../Firebase';

const API = process.env.REACT_APP_API_URL || '';

// step: 'idle' → 'confirm' → 'password' → 'farewell'
const DeleteAccount = ({ currentUser, onDeleted }) => {
  const firebase = React.useContext(FirebaseContext);
  const navigate = useNavigate();
  const [step, setStep] = useState('idle');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = () => setStep('confirm');
  const handleNo = () => { setStep('idle'); setError(''); };
  const handleYes = () => setStep('password');

  const handleConfirm = async () => {
    if (!password.trim()) { setError('Please enter your password.'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/users/${currentUser}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Password incorrect');
        setPassword('');
        setLoading(false);
        return;
      }

      setStep('farewell');
      setTimeout(() => {
        if (onDeleted) onDeleted();
        firebase.doSignOut().then(() => {
          navigate('/');
        });
      }, 2500);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="da-container">
      {/* Idle state — just the button */}
      {step === 'idle' && (
        <button className="da-delete-btn" onClick={handleDeleteClick}>
          Delete my account
        </button>
      )}

      {/* Step 1 — Are you sure? */}
      {step === 'confirm' && (
        <div className="da-modal-overlay">
          <div className="da-modal">
            <h3 className="da-modal-title">Delete Account</h3>
            <p className="da-modal-body">
              Are you sure you want to delete your account?
              <br />
              <strong>This action cannot be undone.</strong>
            </p>
            <div className="da-btn-row">
              <button className="da-btn-no" onClick={handleNo}>No</button>
              <button className="da-btn-yes" onClick={handleYes}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Password confirmation */}
      {step === 'password' && (
        <div className="da-modal-overlay">
          <div className="da-modal">
            <h3 className="da-modal-title">Confirm Your Password</h3>
            <p className="da-modal-body">
              Enter your password to permanently delete your account.
            </p>
            <input
              className={`da-pw-input ${error ? 'da-input-error' : ''}`}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
            {error && <div className="da-error">{error}</div>}
            <div className="da-btn-row">
              <button className="da-btn-cancel" onClick={handleNo} disabled={loading}>
                Cancel
              </button>
              <button className="da-btn-confirm" onClick={handleConfirm} disabled={loading}>
                {loading ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Farewell */}
      {step === 'farewell' && (
        <div className="da-modal-overlay">
          <div className="da-modal da-farewell">
            <div className="da-farewell-icon">👋</div>
            <p className="da-farewell-msg">
              You have deleted your account. Farewell!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;