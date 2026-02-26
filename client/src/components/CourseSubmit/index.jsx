import React, { useState, useRef } from 'react';
import './CourseSubmit.css';

const API = process.env.REACT_APP_API_URL || '';

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
const UW_FACULTIES = [
  { code: 'MSCI', label: 'Management Sciences' },
  { code: 'CS', label: 'Computer Science' },
  { code: 'ECE', label: 'Electrical & Computer Eng.' },
  { code: 'SYDE', label: 'Systems Design Engineering' },
  { code: 'MATH', label: 'Mathematics' },
  { code: 'STAT', label: 'Statistics' },
  { code: 'BUS', label: 'Business' },
  { code: 'ECON', label: 'Economics' },
  { code: 'PHYS', label: 'Physics' },
  { code: 'CHEM', label: 'Chemistry' },
  { code: 'BIOL', label: 'Biology' },
  { code: 'ENGL', label: 'English' },
];

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

export default function CourseSubmit({ currentUser }) {
  const [form, setForm] = useState({ ...INITIAL_FORM, username: currentUser || '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);   // AC#6 upload: visible confirmation
  const [apiError, setApiError] = useState('');

  // Edit mode
  const [editId, setEditId] = useState(null);

  // File upload simulation (stores filename; real app would upload to S3/server)
  const [proofFile, setProofFile] = useState(null);
  const fileRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.uw_course_code.trim()) e.uw_course_code = 'UW course code is required';
    else if (!/^[A-Z]{2,6}\s?\d{3}[A-Z]?$/i.test(form.uw_course_code.trim()))
      e.uw_course_code = 'Use format like MSCI 342 or CS 341';  // AC#5 upload
    if (!form.uw_course_name.trim()) e.uw_course_name = 'UW course name is required';
    if (!form.host_course_code.trim()) e.host_course_code = 'Host course code is required';
    if (!form.host_course_name.trim()) e.host_course_name = 'Host course name is required';
    if (!form.host_university.trim()) e.host_university = 'Host university is required';
    if (!form.proof_url.trim() && !proofFile) e.proof_url = 'Proof document is required';  // AC#9 upload
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
    // Simulate file URL (in production, upload to storage first)
    setForm((prev) => ({ ...prev, proof_url: `uploads/${file.name}` }));
    setErrors((prev) => ({ ...prev, proof_url: '' }));
  };

  const handleSubmit = async () => {
    const e = validate();

    // Focus first error field (AC#8 upload)
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
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(`${API}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // Duplicate entry (AC#4)
        if (res.status === 409) {
          setApiError('This course equivalency has already been submitted. Please check the database.');
          return;
        }
        // Missing fields highlighted by server
        if (data.fields) {
          const serverErrors = {};
          data.fields.forEach((f) => (serverErrors[f] = 'This field is required'));
          setErrors(serverErrors);
          return;
        }
        setApiError(data.error || 'Submission failed. Please try again.');
        return;
      }

      // AC#6: visible confirmation; AC#10: Pending Review status
      setSuccess({
        message: data.message,
        status: data.status,
        course_id: data.course_id,
      });

      // Reset form
      setForm({ ...INITIAL_FORM, username: currentUser || '' });
      setProofFile(null);
      setEditId(null);
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

      {/* Success Banner (AC#6, AC#10) */}
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
        <div className="csub-api-error">
          ⚠ {apiError}
        </div>
      )}

      <div className="csub-form">
        {/* ── Section: UW Equivalent ── */}
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
              {errors.uw_course_code && (
                <span className="csub-error-msg">{errors.uw_course_code}</span>
              )}
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
              {errors.uw_course_name && (
                <span className="csub-error-msg">{errors.uw_course_name}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Section: Host Course ── */}
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
              {errors.host_course_code && (
                <span className="csub-error-msg">{errors.host_course_code}</span>
              )}
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
              {errors.host_course_name && (
                <span className="csub-error-msg">{errors.host_course_name}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Section: Host University ── */}
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
              {errors.host_university && (
                <span className="csub-error-msg">{errors.host_university}</span>
              )}
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

        {/* ── Section: Proof Upload (AC#9) ── */}
        <div className="csub-section">
          <h3 className="csub-section-title">
            Proof of Match <span className="csub-req">*</span>
          </h3>
          <p className="csub-proof-hint">
            Upload a PDF of your grade report, email from faculty advisor, or official transcript.
            The submit button will only activate once proof is provided.
          </p>

          <div className={`csub-upload-area ${proofFile ? 'has-file' : ''} ${errors.proof_url ? 'error' : ''}`}
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

        {/* ── Submitter info ── */}
        <div className="csub-section">
          <h3 className="csub-section-title">Your Account</h3>
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

        {/* ── Submit Button (disabled until proof ready — AC#9) ── */}
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