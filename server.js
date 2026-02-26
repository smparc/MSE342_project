import mysql from 'mysql';
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

// API to get all posts for a user
app.get('/api/posts/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC";
  connection.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send(error);
    }
    res.send(results);
    });
});

// API Routes
// TODO: Implement the following endpoints:
// GET /api/movies - retrieve all movies from database  
// POST /api/reviews - create a new movie review

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
