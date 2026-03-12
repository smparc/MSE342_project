import mysql from 'mysql2';
import config from './config.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
// Note: You need to download serviceAccountKey.json from Firebase Console
// Go to: Project Settings > Service Accounts > Generate new private key
const serviceAccountPath = './serviceAccountKey.json';
try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.warn('Warning: Firebase Admin SDK not initialized.', error.message);
    console.warn('Server will run but authentication will not work.');
    console.warn('Download serviceAccountKey.json from Firebase Console and place it in the project root.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connection = mysql.createConnection(config);

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

import multer from 'multer';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware to verify Firebase ID Token
const checkAuth = (req, res, next) => {
    const idToken = req.headers.authorization;
    if (!idToken) {
        return res.status(403).json({ error: 'Unauthorized: No token provided' });
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
        console.warn('Firebase Admin not initialized, skipping auth check');
        return next();
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            next();
        })
        .catch(error => {
            console.error('Token verification failed:', error.message);
            res.status(403).json({ error: 'Unauthorized: Invalid token' });
        });
};

// API to upload a post (protected)
app.post('/api/upload', checkAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // TODO: Replace hardcoded userId with actual authenticated user session data
    const userId = req.body.userId || 1;
    const filePath = req.file.path;

    const sql = "INSERT INTO posts (user_id, image_path) VALUES (?, ?)";
    connection.query(sql, [userId, filePath], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.send({
            success: true,
            message: 'File uploaded and saved to database',
            filePath: filePath,
            postId: results.insertId
        });
    });
});

// API to delete a post (protected)
app.delete('/api/posts/:id', checkAuth, (req, res) => {
    const { id } = req.params;

    // Get image path from db
    const selectSql = "SELECT image_path FROM posts WHERE photo_id = ?";
    connection.query(selectSql, [id], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }

        if (results.length === 0) {
            return res.status(404).send({ success: false, message: 'Post not found' });
        }

        const imagePath = results[0].image_path;

        // Delete row from db
        const deleteSql = "DELETE FROM posts WHERE photo_id = ?";
        connection.query(deleteSql, [id], (deleteError, deleteResults) => {
            if (deleteError) {
                console.error('Database error:', deleteError);
                return res.status(500).send(deleteError);
            }

            // Delete file on disk
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (unlinkError) => {
                    if (unlinkError) {
                        console.error('Error deleting file:', unlinkError);
                        // Still success because the db row is gone
                    }
                });
            }

            res.send({ success: true, message: 'Post deleted successfully' });
        });
    });
});

