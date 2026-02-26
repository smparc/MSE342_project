import React, { useState } from 'react';
import CourseSearch from '../CourseSearch';
import CourseSubmit from '../CourseSubmit';
import Timeline from '../Timeline';
import './App.css';

const DEMO_USER = 'demo_user';

const NAV_ITEMS = [
  { id: 'search', label: '🔍 Search Courses' },
  { id: 'upload', label: '⬆ Upload Equivalency' },
  { id: 'timeline', label: '📅 Timeline' },
];

export default function App() {
  const [page, setPage] = useState('search');

  return (
    <div className="app-root">
      {/* ── Top nav bar ── */}
      <nav className="app-nav">
        <div className="app-nav-inner">
          <span className="app-logo">UW Exchange</span>
          <div className="app-nav-links">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`app-nav-btn ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="app-main">
        {page === 'search' && <CourseSearch currentUser={DEMO_USER} />}
        {page === 'upload' && <CourseSubmit currentUser={DEMO_USER} />}
        {page === 'timeline' && <Timeline currentUser={DEMO_USER} />}
      </main>
    </div>
  );
}