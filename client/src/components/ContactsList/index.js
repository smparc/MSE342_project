import React, { useState, useEffect } from 'react';
import './ContactsList.css';

const API = process.env.REACT_APP_API_URL || '';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

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
        <h1 className="cl-title">Study Abroad Contacts</h1>
        <p className="cl-subtitle">
          Reach out to the right person for your exchange program questions.
        </p>
      </div>

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
    </div>
  );
};

export default ContactsList;