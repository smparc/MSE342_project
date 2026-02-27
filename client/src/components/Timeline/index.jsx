import React, { useState, useEffect, useCallback } from 'react';
import './Timeline.css';

const API = process.env.REACT_APP_API_URL || '';

// Format date in both local EST and host timezone (AC#6)
const fmtDualTime = (utcStr) => {
  if (!utcStr) return { est: '—', utc: '—' };
  const d = new Date(utcStr);
  const est = d.toLocaleString('en-US', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' });
  return est;
};

const MILESTONE_TYPES = ['UW Internal', 'Host University'];

export default function Timeline({ currentUser }) {
  const [milestones, setMilestones] = useState([]);
  const [filter, setFilter] = useState('');      // '' | 'UW Internal' | 'Host University'
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Add milestone form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '', deadline_utc: '', milestone_type: 'UW Internal', form_link: '', prerequisite_id: '',
  });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  const fetchMilestones = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: filter });
      const res = await fetch(`${API}/api/users/${currentUser}/milestones?${params}`);
      const data = await res.json();
      setMilestones(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  }, [currentUser, filter]);

  useEffect(() => { fetchMilestones(); }, [fetchMilestones]);

  // Mark complete toggle (AC#3)
  const toggleComplete = async (m) => {
    await fetch(`${API}/api/milestones/${m.milestone_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: !m.is_completed }),
    });
    fetchMilestones();
  };

  // Delete milestone
  const deleteMilestone = async (id) => {
    if (!window.confirm('Delete this milestone?')) return;
    await fetch(`${API}/api/milestones/${id}`, { method: 'DELETE' });
    fetchMilestones();
  };

  // Export .ics (AC#8)
  const exportICS = () => {
    window.open(`${API}/api/users/${currentUser}/milestones/export`, '_blank');
  };

  // Add milestone
  const validateAdd = () => {
    const e = {};
    if (!addForm.title.trim()) e.title = 'Title is required';
    if (!addForm.deadline_utc) e.deadline_utc = 'Deadline is required';
    if (!addForm.milestone_type) e.milestone_type = 'Type is required';
    return e;
  };

  const submitAdd = async () => {
    const e = validateAdd();
    if (Object.keys(e).length) { setAddErrors(e); return; }
    setAddLoading(true);
    try {
      await fetch(`${API}/api/users/${currentUser}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          prerequisite_id: addForm.prerequisite_id || null,
        }),
      });
      setShowAdd(false);
      setAddForm({ title: '', deadline_utc: '', milestone_type: 'UW Internal', form_link: '', prerequisite_id: '' });
      fetchMilestones();
    } catch {
      setAddErrors({ submit: 'Failed to add milestone' });
    } finally {
      setAddLoading(false);
    }
  };

  // Progress calculation
  const completed = milestones.filter((m) => m.is_completed).length;
  const total = milestones.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  // Status styling helper
  const getMilestoneClass = (m) => {
    if (m.is_completed) return 'ms-done';
    if (m.is_overdue) return 'ms-overdue';
    if (m.is_approaching_48h) return 'ms-urgent';
    if (m.is_approaching_7d) return 'ms-soon';
    return 'ms-upcoming';
  };

  const getStatusLabel = (m) => {
    if (m.is_completed) return { text: 'Complete', cls: 'sl-done' };
    if (m.is_overdue) return { text: 'Overdue', cls: 'sl-overdue' };
    if (m.is_approaching_48h) return { text: '< 48 hrs', cls: 'sl-urgent' };
    if (m.is_approaching_7d) return { text: 'Due soon', cls: 'sl-soon' };
    return { text: m.milestone_type, cls: m.milestone_type === 'UW Internal' ? 'sl-uw' : 'sl-host' };
  };

  return (
    <div className="tl-wrap">
      {/* ── Header ── */}
      <div className="tl-header">
        <div>
          <h1 className="tl-title">Exchange Timeline</h1>
          <p className="tl-subtitle">Track all your important application deadlines in one place</p>
        </div>
        <div className="tl-header-actions">
          <button className="tl-btn tl-btn-outline" onClick={exportICS}>
            ↓ Export .ics
          </button>
          <button className="tl-btn tl-btn-primary" onClick={() => setShowAdd(true)}>
            + Add Milestone
          </button>
        </div>
      </div>

      {/* ── Progress bar (AC#3) ── */}
      <div className="tl-progress-card">
        <div className="tl-progress-top">
          <span className="tl-progress-label">Application Progress</span>
          <span className="tl-progress-pct">{completed}/{total} milestones complete</span>
        </div>
        <div className="tl-progress-bar-wrap">
          <div className="tl-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="tl-progress-pct-txt">{progress}%</div>
      </div>

      {/* ── Filter toggle (AC#9) ── */}
      <div className="tl-filter-row">
        <button
          className={`tl-filter-btn ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >All</button>
        {MILESTONE_TYPES.map((t) => (
          <button
            key={t}
            className={`tl-filter-btn ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter((prev) => prev === t ? '' : t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="tl-legend">
        <span className="tl-legend-item"><span className="dot dot-urgent" />Due in 48h</span>
        <span className="tl-legend-item"><span className="dot dot-soon" />Due in 7 days</span>
        <span className="tl-legend-item"><span className="dot dot-overdue" />Overdue</span>
        <span className="tl-legend-item"><span className="dot dot-done" />Complete</span>
      </div>

      {/* ── Timeline ── */}
      {loading ? (
        <div className="tl-loading">Loading milestones…</div>
      ) : milestones.length === 0 ? (
        <div className="tl-empty">
          <div className="tl-empty-icon">📅</div>
          <h3>No milestones yet</h3>
          <p>Add your first deadline to get started tracking your exchange application.</p>
          <button className="tl-btn tl-btn-primary" onClick={() => setShowAdd(true)}>
            + Add Milestone
          </button>
        </div>
      ) : (
        <div className="tl-list">
          {milestones.map((m, i) => {
            const status = getStatusLabel(m);
            const isExpanded = expandedId === m.milestone_id;
            const isLocked =
              m.prerequisite_id &&
              !m.prerequisite_completed &&
              !m.is_completed;

            return (
              <div
                key={m.milestone_id}
                className={`tl-milestone ${getMilestoneClass(m)} ${isLocked ? 'locked' : ''}`}
              >
                {/* Connector line */}
                {i < milestones.length - 1 && (
                  <div className={`tl-connector ${m.is_completed ? 'done' : ''}`} />
                )}

                <div className="tl-ms-left">
                  {/* Checkbox (AC#3) */}
                  <button
                    className={`tl-checkbox ${m.is_completed ? 'checked' : ''} ${isLocked ? 'disabled' : ''}`}
                    onClick={() => !isLocked && toggleComplete(m)}
                    title={isLocked ? `Complete "${m.prerequisite_title}" first` : 'Mark complete'}
                  >
                    {m.is_completed ? '✓' : isLocked ? '🔒' : ''}
                  </button>
                </div>

                <div className="tl-ms-body" onClick={() => setExpandedId(isExpanded ? null : m.milestone_id)}>
                  <div className="tl-ms-top">
                    <div className="tl-ms-title-row">
                      <span className="tl-ms-title">{m.title}</span>
                      <span className={`tl-status-label ${status.cls}`}>{status.text}</span>
                    </div>

                    <div className="tl-ms-meta">
                      {/* EST deadline (AC#6) */}
                      <span className="tl-ms-date">📅 {fmtDualTime(m.deadline_utc)} EST</span>
                      {m.milestone_type && (
                        <span className={`tl-type-badge ${m.milestone_type === 'UW Internal' ? 'uw' : 'host'}`}>
                          {m.milestone_type}
                        </span>
                      )}
                    </div>

                    {/* Prerequisite dependency (AC#7) */}
                    {m.prerequisite_id && (
                      <div className="tl-prereq">
                        {isLocked ? '🔒' : '✓'} Requires: <em>{m.prerequisite_title}</em>
                      </div>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="tl-ms-detail">
                      {m.form_link && (
                        <a href={m.form_link} target="_blank" rel="noreferrer" className="tl-form-link">
                          → Open Required Form / Portal
                        </a>
                      )}

                      {/* Buffer status (AC#10) */}
                      {m.is_completed && m.buffer_days !== null && (
                        <div className="tl-buffer">
                          {m.buffer_days > 0
                            ? `🎯 Buffer Status: ${m.buffer_days} days ahead of deadline`
                            : m.buffer_days === 0
                            ? '⏱ Completed exactly on deadline'
                            : `⚠ Completed ${Math.abs(m.buffer_days)} days after deadline`}
                        </div>
                      )}

                      <div className="tl-ms-actions">
                        {!isLocked && (
                          <button
                            className="tl-action-btn tl-toggle-btn"
                            onClick={(e) => { e.stopPropagation(); toggleComplete(m); }}
                          >
                            {m.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                          </button>
                        )}
                        <button
                          className="tl-action-btn tl-delete-btn"
                          onClick={(e) => { e.stopPropagation(); deleteMilestone(m.milestone_id); }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Milestone Modal ── */}
      {showAdd && (
        <div className="tl-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tl-modal-close" onClick={() => setShowAdd(false)}>✕</button>
            <h2 className="tl-modal-title">Add Milestone</h2>

            <div className="tl-form-field">
              <label>Title *</label>
              <input
                className={`tl-input ${addErrors.title ? 'error' : ''}`}
                placeholder="e.g. Submit Study Plan to WaterlooAbroad"
                value={addForm.title}
                onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
              />
              {addErrors.title && <span className="tl-field-err">{addErrors.title}</span>}
            </div>

            <div className="tl-form-field">
              <label>Deadline (UTC) *</label>
              <input
                type="datetime-local"
                className={`tl-input ${addErrors.deadline_utc ? 'error' : ''}`}
                value={addForm.deadline_utc}
                onChange={(e) => setAddForm((p) => ({ ...p, deadline_utc: e.target.value }))}
              />
              {addErrors.deadline_utc && <span className="tl-field-err">{addErrors.deadline_utc}</span>}
            </div>

            <div className="tl-form-field">
              <label>Type *</label>
              <select
                className="tl-input"
                value={addForm.milestone_type}
                onChange={(e) => setAddForm((p) => ({ ...p, milestone_type: e.target.value }))}
              >
                {MILESTONE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="tl-form-field">
              <label>Link to Form / Portal (optional)</label>
              <input
                className="tl-input"
                placeholder="https://waterlooabroad.uwaterloo.ca/…"
                value={addForm.form_link}
                onChange={(e) => setAddForm((p) => ({ ...p, form_link: e.target.value }))}
              />
            </div>

            <div className="tl-form-field">
              <label>Prerequisite Milestone ID (optional)</label>
              <select
                className="tl-input"
                value={addForm.prerequisite_id}
                onChange={(e) => setAddForm((p) => ({ ...p, prerequisite_id: e.target.value }))}
              >
                <option value="">None</option>
                {milestones.map((m) => (
                  <option key={m.milestone_id} value={m.milestone_id}>{m.title}</option>
                ))}
              </select>
            </div>

            {addErrors.submit && <div className="tl-field-err">{addErrors.submit}</div>}

            <div className="tl-modal-footer">
              <button className="tl-btn tl-btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="tl-btn tl-btn-primary" onClick={submitAdd} disabled={addLoading}>
                {addLoading ? 'Adding…' : 'Add Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}