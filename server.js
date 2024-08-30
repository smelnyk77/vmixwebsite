const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuration de la base de données MySQL
const db = mysql.createConnection({
    host: 'smelnykfxbsteph.mysql.db', // Ajoute l'adresse de ton serveur MySQL
    user: 'smelnykfxbsteph', // Ton nom d'utilisateur
    password: 'dckgtjAp92', // Ton mot de passe
    database: 'smelnykfxbsteph', // Nom de ta base de données
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connecté à MySQL');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Dossier pour les fichiers statiques (CSS, JS, etc.)

// Endpoints pour gérer les entrées
app.post('/api/entries', (req, res) => {
    const { title, content, type } = req.body;
    const sql = `INSERT INTO entries (title, content, type) VALUES (?, ?, ?)`;
    db.query(sql, [title, content, type], (err, result) => {
        if (err) throw err;
        res.status(201).send({ id: result.insertId, title, content, type });
    });
});

app.get('/api/entries', (req, res) => {
    const sql = `SELECT * FROM entries`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// Endpoint pour jouer une animation
app.post('/api/play', (req, res) => {
    const { id } = req.body;
    io.emit('playAnimation', id); // Emission d'un événement pour le front
    res.send({ status: 'Animation lancée', id });
});

server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
