import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CourseSearch.css';

const API = process.env.REACT_APP_API_URL || '';

// Helper: format date nicely
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const STATUS_COLORS = {
  Approved: '#22c55e',
  'Pending Review': '#f59e0b',
  Flagged: '#ef4444',
};

export default function CourseSearch({ currentUser }) {
  // Search & filter state
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ country: '', continent: '', faculty: '', term: '' });
  const [filterMeta, setFilterMeta] = useState({ countries: [], continents: [], terms: [] });

  // Results state
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detail modal
  const [selected, setSelected] = useState(null);

  // Saved courses for current user
  const [savedIds, setSavedIds] = useState(new Set());

  // Saved courses panel
  const [showSaved, setShowSaved] = useState(false);
  const [savedCourses, setSavedCourses] = useState([]);

  const debounceRef = useRef(null);

  // Load filter metadata on mount
  useEffect(() => {
    fetch(`${API}/api/courses/meta/filters`)
      .then((r) => r.json())
      .then(setFilterMeta)
      .catch(() => {});
  }, []);

  // Load user's saved courses
  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API}/api/users/${currentUser}/saved-courses`)
      .then((r) => r.json())
      .then((data) => {
        setSavedCourses(data);
        setSavedIds(new Set(data.map((c) => c.course_id)));
      })
      .catch(() => {});
  }, [currentUser]);

  const fetchCourses = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          q: query,
          country: filters.country,
          continent: filters.continent,
          faculty: filters.faculty,
          term: filters.term,
          page: pageNum,
          limit: 15,
        });
        const res = await fetch(`${API}/api/courses?${params}`);
        const data = await res.json();
        setCourses(data.courses || []);
        setPagination(data.pagination || {});
      } catch {
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [query, filters]
  );

  // Debounce search as user types (AC#5 partial search)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCourses(1), 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchCourses]);

  // Filter changes should persist across page navigation (AC#7 filter)
  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const clearFilters = () => {
    setFilters({ country: '', continent: '', faculty: '', term: '' });
    setQuery('');
  };

  const toggleSave = async (courseId) => {
    if (!currentUser) return alert('Please log in to save courses.');
    const res = await fetch(`${API}/api/users/${currentUser}/saved-courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
    const data = await res.json();
    setSavedIds((prev) => {
      const next = new Set(prev);
      data.saved ? next.add(courseId) : next.delete(courseId);
      return next;
    });
    if (data.saved) {
      setSavedCourses((prev) => [...prev, courses.find((c) => c.course_id === courseId)]);
    } else {
      setSavedCourses((prev) => prev.filter((c) => c.course_id !== courseId));
    }
  };

  const openDetail = async (courseId) => {
    const res = await fetch(`${API}/api/courses/${courseId}`);
    const data = await res.json();
    setSelected(data);
  };

  const hasFilters = query || Object.values(filters).some(Boolean);

  return (
    <div className="cs-wrap">
      {/* ── Header ── */}
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Course Equivalency Database</h1>
          <p className="cs-subtitle">Search courses matched at partner universities</p>
        </div>
        <button className="cs-shortlist-btn" onClick={() => setShowSaved(true)}>
          <span className="cs-shortlist-count">{savedIds.size}</span>
          My Shortlist
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="cs-search-row">
        <div className="cs-search-box">
          <svg className="cs-search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            className="cs-search-input"
            type="text"
            placeholder="Search by university, course name, or code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="cs-clear-btn" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="cs-filters">
        <select
          value={filters.continent}
          onChange={(e) => handleFilterChange('continent', e.target.value)}
          className="cs-select"
        >
          <option value="">All Continents</option>
          {filterMeta.continents.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.country}
          onChange={(e) => handleFilterChange('country', e.target.value)}
          className="cs-select"
        >
          <option value="">All Countries</option>
          {filterMeta.countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.faculty}
          onChange={(e) => handleFilterChange('faculty', e.target.value)}
          className="cs-select"
        >
          <option value="">All Faculties</option>
          {['MSCI', 'CS', 'ECE', 'SYDE', 'MATH', 'STAT', 'BUS', 'ECON', 'PHYS', 'CHEM'].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={filters.term}
          onChange={(e) => handleFilterChange('term', e.target.value)}
          className="cs-select"
        >
          <option value="">All Terms</option>
          {filterMeta.terms.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {hasFilters && (
          <button className="cs-clear-filters" onClick={clearFilters}>
            Clear all filters
          </button>
        )}
      </div>

      {/* ── Results ── */}
      <div className="cs-results-header">
        <span className="cs-count">
          {loading ? 'Loading…' : `${pagination.total || 0} course${pagination.total !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {error && <div className="cs-error">{error}</div>}

      {/* No results message (AC#4) */}
      {!loading && !error && courses.length === 0 && (
        <div className="cs-empty">
          <div className="cs-empty-icon">🔍</div>
          <h3>No courses found</h3>
          <p>Try adjusting your search terms or filters. You can search by partial university or course name.</p>
          {hasFilters && (
            <button className="cs-clear-filters" onClick={clearFilters}>Clear all filters</button>
          )}
        </div>
      )}

      {/* Course cards (AC#7) */}
      <div className="cs-grid">
        {courses.map((c) => (
          <div
            key={c.course_id}
            className="cs-card"
            onClick={() => openDetail(c.course_id)}
          >
            <div className="cs-card-top">
              <span
                className="cs-status-badge"
                style={{ '--badge-color': STATUS_COLORS[c.status] || '#888' }}
              >
                {c.status}
              </span>
              <button
                className={`cs-save-btn ${savedIds.has(c.course_id) ? 'saved' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleSave(c.course_id); }}
                title={savedIds.has(c.course_id) ? 'Remove from shortlist' : 'Save to shortlist'}
              >
                {savedIds.has(c.course_id) ? '★' : '☆'}
              </button>
            </div>

            <div className="cs-card-body">
              <div className="cs-host-course">
                <span className="cs-code">{c.host_course_code}</span>
                <span className="cs-name">{c.host_course_name}</span>
              </div>
              <div className="cs-arrow">→</div>
              <div className="cs-uw-course">
                <span className="cs-code cs-uw">{c.uw_course_code}</span>
                <span className="cs-name">{c.uw_course_name}</span>
              </div>
            </div>

            <div className="cs-card-footer">
              <span className="cs-meta-item">🏫 {c.host_university}</span>
              <span className="cs-meta-item">🌍 {c.country}{c.term_taken ? ` · ${c.term_taken}` : ''}</span>
              <span className="cs-meta-item cs-updated">Updated {fmtDate(c.last_updated)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (AC#6) */}
      {pagination.totalPages > 1 && (
        <div className="cs-pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchCourses(pagination.page - 1)}
          >← Prev</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchCourses(pagination.page + 1)}
          >Next →</button>
        </div>
      )}

      {/* ── Course Detail Modal (AC#2, AC#9) ── */}
      {selected && (
        <div className="cs-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cs-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cs-modal-close" onClick={() => setSelected(null)}>✕</button>
            <h2 className="cs-modal-title">Course Equivalency Details</h2>

            <div className="cs-modal-grid">
              <div className="cs-modal-section">
                <label>Host Course</label>
                <p className="cs-modal-code">{selected.host_course_code}</p>
                <p>{selected.host_course_name}</p>
                <p className="cs-modal-uni">{selected.host_university}</p>
                <p className="cs-modal-meta">{selected.country}{selected.continent ? ` · ${selected.continent}` : ''}</p>
              </div>

              <div className="cs-modal-divider">⇄</div>

              <div className="cs-modal-section">
                <label>UW Equivalent</label>
                <p className="cs-modal-code cs-uw">{selected.uw_course_code}</p>
                <p>{selected.uw_course_name}</p>
              </div>
            </div>

            <div className="cs-modal-meta-row">
              {selected.term_taken && <span>📅 {selected.term_taken}</span>}
              <span>👤 Submitted by {selected.display_name || selected.username}</span>
              <span
                className="cs-status-badge"
                style={{ '--badge-color': STATUS_COLORS[selected.status] || '#888' }}
              >
                {selected.status}
              </span>
            </div>

            <div className="cs-modal-updated">
              Last updated: <strong>{fmtDate(selected.last_updated)}</strong>
              {selected.proof_url && (
                <a href={selected.proof_url} target="_blank" rel="noreferrer" className="cs-proof-link">
                  View Proof Document
                </a>
              )}
            </div>

            <button
              className={`cs-save-btn-lg ${savedIds.has(selected.course_id) ? 'saved' : ''}`}
              onClick={() => toggleSave(selected.course_id)}
            >
              {savedIds.has(selected.course_id) ? '★ Saved to Shortlist' : '☆ Save to Shortlist'}
            </button>
          </div>
        </div>
      )}

      {/* ── Saved Courses / Shortlist Panel (AC#10 search) ── */}
      {showSaved && (
        <div className="cs-modal-overlay" onClick={() => setShowSaved(false)}>
          <div className="cs-modal cs-saved-panel" onClick={(e) => e.stopPropagation()}>
            <button className="cs-modal-close" onClick={() => setShowSaved(false)}>✕</button>
            <h2 className="cs-modal-title">⭐ My Shortlist</h2>
            {savedCourses.length === 0 ? (
              <div className="cs-empty">
                <p>No saved courses yet. Click the ☆ icon on any course to add it here.</p>
              </div>
            ) : (
              savedCourses.map((c) => (
                <div key={c.course_id} className="cs-saved-row">
                  <div>
                    <strong>{c.host_course_code} → {c.uw_course_code}</strong>
                    <p>{c.host_university} · {c.country}</p>
                  </div>
                  <button
                    className="cs-save-btn saved"
                    onClick={() => toggleSave(c.course_id)}
                  >★</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}