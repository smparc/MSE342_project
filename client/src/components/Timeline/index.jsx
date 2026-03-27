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

// Sprint 2 — phase order for grouping (Story 1)
const PHASES = [
  'Info Session',
  'Research',
  'Application',
  'Course Matching',
  'Pre-departure Training',
];

export default function Timeline({ currentUser, destination: destProp }) {
  const [milestones, setMilestones] = useState([]);
  const [filter, setFilter] = useState('');      // '' | 'UW Internal' | 'Host University'
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Sprint 2 — phase and destination filter state (Stories 1, 2, 3)
  const [phaseFilter, setPhaseFilter] = useState('');
  const [destFilter, setDestFilter] = useState(destProp || '');

  const fetchMilestones = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: filter });
      // Sprint 2 — pass phase and destination filters to API (Stories 1 & 2)
      if (phaseFilter)  params.set('phase', phaseFilter);
      if (destFilter)   params.set('destination', destFilter);
      const res = await fetch(`${API}/api/users/${currentUser}/milestones?${params}`);
      const data = await res.json();
      setMilestones(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  }, [currentUser, filter, phaseFilter, destFilter]);

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

  // Sprint 2 — group milestones by phase for display (Story 1)
  const groupedByPhase = PHASES.reduce((acc, phase) => {
    const items = milestones.filter((m) => m.phase === phase);
    if (items.length) acc[phase] = items;
    return acc;
  }, {});

  // Sprint 2 — milestones with no phase go into a fallback group
  const ungrouped = milestones.filter((m) => !m.phase || !PHASES.includes(m.phase));

  // Sprint 2 — check if a milestone matches the active destination filter (Story 3 / AC#3)
  const isDestMatch = (m) => destFilter && m.destination_country === destFilter;

  return (
    <div className="tl-wrap">
      {/* ── Header ── */}
      <div className="tl-header">
        <div>
          <h1 className="tl-title">Exchange Timeline</h1>
          <p className="tl-subtitle">Track all your important application deadlines in one place</p>
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

      {/* Sprint 2 — Phase and destination filters (Stories 1, 2, 3) */}
      <div className="tl-filter-row tl-filter-row--sprint2">
        <div className="tl-filter-field">
          <label htmlFor="tl-phase-select">Phase</label>
          <select
            id="tl-phase-select"
            className="tl-select"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            aria-label="Phase"
          >
            <option value="">All Phases</option>
            {PHASES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="tl-filter-field">
          <label htmlFor="tl-dest-input">Destination</label>
          <input
            id="tl-dest-input"
            className="tl-input tl-input--sm"
            type="text"
            placeholder="e.g. Australia"
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            aria-label="Destination"
          />
        </div>

        {(phaseFilter || destFilter) && (
          <button
            className="tl-clear-filters"
            onClick={() => { setPhaseFilter(''); setDestFilter(''); }}
          >
            Clear filters
          </button>
        )}
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
          <p>Your deadlines and checklist items will appear here.</p>
        </div>
      ) : (
        <div className="tl-phases">
          {/* Sprint 2 — render milestones grouped by phase (Story 1) */}
          {Object.entries(groupedByPhase).map(([phase, items]) => (
            <div key={phase} className="tl-phase-group">
              <h2 className="tl-phase-heading">{phase}</h2>
              <div className="tl-list">
                {items.map((m, i) => renderMilestone(m, i, items.length))}
              </div>
            </div>
          ))}

          {/* Fallback for milestones with no phase */}
          {ungrouped.length > 0 && (
            <div className="tl-phase-group">
              <div className="tl-list">
                {ungrouped.map((m, i) => renderMilestone(m, i, ungrouped.length))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );

  // Sprint 2 — extracted milestone renderer so it can be reused in each phase group
  function renderMilestone(m, i, groupLength) {
    const status = getStatusLabel(m);
    const isExpanded = expandedId === m.milestone_id;
    const isLocked =
      m.prerequisite_id &&
      !m.prerequisite_completed &&
      !m.is_completed;

    // Sprint 2 — highlight if milestone matches destination filter (Story 3 / AC#3)
    const destHighlight = isDestMatch(m) ? 'destination-match' : '';

    return (
      <div
        key={m.milestone_id}
        className={`tl-milestone ${getMilestoneClass(m)} ${isLocked ? 'locked' : ''} ${destHighlight}`}
      >
        {/* Connector line */}
        {i < groupLength - 1 && (
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
              {/* Sprint 2 — days remaining counter (Story 2 / AC#2) */}
              {!m.is_completed && m.days_remaining !== undefined && (
                <span className="tl-days-remaining">
                  {m.days_remaining} days remaining
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
  }
}