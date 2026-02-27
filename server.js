const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── DB Pool ──────────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── File Upload Setup ────────────────────────────────────────────────────────
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

// GET /api/user/:userId
app.get('/api/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [req.params.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// PUT /api/user/:userId
app.put('/api/user/:userId', async (req, res) => {
  try {
    const { display_name, bio } = req.body;
    await pool.query(
      'UPDATE users SET display_name = ?, bio = ? WHERE username = ?',
      [display_name, bio, req.params.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────────

// POST /api/upload
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const username = req.body.username || 'demo_user';
    const caption = req.body.caption || null;
    const location = req.body.location || null;
    const filePath = req.file.path;

    const [result] = await pool.query(
      'INSERT INTO profile_photos (username, image_url, caption, location) VALUES (?, ?, ?, ?)',
      [username, filePath, caption, location]
    );

    res.json({
      success: true,
      message: 'File uploaded and saved to database',
      filePath,
      photoId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// GET /api/posts/:userId
app.get('/api/posts/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM profile_photos WHERE username = ? ORDER BY uploaded_at DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// ─── MESSAGING ────────────────────────────────────────────────────────────────

// GET /api/messages-list
app.get('/api/messages-list', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'User is not logged in' });

    const [results] = await pool.query(
      `SELECT
          c.id,
          CASE WHEN c.user1_username = ? THEN c.user2_username ELSE c.user1_username END AS senderName,
          last_msg.content AS lastMessage,
          last_msg.created_at AS lastMessageAt,
          COALESCE(unread.cnt, 0) AS unread
       FROM conversations c
       LEFT JOIN (
           SELECT conversation_id, content, created_at,
               ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) AS rn
           FROM messages
       ) last_msg ON last_msg.conversation_id = c.id AND last_msg.rn = 1
       LEFT JOIN (
           SELECT m.conversation_id, COUNT(*) AS cnt
           FROM messages m
           JOIN conversations c ON c.id = m.conversation_id
           WHERE (
               (c.user1_username = ? AND m.sender_username = c.user2_username) OR
               (c.user2_username = ? AND m.sender_username = c.user1_username)
           ) AND (m.is_read = 0 OR m.is_read IS NULL)
           GROUP BY m.conversation_id
       ) unread ON unread.conversation_id = c.id
       WHERE c.user1_username = ? OR c.user2_username = ?
       ORDER BY last_msg.created_at DESC`,
      [userId, userId, userId, userId, userId]
    );

    res.json(results.map((row) => ({
      id: String(row.id),
      senderName: row.senderName,
      lastMessage: row.lastMessage || '',
      lastMessageAt: row.lastMessageAt,
      unread: Number(row.unread) || 0,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// GET /api/conversations/:conversationId/messages
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT m.id, m.sender_username AS senderId, u.display_name AS senderName,
              m.content, m.created_at
       FROM messages m
       JOIN users u ON u.username = m.sender_username
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [req.params.conversationId]
    );

    res.json(results.map((row) => ({
      id: String(row.id),
      senderId: row.senderId,
      senderName: row.senderName,
      content: row.content,
      created_at: row.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// POST /api/conversations/:conversationId/messages
app.post('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.query.userId;
    const { content } = req.body;

    if (!userId || !content || String(content).trim() === '') {
      return res.status(400).json({ error: 'userId and content are required' });
    }

    const [insertResult] = await pool.query(
      'INSERT INTO messages (conversation_id, sender_username, content) VALUES (?, ?, ?)',
      [conversationId, userId, String(content).trim()]
    );

    const [rows] = await pool.query(
      `SELECT m.id, m.sender_username AS senderId, u.display_name AS senderName,
              m.content, m.created_at
       FROM messages m
       JOIN users u ON u.username = m.sender_username
       WHERE m.id = ?`,
      [insertResult.insertId]
    );

    const row = rows[0];
    res.status(201).json({
      id: String(row.id),
      senderId: row.senderId,
      senderName: row.senderName,
      content: row.content,
      created_at: row.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ─── COURSE EQUIVALENCIES ─────────────────────────────────────────────────────

// GET /api/courses
app.get('/api/courses', async (req, res) => {
  try {
    const {
      q = '',
      country = '',
      continent = '',
      faculty = '',
      term = '',
      university = '',
      status = '',
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];

    if (q) {
      const sanitized = q.replace(/[^a-zA-Z0-9\s\-]/g, '').trim();
      if (sanitized) {
        conditions.push(
          `(ce.host_university LIKE ? OR ce.host_course_name LIKE ? OR ce.uw_course_name LIKE ? OR ce.host_course_code LIKE ? OR ce.uw_course_code LIKE ?)`
        );
        const like = `%${sanitized}%`;
        params.push(like, like, like, like, like);
      }
    }
    if (university) { conditions.push(`ce.host_university LIKE ?`); params.push(`%${university}%`); }
    if (country)    { conditions.push(`ce.country = ?`);            params.push(country); }
    if (continent)  { conditions.push(`ce.continent = ?`);          params.push(continent); }
    if (term)       { conditions.push(`ce.term_taken = ?`);         params.push(term); }
    if (faculty)    { conditions.push(`ce.uw_course_code LIKE ?`);  params.push(`${faculty}%`); }
    if (status)     { conditions.push(`ce.status = ?`);             params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM course_equivalencies ce ${where}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT ce.course_id, ce.username, ce.uw_course_code, ce.uw_course_name,
              ce.host_course_code, ce.host_course_name, ce.host_university,
              ce.country, ce.continent, ce.term_taken, ce.status,
              ce.proof_url, ce.last_updated
       FROM course_equivalencies ce
       ${where}
       ORDER BY ce.last_updated DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      courses: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/meta/filters  ← must be BEFORE /api/courses/:id
app.get('/api/courses/meta/filters', async (req, res) => {
  try {
    const [[countries], [continents], [terms], [universities]] = await Promise.all([
      pool.query(`SELECT DISTINCT country FROM course_equivalencies WHERE country IS NOT NULL ORDER BY country`),
      pool.query(`SELECT DISTINCT continent FROM course_equivalencies WHERE continent IS NOT NULL ORDER BY continent`),
      pool.query(`SELECT DISTINCT term_taken FROM course_equivalencies WHERE term_taken IS NOT NULL ORDER BY term_taken`),
      pool.query(`SELECT DISTINCT host_university FROM course_equivalencies ORDER BY host_university LIMIT 500`),
    ]);

    res.json({
      countries: countries.map((r) => r.country),
      continents: continents.map((r) => r.continent),
      terms: terms.map((r) => r.term_taken),
      universities: universities.map((r) => r.host_university),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch filter metadata' });
  }
});

// GET /api/courses/:id  ← must be AFTER /meta/filters
app.get('/api/courses/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ce.*, u.display_name
       FROM course_equivalencies ce
       JOIN users u ON ce.username = u.username
       WHERE ce.course_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST /api/courses
app.post('/api/courses', async (req, res) => {
  try {
    const {
      username, uw_course_code, uw_course_name,
      host_course_code, host_course_name, host_university,
      country, continent, term_taken, proof_url,
    } = req.body;

    const required = { username, uw_course_code, uw_course_name, host_course_code, host_course_name, host_university };
    const missing = Object.entries(required)
      .filter(([, v]) => !v || !v.toString().trim())
      .map(([k]) => k);
    if (missing.length) return res.status(400).json({ error: 'Missing required fields', fields: missing });

    const courseCodeRegex = /^[A-Z]{2,6}\s?\d{3}[A-Z]?$/i;
    if (!courseCodeRegex.test(uw_course_code.trim())) {
      return res.status(400).json({ error: 'Invalid UW course code format', field: 'uw_course_code' });
    }
    if (!proof_url || !proof_url.trim()) {
      return res.status(400).json({ error: 'Proof of match is required', field: 'proof_url' });
    }

    const [result] = await pool.query(
      `INSERT INTO course_equivalencies
        (username, uw_course_code, uw_course_name, host_course_code, host_course_name,
         host_university, country, continent, term_taken, proof_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review')`,
      [username, uw_course_code.trim().toUpperCase(), uw_course_name.trim(),
       host_course_code.trim(), host_course_name.trim(), host_university.trim(),
       country, continent, term_taken, proof_url]
    );

    res.status(201).json({
      message: 'Course submitted successfully. It will be visible after review.',
      course_id: result.insertId,
      status: 'Pending Review',
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This course equivalency has already been submitted.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to submit course' });
  }
});

// PUT /api/courses/:id
app.put('/api/courses/:id', async (req, res) => {
  try {
    const {
      username, uw_course_code, uw_course_name,
      host_course_code, host_course_name, host_university,
      country, continent, term_taken, proof_url,
    } = req.body;

    const [existing] = await pool.query(
      `SELECT * FROM course_equivalencies WHERE course_id = ? AND username = ?`,
      [req.params.id, username]
    );
    if (!existing.length) return res.status(404).json({ error: 'Course not found or unauthorized' });

    await pool.query(
      `UPDATE course_equivalencies
       SET uw_course_code=?, uw_course_name=?, host_course_code=?, host_course_name=?,
           host_university=?, country=?, continent=?, term_taken=?, proof_url=?,
           status='Pending Review'
       WHERE course_id=? AND username=?`,
      [uw_course_code, uw_course_name, host_course_code, host_course_name,
       host_university, country, continent, term_taken, proof_url,
       req.params.id, username]
    );

    res.json({ message: 'Course updated. Re-submitted for review.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// ─── SAVED COURSES ────────────────────────────────────────────────────────────

// GET /api/users/:username/saved-courses
app.get('/api/users/:username/saved-courses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ce.*, sc.saved_at
       FROM user_saved_courses sc
       JOIN course_equivalencies ce ON sc.course_id = ce.course_id
       WHERE sc.username = ?
       ORDER BY sc.saved_at DESC`,
      [req.params.username]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch saved courses' });
  }
});

// POST /api/users/:username/saved-courses
app.post('/api/users/:username/saved-courses', async (req, res) => {
  try {
    const { course_id } = req.body;
    const username = req.params.username;

    const [existing] = await pool.query(
      `SELECT id FROM user_saved_courses WHERE username=? AND course_id=?`,
      [username, course_id]
    );

    if (existing.length) {
      await pool.query(`DELETE FROM user_saved_courses WHERE username=? AND course_id=?`, [username, course_id]);
      return res.json({ saved: false, message: 'Removed from shortlist' });
    } else {
      await pool.query(`INSERT INTO user_saved_courses (username, course_id) VALUES (?,?)`, [username, course_id]);
      return res.json({ saved: true, message: 'Added to shortlist' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle saved course' });
  }
});

// ─── TIMELINE / MILESTONES ────────────────────────────────────────────────────

// GET /api/users/:username/milestones/export  ← must be BEFORE /:username/milestones
app.get('/api/users/:username/milestones/export', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM timeline_milestones WHERE username=? ORDER BY deadline_utc`,
      [req.params.username]
    );

    const formatICSDate = (d) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsEvents = rows.map((m) => {
      const dt = formatICSDate(m.deadline_utc);
      return [
        'BEGIN:VEVENT',
        `DTSTART:${dt}`,
        `DTEND:${dt}`,
        `SUMMARY:${m.title}`,
        `DESCRIPTION:${m.milestone_type} deadline${m.form_link ? ' - ' + m.form_link : ''}`,
        `STATUS:${m.is_completed ? 'COMPLETED' : 'NEEDS-ACTION'}`,
        'END:VEVENT',
      ].join('\r\n');
    });

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UW Exchange//Timeline//EN',
      'CALSCALE:GREGORIAN',
      ...icsEvents,
      'END:VCALENDAR',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="exchange-deadlines.ics"');
    res.send(ics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export calendar' });
  }
});

// GET /api/users/:username/milestones
app.get('/api/users/:username/milestones', async (req, res) => {
  try {
    const { type = '' } = req.query;
    const params = [req.params.username];
    let extra = '';
    if (type) { extra = ` AND m.milestone_type = ?`; params.push(type); }

    const [rows] = await pool.query(
      `SELECT m.*,
              p.title AS prerequisite_title,
              p.is_completed AS prerequisite_completed
       FROM timeline_milestones m
       LEFT JOIN timeline_milestones p ON m.prerequisite_id = p.milestone_id
       WHERE m.username = ? ${extra}
       ORDER BY m.deadline_utc ASC`,
      params
    );

    const now = new Date();
    const enriched = rows.map((m) => {
      const deadline = new Date(m.deadline_utc);
      const hoursUntil = (deadline - now) / (1000 * 60 * 60);
      const bufferDays = m.is_completed
        ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
        : null;
      return {
        ...m,
        buffer_days: bufferDays,
        is_approaching_48h: hoursUntil > 0 && hoursUntil <= 48,
        is_approaching_7d: hoursUntil > 0 && hoursUntil <= 168,
        is_overdue: hoursUntil < 0 && !m.is_completed,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// POST /api/users/:username/milestones
app.post('/api/users/:username/milestones', async (req, res) => {
  try {
    const { title, deadline_utc, milestone_type, prerequisite_id = null, form_link = null } = req.body;

    if (!title || !deadline_utc || !milestone_type) {
      return res.status(400).json({ error: 'title, deadline_utc, and milestone_type are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO timeline_milestones (username, title, deadline_utc, milestone_type, prerequisite_id, form_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.username, title, deadline_utc, milestone_type, prerequisite_id, form_link]
    );

    res.status(201).json({ milestone_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// PATCH /api/milestones/:id
app.patch('/api/milestones/:id', async (req, res) => {
  try {
    const { is_completed, title, deadline_utc, form_link } = req.body;
    const fields = [];
    const values = [];

    if (is_completed !== undefined) { fields.push('is_completed=?'); values.push(is_completed); }
    if (title !== undefined)        { fields.push('title=?');        values.push(title); }
    if (deadline_utc !== undefined) { fields.push('deadline_utc=?'); values.push(deadline_utc); }
    if (form_link !== undefined)    { fields.push('form_link=?');    values.push(form_link); }

    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

    values.push(req.params.id);
    await pool.query(`UPDATE timeline_milestones SET ${fields.join(',')} WHERE milestone_id=?`, values);
    res.json({ message: 'Milestone updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// DELETE /api/milestones/:id
app.delete('/api/milestones/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM timeline_milestones WHERE milestone_id=?`, [req.params.id]);
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

// ─── Catch-all for React SPA ──────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;