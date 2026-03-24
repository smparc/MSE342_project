import React, { useState, useRef, useContext } from 'react';
import './CourseSubmit.css';
import { FirebaseContext, authFetch } from '../Firebase';

const API = process.env.REACT_APP_API_URL || '';

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];

const INITIAL_FORM = {
  username: '',
  uw_course_code: '',
  uw_course_name: '',
  host_course_code: '',
  host_course_name: '',
  host_university: '',
  country: '',
  continent: '',
  term_taken: '',
  proof_url: '',
};

export default function CourseSubmit({ currentUser, authUser }) {
  const firebase      = useContext(FirebaseContext);
  const effectiveUser = currentUser || authUser?.email?.split('@')[0] || '';
  const [form, setForm]           = useState({ ...INITIAL_FORM, username: effectiveUser });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(null);
  const [apiError, setApiError]   = useState('');

  // Edit mode
  const [editId, setEditId] = useState(null);

  // Story 4 AC4 — anonymous posting option
  const [isAnonymous, setIsAnonymous] = useState(false);

  // File upload
  const [proofFile, setProofFile] = useState(null);
  const fileRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.uw_course_code.trim()) e.uw_course_code = 'UW course code is required';
    else if (!/^[A-Z]{2,6}\s?\d{3}[A-Z]?$/i.test(form.uw_course_code.trim()))
      e.uw_course_code = 'Use format like MSCI 342 or CS 341';
    if (!form.uw_course_name.trim()) e.uw_course_name = 'UW course name is required';
    if (!form.host_course_code.trim()) e.host_course_code = 'Host course code is required';
    if (!form.host_course_name.trim()) e.host_course_name = 'Host course name is required';
    if (!form.host_university.trim()) e.host_university = 'Host university is required';
    if (!form.proof_url.trim() && !proofFile) e.proof_url = 'Proof document is required';
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFile(file);
    setForm((prev) => ({ ...prev, proof_url: `uploads/${file.name}` }));
    setErrors((prev) => ({ ...prev, proof_url: '' }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      const firstKey = Object.keys(e)[0];
      const el = document.getElementById(`cs-field-${firstKey}`);
      if (el) el.focus();
      return;
    }

    setSubmitting(true);
    setApiError('');
    setSuccess(null);

    try {
      const endpoint = editId ? `/api/courses/${editId}` : '/api/courses';
      const method   = editId ? 'PUT' : 'POST';

      const res = await authFetch(`${API}${endpoint}`, {
        method,
        // Story 4 AC4 — include is_anonymous in submission
        body: JSON.stringify({ ...form, is_anonymous: isAnonymous ? 1 : 0 }),
      }, firebase);

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setApiError('This course equivalency has already been submitted. Please check the database.');
          return;
        }
        if (data.fields) {
          const serverErrors = {};
          data.fields.forEach((f) => (serverErrors[f] = 'This field is required'));
          setErrors(serverErrors);
          return;
        }
        setApiError(data.error || 'Submission failed. Please try again.');
        return;
      }

      setSuccess({ message: data.message, status: data.status, course_id: data.course_id });
      setForm({ ...INITIAL_FORM, username: effectiveUser });
      setProofFile(null);
      setEditId(null);
      setIsAnonymous(false);
    } catch {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isProofReady = !!(form.proof_url.trim() || proofFile);

  return (
    <div className="csub-wrap">
      <div className="csub-header">
        <h1 className="csub-title">Upload Course Equivalency</h1>
        <p className="csub-subtitle">
          Help future students by sharing courses you matched during your exchange.
          All submissions are reviewed before going live.
        </p>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="csub-success">
          <div className="csub-success-icon">✓</div>
          <div>
            <strong>{success.message}</strong>
            <p>Status: <span className="csub-pending-badge">{success.status}</span></p>
          </div>
          <button className="csub-success-close" onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}

      {/* API Error */}
      {apiError && (
        <div className="csub-api-error">⚠ {apiError}</div>
      )}

      <div className="csub-form">
        {/* ── UW Equivalent ── */}
        <div className="csub-section">
          <h3 className="csub-section-title">UW Course Equivalent</h3>
          <div className="csub-row">
            <div className="csub-field">
              <label className="csub-label" htmlFor="cs-field-uw_course_code">
                UW Course Code <span className="csub-req">*</span>
              </label>
              <input
                id="cs-field-uw_course_code"
                className={`csub-input ${errors.uw_course_code ? 'error' : ''}`}
                placeholder="e.g. MSCI 342"
                value={form.uw_course_code}
                onChange={(e) => handleChange('uw_course_code', e.target.value.toUpperCase())}
              />
              {errors.uw_course_code && <span className="csub-error-msg">{errors.uw_course_code}</span>}
            </div>
            <div className="csub-field csub-field-wide">
              <label className="csub-label" htmlFor="cs-field-uw_course_name">
                UW Course Name <span className="csub-req">*</span>
              </label>
              <input
                id="cs-field-uw_course_name"
                className={`csub-input ${errors.uw_course_name ? 'error' : ''}`}
                placeholder="e.g. Engineering Economics"
                value={form.uw_course_name}
                onChange={(e) => handleChange('uw_course_name', e.target.value)}
              />
              {errors.uw_course_name && <span className="csub-error-msg">{errors.uw_course_name}</span>}
            </div>
          </div>
        </div>

        {/* ── Host Course ── */}
        <div className="csub-section">
          <h3 className="csub-section-title">Host Institution Course</h3>
          <div className="csub-row">
            <div className="csub-field">
              <label className="csub-label" htmlFor="cs-field-host_course_code">
                Host Course Code <span className="csub-req">*</span>
              </label>
              <input
                id="cs-field-host_course_code"
                className={`csub-input ${errors.host_course_code ? 'error' : ''}`}
                placeholder="e.g. BUS 201"
                value={form.host_course_code}
                onChange={(e) => handleChange('host_course_code', e.target.value)}
              />
              {errors.host_course_code && <span className="csub-error-msg">{errors.host_course_code}</span>}
            </div>
            <div className="csub-field csub-field-wide">
              <label className="csub-label" htmlFor="cs-field-host_course_name">
                Host Course Name <span className="csub-req">*</span>
              </label>
              <input
                id="cs-field-host_course_name"
                className={`csub-input ${errors.host_course_name ? 'error' : ''}`}
                placeholder="e.g. Introduction to Business"
                value={form.host_course_name}
                onChange={(e) => handleChange('host_course_name', e.target.value)}
              />
              {errors.host_course_name && <span className="csub-error-msg">{errors.host_course_name}</span>}
            </div>
          </div>
        </div>

        {/* ── Host University ── */}
        <div className="csub-section">
          <h3 className="csub-section-title">Host University Details</h3>
          <div className="csub-row">
            <div className="csub-field csub-field-wide">
              <label className="csub-label" htmlFor="cs-field-host_university">
                Host University <span className="csub-req">*</span>
              </label>
              <input
                id="cs-field-host_university"
                className={`csub-input ${errors.host_university ? 'error' : ''}`}
                placeholder="e.g. University of Melbourne"
                value={form.host_university}
                onChange={(e) => handleChange('host_university', e.target.value)}
              />
              {errors.host_university && <span className="csub-error-msg">{errors.host_university}</span>}
            </div>
            <div className="csub-field">
              <label className="csub-label" htmlFor="cs-field-country">Country</label>
              <input
                id="cs-field-country"
                className="csub-input"
                placeholder="e.g. Australia"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
          </div>
          <div className="csub-row">
            <div className="csub-field">
              <label className="csub-label">Continent</label>
              <select
                className="csub-input csub-select"
                value={form.continent}
                onChange={(e) => handleChange('continent', e.target.value)}
              >
                <option value="">Select continent</option>
                {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="csub-field">
              <label className="csub-label">Exchange Term</label>
              <input
                className="csub-input"
                placeholder="e.g. Fall 2023, Spring 2024"
                value={form.term_taken}
                onChange={(e) => handleChange('term_taken', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Proof Upload ── */}
        <div className="csub-section">
          <h3 className="csub-section-title">
            Proof of Match <span className="csub-req">*</span>
          </h3>
          <p className="csub-proof-hint">
            Upload a PDF of your grade report, email from faculty advisor, or official transcript.
          </p>
          <div
            className={`csub-upload-area ${proofFile ? 'has-file' : ''} ${errors.proof_url ? 'error' : ''}`}
            onClick={() => fileRef.current.click()}
          >
            {proofFile ? (
              <div className="csub-file-info">
                <span className="csub-file-icon">📄</span>
                <span className="csub-file-name">{proofFile.name}</span>
                <button
                  className="csub-file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProofFile(null);
                    setForm((prev) => ({ ...prev, proof_url: '' }));
                    fileRef.current.value = '';
                  }}
                >Remove</button>
              </div>
            ) : (
              <div className="csub-upload-placeholder">
                <span className="csub-upload-icon">⬆</span>
                <p>Click to upload PDF or image</p>
                <small>PDF, PNG, JPG up to 10 MB</small>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div style={{ marginTop: '0.6rem' }}>
            <label className="csub-label">Or paste a link to proof</label>
            <input
              id="cs-field-proof_url"
              className={`csub-input ${errors.proof_url ? 'error' : ''}`}
              placeholder="https://…"
              value={proofFile ? `uploads/${proofFile.name}` : form.proof_url}
              onChange={(e) => handleChange('proof_url', e.target.value)}
              disabled={!!proofFile}
            />
          </div>
          {errors.proof_url && <span className="csub-error-msg">{errors.proof_url}</span>}
        </div>

        {/* ── Submitter info + Anonymous option ── */}
        <div className="csub-section">
          <h3 className="csub-section-title">Your Account</h3>
          <div className="csub-row">
            <div className="csub-field" style={{ maxWidth: '240px' }}>
              <label className="csub-label" htmlFor="cs-field-username">
                Username <span className="csub-req">*</span>
              </label>
              <input
                id="cs-field-username"
                className={`csub-input ${errors.username ? 'error' : ''}`}
                placeholder="your username"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
              {errors.username && <span className="csub-error-msg">{errors.username}</span>}
            </div>
          </div>

          {/* Story 4 AC4 — anonymous posting checkbox */}
          <div className="csub-anon-row">
            <label className="csub-anon-label">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                aria-label="Post anonymously"
              />
              <span>Post anonymously</span>
            </label>
            <p className="csub-anon-hint">
              Your name will be hidden and shown as "Anonymous" to other students.
            </p>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="csub-footer">
          <p className="csub-footer-note">
            {!isProofReady
              ? '⚠ Please upload proof before submitting'
              : '✓ Proof provided — ready to submit'}
          </p>
          <button
            className="csub-submit-btn"
            disabled={!isProofReady || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting…' : editId ? 'Update Course' : 'Submit Course'}
          </button>
        </div>
      </div>
    </div>
  );
}