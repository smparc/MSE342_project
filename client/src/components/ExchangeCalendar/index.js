import React, { useState, useEffect, useCallback } from 'react';
import './ExchangeCalendar.css';

const API = process.env.REACT_APP_API_URL || '';

// Story 2 — predefined checklist templates, grouped by phase
const CHECKLIST_TEMPLATES = [
  { key: 'research_unis',  title: 'Research partner universities',          phase: 'Research' },
  { key: 'meet_advisor',   title: 'Meet with exchange advisor',             phase: 'Research' },
  { key: 'study_plan',     title: 'Prepare and submit study plan',          phase: 'Nomination' },
  { key: 'faculty_approval', title: 'Obtain faculty approval for courses',  phase: 'Nomination' },
  { key: 'uwabroad_app',   title: 'Submit WaterlooAbroad application',      phase: 'Nomination' },
  { key: 'nomination_conf', title: 'Receive nomination confirmation',       phase: 'Nomination' },
  { key: 'host_apply',     title: 'Apply to host university',               phase: 'Host Application' },
  { key: 'housing',        title: 'Submit housing application',             phase: 'Host Application' },
  { key: 'visa',           title: 'Obtain visa / study permit',             phase: 'Host Application' },
  { key: 'flights',        title: 'Book flights and accommodation',         phase: 'Host Application' },
];

const PHASES = ['Research', 'Nomination', 'Host Application'];
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
      const res  = await fetch(`${API}/api/users/${currentUser}/milestones`);
      const data = await res.json();
      const existing = Array.isArray(data) ? data : [];

      // Seed any templates that aren't in DB yet (AC5 — persists after logout)
      const existingTitles = new Set(existing.map(m => m.title));
      for (const tmpl of CHECKLIST_TEMPLATES) {
        if (!existingTitles.has(tmpl.title)) {
          await fetch(`${API}/api/users/${currentUser}/milestones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title:          tmpl.title,
              deadline_utc:   new Date(Date.now() + 365 * 86400000).toISOString(),
              milestone_type: 'UW Internal',
              phase:          tmpl.phase,
            }),
          });
        }
      }

      // Re-fetch after seeding
      const res2  = await fetch(`${API}/api/users/${currentUser}/milestones`);
      const data2 = await res2.json();
      const all   = Array.isArray(data2) ? data2 : [];

      // Merge with templates to guarantee order
      setChecklist(
        CHECKLIST_TEMPLATES.map(tmpl => {
          const found = all.find(m => m.title === tmpl.title);
          return found ? { ...tmpl, ...found } : { ...tmpl, is_completed: false };
        })
      );
    } finally {
      setChecklistLoading(false);
    }
  };

  // AC2 & AC4 — toggle checklist item (check / uncheck)
  const toggleChecklistItem = async (item) => {
    const next = !item.is_completed;
    
    // Optimistic update (AC3 — real-time progress indicator)
    // Match by key to ensure UI updates instantly even if DB ID is missing
    setChecklist(prev =>
      prev.map(c => c.key === item.key ? { ...c, is_completed: next } : c)
    );

    let targetId = item.milestone_id;

    // If the item doesn't exist in DB yet, create it on the fly
    if (!targetId && currentUser) {
      try {
        const res = await fetch(`${API}/api/users/${currentUser}/milestones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title:          item.title,
            deadline_utc:   new Date(Date.now() + 365 * 86400000).toISOString(),
            milestone_type: 'UW Internal', // Fallback to safe DB ENUM type
            phase:          item.phase,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          targetId = data.milestone_id;
          setChecklist(prev =>
            prev.map(c => c.key === item.key ? { ...c, milestone_id: targetId } : c)
          );
        }
      } catch (err) {
        console.error('Failed to seed checklist item', err);
      }
    }

    if (targetId) {
      await fetch(`${API}/api/milestones/${targetId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ is_completed: next }),
      });
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

          {checklistLoading ? (
            <div className="ec-loading">Loading checklist…</div>
          ) : (
            PHASES.map(phase => {
              const items = checklist.filter(c => c.phase === phase);
              if (!items.length) return null;
              return (
                <div key={phase} className="ec-checklist-group">
                  <h3 className="ec-checklist-phase">{phase}</h3>
                  {items.map(item => (
                    <div
                      key={item.key}
                      className={`ec-checklist-item ${item.is_completed ? 'completed' : ''}`}
                    >
                      {/* AC2 & AC4 — toggle checkbox */}
                      <button
                        className={`ec-checkbox ${item.is_completed ? 'checked' : ''}`}
                        onClick={() => toggleChecklistItem(item)}
                        aria-label={item.is_completed ? `Uncheck: ${item.title}` : `Check: ${item.title}`}
                      >
                        {item.is_completed ? '✓' : ''}
                      </button>
                      <span className="ec-checklist-title">{item.title}</span>
                      {item.is_completed && (
                        <span className="ec-checklist-done-badge">Done</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}