// API to create a new user (for sign up)
app.post('/api/users', checkAuth, (req, res) => {
    const { username, email, display_name, faculty, program, grad_year, exchange_term, uw_verified } = req.body;

    if (!username || !username.trim()) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Check if username already exists
    const checkSql = "SELECT username FROM users WHERE username = ?";
    connection.query(checkSql, [username.trim()], (checkError, checkResults) => {
        if (checkError) {
            console.error('Database error:', checkError);
            return res.status(500).json({ error: 'Database error' });
        }

        if (checkResults.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Create new user with email and profile info
        const insertSql = `
            INSERT INTO users (username, display_name, email, faculty, program, grad_year, exchange_term, uw_verified) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            username.trim(),
            display_name || username.trim(),
            email,
            faculty || null,
            program || null,
            grad_year || null,
            exchange_term || null,
            uw_verified || false
        ];

        connection.query(insertSql, params, (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Failed to create user' });
            }
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                username: username.trim()
            });
        });
    });
});

// API to get user by email (for auth lookup)
app.get('/api/users/by-email/:email', (req, res) => {
    const email = req.params.email;
    const sql = "SELECT username, display_name FROM users WHERE email = ?";
    connection.query(sql, [email], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

// API to get a user
app.get('/api/user/:username', (req, res) => {
    const username = req.params.username;
    const sql = "SELECT * FROM users WHERE username = ?";
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            // Return empty user object for new users
            return res.json({ username: username, display_name: '', bio: '' });
        }
        res.json(results[0]);
    });
});

// API to update a user (protected)
app.put('/api/user/:username', checkAuth, (req, res) => {
    const username = req.params.username;
    const { display_name, bio, faculty, program, grad_year, exchange_term } = req.body;
    const sql = "UPDATE users SET display_name = ?, bio = ?, faculty = ?, program = ?, grad_year = ?, exchange_term = ? WHERE username = ?";
    connection.query(sql, [display_name, bio, faculty, program, grad_year, exchange_term, username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.send({ success: true });
    });
});

// API to get all posts for a user
app.get('/api/posts/:username', (req, res) => {
    const username = req.params.username;
    const sql = "SELECT * FROM posts WHERE username = ? ORDER BY uploaded_at DESC";
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        // Always return an array (empty if no posts)
        res.json(results || []);
    });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 1) GET /api/messages-list - conversation list (left sidebar)
// Query param: userId (required) eventually
// Returns: [{ id, senderName, lastMessage, lastMessageAt, unread }]
app.get('/api/messages-list', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ error: 'User is not logged in' });
    }

    const connection = mysql.createConnection(config);

    const sql = `
        SELECT 
            c.id,
            CASE WHEN c.user1_username = ? THEN u2.display_name ELSE u1.display_name END AS senderName,
            last_msg.content AS lastMessage,
            last_msg.created_at AS lastMessageAt,
            COALESCE(unread.cnt, 0) AS unread
        FROM conversations c
        LEFT JOIN users u1 ON u1.username = c.user1_username
        LEFT JOIN users u2 ON u2.username = c.user2_username
        LEFT JOIN (
            SELECT conversation_id, content, created_at, sender_username,
                ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) AS rn
            FROM messages
        ) last_msg ON last_msg.conversation_id = c.id AND last_msg.rn = 1
        LEFT JOIN (
            SELECT m.conversation_id, COUNT(*) AS cnt
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE ((c.user1_username = ? AND m.sender_username = c.user2_username) OR (c.user2_username = ? AND m.sender_username = c.user1_username))
                AND (m.is_read = 0 OR m.is_read IS NULL)
            GROUP BY m.conversation_id
        ) unread ON unread.conversation_id = c.id
        WHERE c.user1_username = ? OR c.user2_username = ?
        ORDER BY last_msg.created_at DESC
    `;

    const params = [username, username, username, username, username];

    connection.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            res.status(500).json({ error: 'Failed to retrieve messages' });
        } else {
            const list = results.map((row) => ({
                id: String(row.id),
                senderName: row.senderName,
                lastMessage: row.lastMessage || '',
                lastMessageAt: row.lastMessageAt,
                unread: Number(row.unread) || 0,
            }));
            res.json(list);
        }
        connection.end();
    });
});

// 2) GET /api/conversations/:conversationId/messages - messages in selected conversation
// Query param: userId (optional, for future read receipts)
// Returns: [{ id, senderId, senderName, content, created_at }]
app.get('/api/conversations/:conversationId/messages', (req, res) => {
    const { conversationId } = req.params;
    const userId = req.query.userId;

    const connection = mysql.createConnection(config);

    const sql = `
        SELECT m.id, m.sender_username AS senderId, u.display_name AS senderName, m.content, m.created_at
        FROM messages m
        JOIN users u ON u.username = m.sender_username
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
    `;

    connection.query(sql, [conversationId], (err, results) => {
        if (err) {
            console.error('Error fetching conversation messages:', err);
            res.status(500).json({ error: 'Failed to retrieve messages' });
        } else {
            const messages = results.map((row) => ({
                id: String(row.id),
                senderId: String(row.senderId),
                senderName: row.senderName,
                content: row.content,
                created_at: row.created_at,
            }));
            res.json(messages);
        }
        connection.end();
    });
});

// 3) POST /api/conversations/:conversationId/messages - send a new message (protected)
// Body: { content }
// Query: userId (required) - sender
// Returns: { id, senderId, senderName, content, created_at }
app.post('/api/conversations/:conversationId/messages', checkAuth, (req, res) => {
    const { conversationId } = req.params;
    const username = req.query.username;
    const { content } = req.body;

    if (!username || content == null || String(content).trim() === '') {
        return res.status(400).json({ error: 'username and content are required' });
    }

    const connection = mysql.createConnection(config);

    const insertSql = `
        INSERT INTO messages (conversation_id, sender_username, content)
        VALUES (?, ?, ?)
    `;
    connection.query(insertSql, [conversationId, username, String(content).trim()], (err, result) => {
        if (err) {
            console.error('Error inserting message:', err);
            res.status(500).json({ error: 'Failed to send message' });
            connection.end();
            return;
        }

        const newId = result.insertId;
        const selectSql = `
            SELECT m.id, m.sender_username AS senderId, u.display_name AS senderName, m.content, m.created_at
            FROM messages m
            JOIN users u ON u.username = m.sender_username
            WHERE m.id = ?
        `;
        connection.query(selectSql, [newId], (selectErr, rows) => {
            if (selectErr || !rows || rows.length === 0) {
                res.status(500).json({ error: 'Failed to retrieve sent message' });
            } else {
                const row = rows[0];
                res.status(201).json({
                    id: String(row.id),
                    senderId: String(row.senderId),
                    senderName: row.senderName,
                    content: row.content,
                    created_at: row.created_at,
                });
            }
            connection.end();
        });
    });
});

// --- Course Equivalency APIs ---

// GET /api/courses/user/:username - Get all courses for a specific user
app.get('/api/courses/user/:username', (req, res) => {
    const { username } = req.params;
    const sql = "SELECT * FROM course_equivalencies WHERE username = ? ORDER BY last_updated DESC";
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.send(results);
    });
});

// POST /api/courses - Create a new course equivalency (protected)
app.post('/api/courses', checkAuth, (req, res) => {
    const {
        username,
        uw_course_code,
        uw_course_name,
        host_course_code,
        host_course_name,
        host_university,
        country,
        continent,
        term_taken,
        proof_url
    } = req.body;

    const sql = `
        INSERT INTO course_equivalencies 
        (username, uw_course_code, uw_course_name, host_course_code, host_course_name, host_university, country, continent, term_taken, proof_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [username, uw_course_code, uw_course_name, host_course_code, host_course_name, host_university, country, continent, term_taken, proof_url];

    connection.query(sql, params, (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'This course equivalency has already been submitted.' });
            }
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.status(201).json({
            message: 'Course equivalency submitted successfully',
            course_id: results.insertId,
            status: 'Pending Review'
        });
    });
});

