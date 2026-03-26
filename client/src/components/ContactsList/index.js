import React, { useState, useEffect } from 'react';
import './ContactsList.css';

import AdvisorsList from '../AdvisorsList';

const API = process.env.REACT_APP_API_URL || '';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('Contacts');

  useEffect(() => {
    fetch(`${API}/api/contacts`)
      .then(r => r.json())
      .then(data => { setContacts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q) ||
      c.faculty?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="cl-container">
      <div className="cl-header">
        <h1 className="cl-title">Directory & Support</h1>
        <p className="cl-subtitle">
          Find your academic advisors and study abroad contacts.
        </p>
      </div>

      <div className="cl-tabs" style={{ display: 'flex', gap: '24px', marginBottom: '28px', borderBottom: '2px solid #e8e8f0' }}>
        <button 
          style={{ background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer', padding: '8px 4px', color: activeTab === 'Contacts' ? '#4338ca' : '#888', borderBottom: activeTab === 'Contacts' ? '2px solid #4338ca' : 'none', marginBottom: '-2px', transition: 'color 0.2s' }}
          onClick={() => setActiveTab('Contacts')}
        >
          Study Abroad Contacts
        </button>
        <button 
          style={{ background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer', padding: '8px 4px', color: activeTab === 'Advisors' ? '#4338ca' : '#888', borderBottom: activeTab === 'Advisors' ? '2px solid #4338ca' : 'none', marginBottom: '-2px', transition: 'color 0.2s' }}
          onClick={() => setActiveTab('Advisors')}
        >
          Academic Advisors
        </button>
      </div>

      {activeTab === 'Contacts' ? (
        <>
      <div className="cl-search-row">
        <input
          className="cl-search"
          type="text"
          placeholder="Search contacts by name, department, or faculty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search contacts"
        />
        {search && (
          <button className="cl-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {loading && <div className="cl-loading">Loading contacts...</div>}

      {!loading && filtered.length === 0 && (
        <div className="cl-empty">No contacts found for "{search}".</div>
      )}

      <div className="cl-grid">
        {filtered.map(contact => (
          <div key={contact.contact_id} className="cl-card">
            <div className="cl-card-header">
              <span className="cl-name">{contact.name}</span>
              {contact.faculty && (
                <span className="cl-faculty-badge">{contact.faculty}</span>
              )}
            </div>

            <div className="cl-role">{contact.role}</div>
            <div className="cl-department">{contact.department}</div>

            <div className="cl-contact-row">
              <span className="cl-icon">✉</span>
              <a href={`mailto:${contact.email}`} className="cl-email">
                {contact.email}
              </a>
            </div>

            {contact.phone && (
              <div className="cl-contact-row">
                <span className="cl-icon">☎</span>
                <span className="cl-phone">{contact.phone}</span>
              </div>
            )}
          </div>
        ))}
      </div>
        </>
      ) : (
        <AdvisorsList />
      )}
    </div>
  );
};

export default ContactsList;