import mysql from 'mysql2';
import config from './config.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';

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

// API to upload a post
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // TODO: Replace hardcoded username with actual authenticated user session data
    const username = req.body.username || 'john.doe';
    const filePath = req.file.path;

    const sql = "INSERT INTO posts (username, image_path) VALUES (?, ?)";
    connection.query(sql, [username, filePath], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.send({
            success: true,
            message: 'File uploaded and saved to database',
            filePath: filePath,
            photoId: results.insertId
        });
    });
});

// API to delete a post

app.delete('/api/posts/:id', (req, res) => {
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

// API to get a user
app.get('/api/user/:username', (req, res) => {
    const username = req.params.username;
    const sql = "SELECT * FROM users WHERE username = ?";
    connection.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send(error);
        }
        res.send(results[0]);
    });
});

// API to update a user
app.put('/api/user/:username', (req, res) => {
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
            return res.status(500).send(error);
        }
        res.send(results);
    });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 1) GET /api/messages-list - conversation list (left sidebar)
// Query param: username (required) eventually
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
// Query param: username (optional, for future read receipts)
// Returns: [{ id, senderId, senderName, content, created_at }]
app.get('/api/conversations/:conversationId/messages', (req, res) => {
    const { conversationId } = req.params;
    const username = req.query.username;

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

// 3) POST /api/conversations/:conversationId/messages - send a new message
// Body: { content }
// Query: username (required) - sender
// Returns: { id, senderId, senderName, content, created_at }
app.post('/api/conversations/:conversationId/messages', (req, res) => {
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

// POST /api/courses - Create a new course equivalency
app.post('/api/courses', (req, res) => {
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

// PUT /api/courses/:id - Update an existing course equivalency
app.put('/api/courses/:id', (req, res) => {
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

// DELETE /api/courses/:id - Delete a course equivalency
app.delete('/api/courses/:id', (req, res) => {
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

// --- End Course Equivalency APIs ---
    app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
    