// PUT /api/courses/:id - Update an existing course equivalency (protected)
app.put('/api/courses/:id', checkAuth, (req, res) => {
    const { id } = req.params;
    const {
        uw_course_code,
        uw_course_name,
        host_course_code,
        host_course_name,
        host_university,
        country,
        continent,
        term_taken,
        proof_url
    } = req.body;

    const sql = `
        UPDATE course_equivalencies 
        SET uw_course_code = ?, uw_course_name = ?, host_course_code = ?, host_course_name = ?, host_university = ?, country = ?, continent = ?, term_taken = ?, proof_url = ?
        WHERE course_id = ?
    `;
    const params = [uw_course_code, uw_course_name, host_course_code, host_course_name, host_university, country, continent, term_taken, proof_url, id];

    connection.query(sql, params, (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.send({ success: true, message: 'Course updated successfully' });
    });
});

// DELETE /api/courses/:id - Delete a course equivalency (protected)
app.delete('/api/courses/:id', checkAuth, (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM course_equivalencies WHERE course_id = ?";
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.send({ success: true, message: 'Course deleted successfully' });
    });
});

// Toggle saved course (protected)
app.post('/api/users/:username/saved-courses', checkAuth, (req, res) => {
    const { username } = req.params;
    const { course_id } = req.body;
    
    // Logic: check if exists, if so delete (unsave), if not insert (save)
    const checkSql = "SELECT * FROM user_saved_courses WHERE username = ? AND course_id = ?";
    connection.query(checkSql, [username, course_id], (err, results) => {
        if (results.length > 0) {
            connection.query("DELETE FROM user_saved_courses WHERE username = ? AND course_id = ?", [username, course_id]);
            res.json({ saved: false });
        } else {
            connection.query("INSERT INTO user_saved_courses (username, course_id) VALUES (?, ?)", [username, course_id]);
            res.json({ saved: true });
        }
    });
});

