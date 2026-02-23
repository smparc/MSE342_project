import mysql from 'mysql2';
import config from './config.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));

// API Routes
// TODO: Implement the following endpoints:
// GET /api/movies - retrieve all movies from database  
// POST /api/reviews - create a new movie review

// 1) GET /api/messages-list - conversation list (left sidebar)
// Query param: userId (required)
// Returns: [{ id, senderName, lastMessage, lastMessageAt, unread }]
app.get('/api/messages-list', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User is not logged in' });
    }

    const connection = mysql.createConnection(config);

    const sql = `
        SELECT 
            c.id,
            CASE WHEN c.user1_id = ? THEN u2.name ELSE u1.name END AS senderName,
            last_msg.content AS lastMessage,
            last_msg.created_at AS lastMessageAt,
            COALESCE(unread.cnt, 0) AS unread
        FROM conversations c
        LEFT JOIN users u1 ON u1.id = c.user1_id
        LEFT JOIN users u2 ON u2.id = c.user2_id
        LEFT JOIN (
            SELECT conversation_id, content, created_at, sender_id,
                ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) AS rn
            FROM messages
        ) last_msg ON last_msg.conversation_id = c.id AND last_msg.rn = 1
        LEFT JOIN (
            SELECT m.conversation_id, COUNT(*) AS cnt
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE ((c.user1_id = ? AND m.sender_id = c.user2_id) OR (c.user2_id = ? AND m.sender_id = c.user1_id))
                AND (m.is_read = 0 OR m.is_read IS NULL)
            GROUP BY m.conversation_id
        ) unread ON unread.conversation_id = c.id
        WHERE c.user1_id = ? OR c.user2_id = ?
        ORDER BY last_msg.created_at DESC
    `;

    const params = [userId, userId, userId, userId, userId];

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
        SELECT m.id, m.sender_id AS senderId, u.name AS senderName, m.content, m.created_at
        FROM messages m
        JOIN users u ON u.id = m.sender_id
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
// Query: userId (required) - sender
// Returns: { id, senderId, senderName, content, created_at }
app.post('/api/conversations/:conversationId/messages', (req, res) => {
    const { conversationId } = req.params;
    const userId = req.query.userId;
    const { content } = req.body;

    if (!userId || content == null || String(content).trim() === '') {
        return res.status(400).json({ error: 'userId and content are required' });
    }

    const connection = mysql.createConnection(config);

    const insertSql = `
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES (?, ?, ?)
    `;
    connection.query(insertSql, [conversationId, userId, String(content).trim()], (err, result) => {
        if (err) {
            console.error('Error inserting message:', err);
            res.status(500).json({ error: 'Failed to send message' });
            connection.end();
            return;
        }

        const newId = result.insertId;
        const selectSql = `
            SELECT m.id, m.sender_id AS senderId, u.name AS senderName, m.content, m.created_at
            FROM messages m
            JOIN users u ON u.id = m.sender_id
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

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
