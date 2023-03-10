const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const handlebars = require('handlebars');
const fs = require('fs');
const app = express();
app.use(express.static('public'));

// Set up multer for image uploads
const upload = multer({
    storage: multer.diskStorage({
      destination: './public/images/uploads',
      filename: (req, file, cb) => {
        // const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}.jpg`);
      }
    }),
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: (req, file, cb) => {
    //   if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        // return cb(new Error('Only image files are allowed!'));
    //       }
      cb(null, true);
    }
  });

const db = new sqlite3.Database('users.db');

db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            user_id INTEGER NOT NULL
        )`);

db.run(`CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            upload_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/users', (req, res) => {
    const { name, email, user_id } = req.body;
    db.run(`INSERT INTO users (name, email, user_id) VALUES (?, ?, ?)`, [name, email, user_id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to create user' });
        } else {
            const userId = this.lastID;
            res.status(201).json({ id: userId, name, email, user_id });
        }
    });
});

app.post('/users/:userId/images', upload.single('image'), (req, res) => {
    const { userId } = req.params;
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    
    const filename = req.file.filename;
    const sql = `INSERT INTO images (user_id, filename) VALUES (?, ?)`;
    db.run(sql, [userId, filename], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to upload image' });
        } else {
            const uploadTime = new Date().toISOString();
            res.status(201).json({ filename, uploadTime });
        }
    });
});
app.get('/', (req, res) => {
    const html = fs.readFileSync(path.join(__dirname, 'views', 'registration.hbs'), 'utf8');
    const template = handlebars.compile(html);
    const rendered = template();
    res.send(rendered);
});

app.get('/users/:userId/images', (req, res) => {
    const { userId } = req.params;
    const sql = `SELECT filename, upload_time FROM images WHERE user_id = ?`;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to retrieve images' });
        } else {
            const images = rows.map(row => ({ filename: row.filename, uploadTime: row.upload_time }));
            res.status(200).json({ userId, images });
        }
    });
});

app.get('/images', (req, res) => {
    const html = fs.readFileSync(path.join(__dirname, 'views', 'images.hbs'), 'utf8');
    const template = handlebars.compile(html);
    const rendered = template();
    res.send(rendered);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});