app.get('/api/users/:username/saved-courses', (req, res) => {
    const { username } = req.params;
    const sql = `
        SELECT c.* FROM course_equivalencies c
        JOIN user_saved_courses s ON c.course_id = s.course_id
        WHERE s.username = ?`;
    connection.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/api/courses/meta/filters', (req, res) => {
    // We fetch the unique values currently in your DB to fill the dropdowns
    const sqlCountries = "SELECT DISTINCT country FROM course_equivalencies WHERE country IS NOT NULL";
    const sqlContinents = "SELECT DISTINCT continent FROM course_equivalencies WHERE continent IS NOT NULL";
    const sqlTerms = "SELECT DISTINCT term_taken FROM course_equivalencies WHERE term_taken IS NOT NULL";

    connection.query(`${sqlCountries}; ${sqlContinents}; ${sqlTerms}`, (error, results) => {
        if (error) {
            console.error('Filter Fetch Error:', error);
            // Fallback so the frontend doesn't crash
            return res.json({ countries: [], continents: [], terms: [] });
        }
        
        // results will be an array of 3 arrays because of the semicolons
        res.json({
            countries: results[0].map(r => r.country),
            continents: results[1].map(r => r.continent),
            terms: results[2].map(r => r.term_taken)
        });
    });
});

app.get('/api/courses', (req, res) => {
    const { q, country, continent, faculty, term, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    // Basic dynamic search logic
    let sql = "SELECT * FROM course_equivalencies WHERE 1=1";
    const params = [];

    if (q) {
        sql += " AND (host_university LIKE ? OR host_course_name LIKE ? OR host_course_code LIKE ?)";
        const search = `%${q}%`;
        params.push(search, search, search);
    }
    if (country) { sql += " AND country = ?"; params.push(country); }
    if (continent) { sql += " AND continent = ?"; params.push(continent); }
    if (term) { sql += " AND term_taken = ?"; params.push(term); }

    // First get total count for pagination
    connection.query(sql.replace("*", "COUNT(*) as total"), params, (err, countResult) => {
        if (err) return res.status(500).send(err);

        // Then get actual data with LIMIT
        sql += " LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        connection.query(sql, params, (err, results) => {
            if (err) return res.status(500).send(err);
            
            res.json({
                courses: results,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            });
        });
    });
});



// GET /api/courses/:id - Get a single course by ID
app.get('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT c.*, u.display_name 
        FROM course_equivalencies c 
        LEFT JOIN users u ON c.username = u.username 
        WHERE c.course_id = ?
    `;
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(results[0]);
    });
});

// --- End Course Equivalency APIs ---

// --- Sprint 2 APIs for matthew---

// GET /api/users/:username/milestones/export - export milestones as .ics calendar file
// Must stay BEFORE /:username/milestones to avoid :username catching 'export'
app.get('/api/users/:username/milestones/export', (req, res) => {
    const { username } = req.params;
    connection.query(
        "SELECT * FROM timeline_milestones WHERE username = ? ORDER BY deadline_utc",
        [username],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Failed to export calendar' });

            const fmt = d => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            const events = rows.map(m => [
                'BEGIN:VEVENT',
                `DTSTART:${fmt(m.deadline_utc)}`,
                `DTEND:${fmt(m.deadline_utc)}`,
                `SUMMARY:${m.title}`,
                `DESCRIPTION:${m.milestone_type} deadline${m.form_link ? ' - ' + m.form_link : ''}`,
                `STATUS:${m.is_completed ? 'COMPLETED' : 'NEEDS-ACTION'}`,
                'END:VEVENT',
            ].join('\r\n'));

            const ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//UW Exchange//Timeline//EN',
                'CALSCALE:GREGORIAN',
                ...events,
                'END:VCALENDAR',
            ].join('\r\n');

            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="exchange-deadlines.ics"');
            res.send(ics);
        }
    );
});

// GET /api/users/:username/milestones - supports phase and destination filters (Stories 1 & 2)
app.get('/api/users/:username/milestones', (req, res) => {
    const { username } = req.params;
    const { type, phase, destination } = req.query;

    let sql = `
        SELECT m.*,
               p.title AS prerequisite_title,
               p.is_completed AS prerequisite_completed
        FROM timeline_milestones m
        LEFT JOIN timeline_milestones p ON m.prerequisite_id = p.milestone_id
        WHERE m.username = ?
    `;
    const params = [username];

    if (type)        { sql += " AND m.milestone_type = ?";      params.push(type); }
    if (phase)       { sql += " AND m.phase = ?";               params.push(phase); }
    if (destination) { sql += " AND m.destination_country = ?"; params.push(destination); }

    sql += " ORDER BY m.phase, m.deadline_utc ASC";

    connection.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch milestones' });

        const now = Date.now();
        const enriched = rows.map(m => {
            const deadlineMs = new Date(m.deadline_utc).getTime();
            const hoursUntil = (deadlineMs - now) / (1000 * 60 * 60);
            const daysUntil  = Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24));
            return {
                ...m,
                days_remaining:     daysUntil > 0 ? daysUntil : 0,
                buffer_days:        m.is_completed ? daysUntil : null,
                is_approaching_48h: hoursUntil > 0 && hoursUntil <= 48,
                is_approaching_7d:  hoursUntil > 0 && hoursUntil <= 168,
                is_overdue:         hoursUntil < 0 && !m.is_completed,
            };
        });

        res.json(enriched);
    });
});

// POST /api/users/:username/milestones - create a new milestone
app.post('/api/users/:username/milestones', (req, res) => {
    const { username } = req.params;
    const {
        title,
        deadline_utc,
        milestone_type,
        prerequisite_id = null,
        form_link = null,
        phase = 'Research',
        destination_country = null
    } = req.body;

    if (!title || !deadline_utc || !milestone_type) {
        return res.status(400).json({ error: 'title, deadline_utc, and milestone_type are required' });
    }

    connection.query(
        "INSERT INTO timeline_milestones (username, title, deadline_utc, milestone_type, prerequisite_id, form_link, phase, destination_country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [username, title, deadline_utc, milestone_type, prerequisite_id, form_link, phase, destination_country],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to create milestone' });
            }
            res.status(201).json({ milestone_id: result.insertId });
        }
    );
});

// PATCH /api/milestones/:id - update a milestone (mark complete, edit fields)
app.patch('/api/milestones/:id', (req, res) => {
    const { id } = req.params;
    const { is_completed, title, deadline_utc, form_link, phase, destination_country } = req.body;
    const fields = [];
    const values = [];

    if (is_completed        !== undefined) { fields.push('is_completed = ?');        values.push(is_completed); }
    if (title               !== undefined) { fields.push('title = ?');               values.push(title); }
    if (deadline_utc        !== undefined) { fields.push('deadline_utc = ?');        values.push(deadline_utc); }
    if (form_link           !== undefined) { fields.push('form_link = ?');           values.push(form_link); }
    if (phase               !== undefined) { fields.push('phase = ?');               values.push(phase); }
    if (destination_country !== undefined) { fields.push('destination_country = ?'); values.push(destination_country); }

    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

    values.push(id);
    connection.query(`UPDATE timeline_milestones SET ${fields.join(', ')} WHERE milestone_id = ?`, values, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update milestone' });
        }
        res.json({ message: 'Milestone updated' });
    });
});

// DELETE /api/milestones/:id - delete a milestone
app.delete('/api/milestones/:id', (req, res) => {
    connection.query("DELETE FROM timeline_milestones WHERE milestone_id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete milestone' });
        res.json({ message: 'Milestone deleted' });
    });
});

// GET /api/contacts - get all study abroad contacts (Story 3)
app.get('/api/contacts', (req, res) => {
    const sql = "SELECT * FROM study_abroad_contacts ORDER BY faculty, name";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch contacts' });
        }
        res.json(results);
    });
});

// GET /api/advisors - get all academic advisors (Story 4)
app.get('/api/advisors', (req, res) => {
    const sql = "SELECT * FROM academic_advisors ORDER BY faculty, name";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch advisors' });
        }
        res.json(results);
    });
});

// DELETE /api/users/:username - delete account with password confirmation (Story 6)
app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const { password } = req.body;

    // Verify password before deleting
    const verifySql = "SELECT password_hash FROM users WHERE username = ?";
    connection.query(verifySql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!results.length) return res.status(404).json({ error: 'User not found' });

        const stored = results[0].password_hash;
        // TODO: Replace plain comparison with bcrypt.compare() when password hashing is added
        if (stored && stored !== password) {
            return res.status(401).json({ error: 'Password incorrect' });
        }

        connection.query("DELETE FROM users WHERE username = ?", [username], (delErr) => {
            if (delErr) return res.status(500).json({ error: 'Failed to delete account' });
            res.json({ message: 'Account deleted successfully' });
        });
    });
});

// PUT /api/users/:username/type - update user type selection (Story 7)
app.put('/api/users/:username/type', (req, res) => {
    const { username } = req.params;
    const { user_type } = req.body;

    const valid = ['current_exchange', 'prospective', 'alumni', 'browsing'];
    if (!valid.includes(user_type)) {
        return res.status(400).json({ error: 'Invalid user type' });
    }

    const sql = "UPDATE users SET user_type = ? WHERE username = ?";
    connection.query(sql, [user_type, username], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update user type' });
        res.json({ success: true, user_type });
    });
});

// POST /api/auth/signout - sign out (Story 8)
// Stateless for now — client handles session clearing
// Future: invalidate server-side session token here
app.post('/api/auth/signout', (req, res) => {
    res.json({ success: true, message: 'Signed out successfully' });
});

// GET /api/users/:username/tags - get profile tags for a user (Story 9)
app.get('/api/users/:username/tags', (req, res) => {
    const { username } = req.params;
    const sql = "SELECT * FROM profile_tags WHERE username = ? ORDER BY tag_type";
    connection.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch tags' });
        res.json(results);
    });
});

// POST /api/users/:username/tags - upsert tags from profile fields (Story 9)
app.post('/api/users/:username/tags', (req, res) => {
    const { username } = req.params;
    const { program, grad_year, destination_country, destination_school, exchange_term } = req.body;

    const tags = [];
    if (program)             tags.push([username, 'program', program]);
    if (grad_year)           tags.push([username, 'year', String(grad_year)]);
    if (destination_country) tags.push([username, 'country', destination_country]);
    if (destination_school)  tags.push([username, 'school', destination_school]);
    if (exchange_term)       tags.push([username, 'term', exchange_term]);

    if (!tags.length) return res.json({ success: true });

    // Delete old tags and reinsert fresh
    connection.query("DELETE FROM profile_tags WHERE username = ?", [username], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update tags' });

        connection.query("INSERT INTO profile_tags (username, tag_type, tag_value) VALUES ?", [tags], (insErr) => {
            if (insErr) return res.status(500).json({ error: 'Failed to insert tags' });
            res.json({ success: true });
        });
    });
});

// --- End Sprint 2 APIs ---

    app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version