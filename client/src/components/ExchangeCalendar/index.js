import React, { useState, useEffect, useCallback } from 'react';
import './ExchangeCalendar.css';
import '../Timeline/Timeline.css';

const API = process.env.REACT_APP_API_URL || '';

const PHASES = [
  'Info Session',
  'Research',
  'Application',
  'Course Matching',
  'Pre-departure Training',
];
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MILESTONE_TYPES = ['UW Internal', 'Host University'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getMilestoneClass(m) {
  if (m.is_completed)       return 'ms-done';
  if (m.is_overdue)         return 'ms-overdue';
  if (m.is_approaching_48h) return 'ms-urgent';
  if (m.is_approaching_7d)  return 'ms-soon';
  return 'ms-upcoming';
}

const fmtDualTime = (utcStr) => {
  if (!utcStr) return '—';
  const d = new Date(utcStr);
  return d.toLocaleString('en-US', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' });
};

const getStatusLabel = (m) => {
  if (m.is_completed) return { text: 'Complete', cls: 'sl-done' };
  if (m.is_overdue) return { text: 'Overdue', cls: 'sl-overdue' };
  if (m.is_approaching_48h) return { text: '< 48 hrs', cls: 'sl-urgent' };
  if (m.is_approaching_7d) return { text: 'Due soon', cls: 'sl-soon' };
  return { text: m.milestone_type || 'Checklist', cls: m.milestone_type === 'UW Internal' ? 'sl-uw' : 'sl-host' };
};

export default function ExchangeCalendar({ currentUser }) {
  const [tab, setTab] = useState('calendar'); // 'calendar' | 'checklist'

  // ── Calendar state ──────────────────────────────────────────
  const [milestones, setMilestones]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [today]                       = useState(new Date());
  const [viewDate, setViewDate]       = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Story 1 — program + destination filters
  const [programFilter, setProgramFilter] = useState('');
  const [destFilter, setDestFilter]       = useState('');

  // ── Checklist state ─────────────────────────────────────────
  const [checklist, setChecklist]         = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [expandedId, setExpandedId]       = useState(null);

  // ── Add checklist item state ────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '', deadline_utc: '', milestone_type: 'UW Internal', form_link: '', prerequisite_id: '', phase: 'Research'
  });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  // ── Edit checklist item state ────────────────────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    milestone_id: null, title: '', deadline_utc: '', milestone_type: 'UW Internal', form_link: '', prerequisite_id: '', phase: 'Research'
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // ── Fetch calendar milestones ────────────────────────────────
  const fetchMilestones = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (programFilter) params.set('type', programFilter);
      if (destFilter)    params.set('destination', destFilter);
      const res  = await fetch(`${API}/api/users/${currentUser}/milestones?${params}`);
      const data = await res.json();
      setMilestones(Array.isArray(data) ? data : []);
    } catch {
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, programFilter, destFilter]);

  useEffect(() => { fetchMilestones(); }, [fetchMilestones]);

  // ── Load checklist when tab is active ───────────────────────
  useEffect(() => {
    if (tab === 'checklist' && currentUser) loadChecklist();
  }, [tab, currentUser]); // eslint-disable-line

  const loadChecklist = async () => {
    setChecklistLoading(true);
    try {
      const res = await fetch(`${API}/api/users/${currentUser}/milestones`);
      const allMilestones = await res.json();
      
      if (Array.isArray(allMilestones)) {
        setChecklist(allMilestones.map(m => ({ ...m, key: m.milestone_id })));
      } else {
        setChecklist([]);
      }
    } catch (e) {
      console.error("Failed to load checklist", e);
      setChecklist([]);
    } finally {
      setChecklistLoading(false);
    }
  };

  // AC2 & AC4 — toggle checklist item (check / uncheck)
  const toggleChecklistItem = async (item) => {
    const next = !item.is_completed;
    
    // Optimistic update (AC3 — real-time progress indicator)
    setChecklist(prev =>
      prev.map(c => c.key === item.key ? { ...c, is_completed: next } : c)
    );

    if (item.milestone_id) {
      await fetch(`${API}/api/milestones/${item.milestone_id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ is_completed: next }),
      });
    }
  };

  // ── Add checklist item logic ────────────────────────────────
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
      // The 'datetime-local' input format is 'YYYY-MM-DDTHH:MM'.
      // MySQL's DATETIME format is 'YYYY-MM-DD HH:MM:SS'.
      // The 'T' can cause data truncation warnings on the backend.
      // We'll reformat it to be safe.
      const formattedDeadline = addForm.deadline_utc
        ? addForm.deadline_utc.replace('T', ' ') + ':00'
        : null;

      const response = await fetch(`${API}/api/users/${currentUser}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          deadline_utc: formattedDeadline,
          prerequisite_id: addForm.prerequisite_id || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      setShowAdd(false);
      setAddForm({ title: '', deadline_utc: '', milestone_type: 'UW Internal', form_link: '', prerequisite_id: '', phase: 'Research' });
      fetchMilestones();
      loadChecklist();
    } catch (error) {
      console.error("Error adding checklist item:", error);
      // Provide a more specific error message if possible
      if (error.message.includes('Server responded')) {
        setAddErrors({ submit: 'Failed to add item. The server returned an error.' });
      } else {
        setAddErrors({ submit: 'Failed to add item. A network error may have occurred.' });
      }
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit checklist item logic ────────────────────────────────
  const handleEditClick = (e, item) => {
    e.stopPropagation();
    
    // Safely format the date into YYYY-MM-DDThh:mm for the HTML input element
    let dateStr = '';
    if (item.deadline_utc) {
      try {
        dateStr = new Date(item.deadline_utc).toISOString().slice(0, 16);
      } catch (err) {
        dateStr = '';
      }
    }

    setEditForm({
      milestone_id: item.milestone_id,
      title: item.title || '',
      deadline_utc: dateStr,
      milestone_type: item.milestone_type || 'UW Internal',
      form_link: item.form_link || '',
      prerequisite_id: item.prerequisite_id || '',
      phase: item.phase || 'Research'
    });
    setEditErrors({});
    setShowEdit(true);
  };

  const validateEdit = () => {
    const e = {};
    if (!editForm.title.trim()) e.title = 'Title is required';
    if (!editForm.deadline_utc) e.deadline_utc = 'Deadline is required';
    if (!editForm.milestone_type) e.milestone_type = 'Type is required';
    return e;
  };

  const submitEdit = async () => {
    const e = validateEdit();
    if (Object.keys(e).length) { setEditErrors(e); return; }
    setEditLoading(true);
    try {
      const { milestone_id, ...rest } = editForm;

      const formattedDeadline = rest.deadline_utc
        ? rest.deadline_utc.replace('T', ' ') + ':00'
        : null;

      await fetch(`${API}/api/milestones/${milestone_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rest,
          deadline_utc: formattedDeadline,
          prerequisite_id: rest.prerequisite_id || null,
        }),
      });
      setShowEdit(false);
      fetchMilestones();
      loadChecklist();
    } catch (error) {
      console.error("Error editing checklist item:", error);
      if (error.message.includes('Server responded')) {
        setEditErrors({ submit: 'Failed to edit item. The server returned an error.' });
      } else {
        setEditErrors({ submit: 'Failed to edit item. A network error may have occurred.' });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const deleteMilestone = async (id) => {
    if (!window.confirm('Delete this checklist item?')) return;
    try {
      await fetch(`${API}/api/milestones/${id}`, { method: 'DELETE' });
      fetchMilestones();
      loadChecklist();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Calendar grid helpers ────────────────────────────────────
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group milestones by "YYYY-MM-DD"
  const byDate = milestones.reduce((acc, m) => {
    if (!m.deadline_utc) return acc;
    const d   = new Date(m.deadline_utc);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const hasActiveFilters = !!(programFilter || destFilter);

  // Build cell array: null = empty pad before month starts
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Selected day's milestones
  const selectedKey = selectedDay
    ? `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    : null;
  const selectedMilestones = selectedKey ? (byDate[selectedKey] || []) : [];

  // ── Checklist progress ───────────────────────────────────────
  const completedCount = checklist.filter(c => c.is_completed).length;
  const totalCount     = checklist.length;
  const progress       = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  // Export .ics
  const exportICS = () => {
    if (!milestones || milestones.length === 0) return;

    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//WatExchange//Calendar//EN\n";

    milestones.forEach((m) => {
      if (!m.deadline_utc) return;
      const d = new Date(m.deadline_utc);
      
      const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      ics += "BEGIN:VEVENT\n";
      ics += `UID:${m.milestone_id || Date.now()}-${Date.now()}@watexchange\n`;
      ics += `DTSTAMP:${formatICSDate(new Date())}\n`;
      ics += `DTSTART:${formatICSDate(d)}\n`;
      ics += `DTEND:${formatICSDate(d)}\n`;
      ics += `SUMMARY:${m.title}\n`;
      ics += `DESCRIPTION:${m.milestone_type} Deadline${m.form_link ? '\\nLink: ' + m.form_link : ''}\n`;
      ics += "END:VEVENT\n";
    });

    ics += "END:VCALENDAR";

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Exchange_Milestones.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ec-wrap">

      {/* ── Header ── */}
      <div className="ec-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="ec-title">Exchange Calendar</h1>
          <p className="ec-subtitle">Track your application deadlines and checklist in one place</p>
        </div>
        <button
          className="ec-tab"
          style={{ height: 'fit-content', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          onClick={exportICS}
        >
          ↓ Export .ics
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="ec-tabs">
        <button
          className={`ec-tab ${tab === 'calendar' ? 'active' : ''}`}
          onClick={() => setTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`ec-tab ${tab === 'checklist' ? 'active' : ''}`}
          onClick={() => setTab('checklist')}
        >
          Application Checklist
        </button>
      </div>

      {/* ════════════════════════════════════════════════
          CALENDAR TAB  (Story 1)
          ════════════════════════════════════════════════ */}
      {tab === 'calendar' && (
        <>
          {/* Story 1 — Program / Destination filters */}
          <div className="ec-filters">
            <div className="ec-filter-field">
              <label htmlFor="ec-program-select">Program / Type</label>
              <select
                id="ec-program-select"
                className="ec-select"
                value={programFilter}
                onChange={e => setProgramFilter(e.target.value)}
                aria-label="Filter by program"
              >
                <option value="">All Types</option>
                <option value="UW Internal">UW Internal</option>
                <option value="Host University">Host University</option>
              </select>
            </div>

            <div className="ec-filter-field">
              <label htmlFor="ec-dest-input">Destination</label>
              <input
                id="ec-dest-input"
                className="ec-input"
                type="text"
                placeholder="e.g. Australia"
                value={destFilter}
                onChange={e => setDestFilter(e.target.value)}
                aria-label="Filter by destination"
              />
            </div>

            {/* AC4 — Clear Filters */}
            {hasActiveFilters && (
              <button
                className="ec-clear-filters"
                onClick={() => { setProgramFilter(''); setDestFilter(''); }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* AC5 — Empty state when filters match nothing */}
          {!loading && hasActiveFilters && milestones.length === 0 && (
            <div className="ec-empty">
              <div className="ec-empty-icon">📭</div>
              <p>No relevant deadlines found for these filters</p>
            </div>
          )}

          {/* Month navigation */}
          <div className="ec-month-nav">
            <button
              className="ec-nav-btn"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              aria-label="Previous month"
            >‹</button>
            <h2 className="ec-month-title">{MONTHS[month]} {year}</h2>
            <button
              className="ec-nav-btn"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              aria-label="Next month"
            >›</button>
          </div>

          {loading ? (
            <div className="ec-loading">Loading milestones…</div>
          ) : (
            <div className="ec-calendar-wrap">
              {/* Day-of-week headers */}
              <div className="ec-day-headers">
                {DAYS.map(d => <div key={d} className="ec-day-header">{d}</div>)}
              </div>

              {/* Calendar grid */}
              <div className="ec-grid">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`pad-${idx}`} className="ec-cell ec-cell--empty" />;

                  const key           = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const dayMilestones = byDate[key] || [];
                  const isToday       = key === todayStr;
                  const isSelected    = selectedDay === day;

                  return (
                    <div
                      key={key}
                      className={[
                        'ec-cell',
                        isToday    ? 'ec-cell--today'    : '',
                        isSelected ? 'ec-cell--selected' : '',
                        dayMilestones.length > 0 ? 'ec-cell--has-events' : '',
                      ].join(' ')}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                    >
                      <span className="ec-day-num">{day}</span>
                      <div className="ec-dots">
                        {dayMilestones.slice(0, 3).map((m, i) => (
                          <span
                            key={i}
                            className={`ec-dot ${getMilestoneClass(m)}`}
                            title={m.title}
                          />
                        ))}
                        {dayMilestones.length > 3 && (
                          <span className="ec-dot-more">+{dayMilestones.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected day detail panel */}
          {selectedDay && (
            <div className="ec-day-panel">
              <h3 className="ec-day-panel-title">
                {MONTHS[month]} {selectedDay}, {year}
              </h3>
              {selectedMilestones.length === 0 ? (
                <p className="ec-day-panel-empty">No deadlines on this day.</p>
              ) : (
                selectedMilestones.map(m => (
                  <div key={m.milestone_id} className={`ec-event-row ${getMilestoneClass(m)}`}>
                    <span className="ec-event-bullet" />
                    <div className="ec-event-info">
                      <span className="ec-event-title">{m.title}</span>
                      <span className="ec-event-type">{m.milestone_type}</span>
                    </div>
                    {m.is_completed && <span className="ec-event-done-badge">✓ Done</span>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Legend */}
          <div className="ec-legend">
            <span className="ec-legend-item"><span className="ec-dot ms-urgent"/>Due in 48h</span>
            <span className="ec-legend-item"><span className="ec-dot ms-soon"/>Due in 7 days</span>
            <span className="ec-legend-item"><span className="ec-dot ms-overdue"/>Overdue</span>
            <span className="ec-legend-item"><span className="ec-dot ms-done"/>Complete</span>
            <span className="ec-legend-item"><span className="ec-dot ms-upcoming"/>Upcoming</span>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          CHECKLIST TAB  (Story 2)
          ════════════════════════════════════════════════ */}
      {tab === 'checklist' && (
        <div className="ec-checklist">

          {/* AC3 — Progress bar */}
          <div className="ec-progress-card">
            <div className="ec-progress-top">
              <span className="ec-progress-label">Application Progress</span>
              <span className="ec-progress-count">{completedCount}/{totalCount} steps complete</span>
            </div>
            <div className="ec-progress-bar-wrap">
              <div
                className="ec-progress-bar"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="ec-progress-pct">{progress}%</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="tl-btn tl-btn-primary" onClick={() => setShowAdd(true)}>
              + Add Checklist
            </button>
          </div>


          {checklistLoading ? (
            <div className="ec-loading">Loading checklist…</div>
          ) : (
            <div className="tl-phases">
              {PHASES.map(phase => {
                const items = checklist.filter(c => c.phase === phase);
                if (!items.length) return null;
                return (
                  <div key={phase} className="tl-phase-group">
                    <h3 className="tl-phase-heading">{phase}</h3>
                    <div className="tl-list">
                      {items.map((item, i) => {
                        const status = getStatusLabel(item);
                        const isExpanded = expandedId === item.key;
                        const isLocked =
                          item.prerequisite_id &&
                          !item.prerequisite_completed &&
                          !item.is_completed;

                        return (
                          <div
                            key={item.key}
                            className={`tl-milestone ${getMilestoneClass(item)} ${isLocked ? 'locked' : ''}`}
                          >
                            {i < items.length - 1 && (
                              <div className={`tl-connector ${item.is_completed ? 'done' : ''}`} />
                            )}

                            <div className="tl-ms-left">
                              <button
                                className={`tl-checkbox ${item.is_completed ? 'checked' : ''} ${isLocked ? 'disabled' : ''}`}
                                onClick={() => !isLocked && toggleChecklistItem(item)}
                                title={isLocked ? `Complete "${item.prerequisite_title}" first` : 'Mark complete'}
                              >
                                {item.is_completed ? '✓' : isLocked ? '🔒' : ''}
                              </button>
                            </div>

                            <div className="tl-ms-body" onClick={() => setExpandedId(isExpanded ? null : item.key)}>
                              <div className="tl-ms-top">
                                <div className="tl-ms-title-row">
                                  <span className="tl-ms-title">{item.title}</span>
                                  <span className={`tl-status-label ${status.cls}`}>{status.text}</span>
                                </div>

                                <div className="tl-ms-meta">
                                  {item.deadline_utc && <span className="tl-ms-date">📅 {fmtDualTime(item.deadline_utc)} EST</span>}
                                  {item.milestone_type && (
                                    <span className={`tl-type-badge ${item.milestone_type === 'UW Internal' ? 'uw' : 'host'}`}>
                                      {item.milestone_type}
                                    </span>
                                  )}
                                  {!item.is_completed && item.days_remaining !== undefined && (
                                    <span className="tl-days-remaining">
                                      {item.days_remaining} days remaining
                                    </span>
                                  )}
                                </div>

                                {item.prerequisite_id && (
                                  <div className="tl-prereq">
                                    {isLocked ? '🔒' : '✓'} Requires: <em>{item.prerequisite_title}</em>
                                  </div>
                                )}
                              </div>

                              {isExpanded && (
                                <div className="tl-ms-detail">
                                  {item.form_link && (
                                    <a href={item.form_link} target="_blank" rel="noreferrer" className="tl-form-link" onClick={e => e.stopPropagation()}>
                                      → Open Required Form / Portal
                                    </a>
                                  )}

                                  {item.is_completed && item.buffer_days !== null && item.buffer_days !== undefined && (
                                    <div className="tl-buffer">
                                      {item.buffer_days > 0
                                        ? `🎯 Buffer Status: ${item.buffer_days} days ahead of deadline`
                                        : item.buffer_days === 0
                                        ? '⏱ Completed exactly on deadline'
                                        : `⚠ Completed ${Math.abs(item.buffer_days)} days after deadline`}
                                    </div>
                                  )}

                                  <div className="tl-ms-actions">
                                    {!isLocked && (
                                      <button
                                        className="tl-action-btn tl-toggle-btn"
                                        onClick={(e) => { e.stopPropagation(); toggleChecklistItem(item); }}
                                      >
                                        {item.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                                      </button>
                                    )}
                                    {item.milestone_id && (
                                      <button
                                        className="tl-action-btn"
                                        style={{ background: '#f0f0f5', color: '#1a1a2e', border: '1px solid #d1d5db' }}
                                        onClick={(e) => handleEditClick(e, item)}
                                      >
                                        Edit
                                      </button>
                                    )}
                                    {item.milestone_id && (
                                      <button
                                        className="tl-action-btn tl-delete-btn"
                                        onClick={(e) => { e.stopPropagation(); deleteMilestone(item.milestone_id); }}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Add Checklist Modal ── */}
      {showAdd && (
        <div className="tl-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tl-modal-close" onClick={() => setShowAdd(false)}>✕</button>
            <h2 className="tl-modal-title">Add Checklist</h2>

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
              <label>Phase</label>
              <select
                className="tl-input"
                value={addForm.phase}
                onChange={(e) => setAddForm((p) => ({ ...p, phase: e.target.value }))}
              >
                {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
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
                {milestones.filter(m => m.milestone_id).map((m) => (
                  <option key={m.milestone_id} value={m.milestone_id}>{m.title}</option>
                ))}
              </select>
            </div>

            {addErrors.submit && <div className="tl-field-err">{addErrors.submit}</div>}

            <div className="tl-modal-footer">
              <button className="tl-btn tl-btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="tl-btn tl-btn-primary" onClick={submitAdd} disabled={addLoading}>
                {addLoading ? 'Adding…' : 'Add Checklist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Checklist Modal ── */}
      {showEdit && (
        <div className="tl-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tl-modal-close" onClick={() => setShowEdit(false)}>✕</button>
            <h2 className="tl-modal-title">Edit Checklist</h2>

            <div className="tl-form-field">
              <label>Title *</label>
              <input
                className={`tl-input ${editErrors.title ? 'error' : ''}`}
                placeholder="e.g. Submit Study Plan to WaterlooAbroad"
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
              {editErrors.title && <span className="tl-field-err">{editErrors.title}</span>}
            </div>

            <div className="tl-form-field">
              <label>Deadline (UTC) *</label>
              <input
                type="datetime-local"
                className={`tl-input ${editErrors.deadline_utc ? 'error' : ''}`}
                value={editForm.deadline_utc}
                onChange={(e) => setEditForm((p) => ({ ...p, deadline_utc: e.target.value }))}
              />
              {editErrors.deadline_utc && <span className="tl-field-err">{editErrors.deadline_utc}</span>}
            </div>

            <div className="tl-form-field">
              <label>Type *</label>
              <select
                className="tl-input"
                value={editForm.milestone_type}
                onChange={(e) => setEditForm((p) => ({ ...p, milestone_type: e.target.value }))}
              >
                {MILESTONE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="tl-form-field">
              <label>Phase</label>
              <select
                className="tl-input"
                value={editForm.phase}
                onChange={(e) => setEditForm((p) => ({ ...p, phase: e.target.value }))}
              >
                {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="tl-form-field">
              <label>Link to Form / Portal (optional)</label>
              <input
                className="tl-input"
                placeholder="https://waterlooabroad.uwaterloo.ca/…"
                value={editForm.form_link}
                onChange={(e) => setEditForm((p) => ({ ...p, form_link: e.target.value }))}
              />
            </div>

            <div className="tl-form-field">
              <label>Prerequisite Milestone ID (optional)</label>
              <select
                className="tl-input"
                value={editForm.prerequisite_id}
                onChange={(e) => setEditForm((p) => ({ ...p, prerequisite_id: e.target.value }))}
              >
                <option value="">None</option>
                {milestones.filter(m => m.milestone_id && m.milestone_id !== editForm.milestone_id).map((m) => (
                  <option key={m.milestone_id} value={m.milestone_id}>{m.title}</option>
                ))}
              </select>
            </div>

            {editErrors.submit && <div className="tl-field-err">{editErrors.submit}</div>}

            <div className="tl-modal-footer">
              <button className="tl-btn tl-btn-outline" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="tl-btn tl-btn-primary" onClick={submitEdit} disabled={editLoading}>
                {editLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}