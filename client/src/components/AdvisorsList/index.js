import React, { useState, useEffect } from 'react';
import './AdvisorsList.css';

const API = process.env.REACT_APP_API_URL || '';

const AdvisorsList = () => {
  const [advisors, setAdvisors]   = useState([]);
  const [search, setSearch]       = useState('');
  const [faculty, setFaculty]     = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch(`${API}/api/advisors`)
      .then(r => r.json())
      .then(data => { setAdvisors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const faculties = [...new Set(advisors.map(a => a.faculty).filter(Boolean))].sort();

  const filtered = advisors.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = (
      a.name?.toLowerCase().includes(q) ||
      a.programs?.toLowerCase().includes(q) ||
      a.faculty?.toLowerCase().includes(q)
    );
    const matchFaculty = !faculty || a.faculty === faculty;
    return matchSearch && matchFaculty;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="al-filters">
        <input
          className="al-search"
          type="text"
          placeholder="Search advisors by name or program..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search advisors"
        />
        <div className="al-faculty-filter">
          <label htmlFor="al-faculty-select" className="al-label">Filter by Faculty</label>
          <select
            id="al-faculty-select"
            className="al-select"
            value={faculty}
            onChange={e => setFaculty(e.target.value)}
            aria-label="Filter by faculty"
          >
            <option value="">All Faculties</option>
            {faculties.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="al-loading">Loading advisors...</div>}

      {!loading && filtered.length === 0 && (
        <div className="al-empty">
          No advisors found{search ? ` for "${search}"` : ''}.
        </div>
      )}

      <div className="al-grid">
        {filtered.map(advisor => (
          <div key={advisor.advisor_id} className="al-card">
            <div className="al-card-top">
              <div className="al-avatar">{advisor.name.charAt(0)}</div>
              <div>
                <div className="al-name">{advisor.name}</div>
                <div className="al-faculty">{advisor.faculty}</div>
              </div>
            </div>

            <div className="al-programs">
              {advisor.programs?.split(',').map(p => (
                <span key={p} className="al-program-tag">{p.trim()}</span>
              ))}
            </div>

            <div className="al-detail-row">
              <span className="al-icon">✉</span>
              <a href={`mailto:${advisor.email}`} className="al-email">{advisor.email}</a>
            </div>
            <div className="al-detail-row">
              <span className="al-icon">📍</span>
              <span className="al-office">{advisor.office}</span>
            </div>
            <div className="al-detail-row">
              <span className="al-icon">🕐</span>
              <span className="al-hours">{advisor.office_hours}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvisorsList;