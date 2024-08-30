const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour analyser les requêtes JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à la base de données MySQL
async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,       // Nom d'hôte de la base de données
    user: process.env.DB_USER,       // Nom d'utilisateur de la base de données
    password: process.env.DB_PASSWORD, // Mot de passe de la base de données
    database: process.env.DB_NAME,     // Nom de la base de données
  });
  return connection;
}

// Route pour récupérer toutes les entrées
app.get('/api/entries', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.query('SELECT * FROM entries');
    res.json(rows);
    await connection.end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des entrées' });
  }
});

// Route pour récupérer une seule entrée par ID
app.get('/api/entries/:id', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.query('SELECT * FROM entries WHERE id = ?', [req.params.id]);
    res.json(rows[0] || {});
    await connection.end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'entrée' });
  }
});

// Route pour créer une nouvelle entrée
app.post('/api/entries', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { title, content } = req.body;

    // Vérification des valeurs reçues
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const [result] = await connection.query('INSERT INTO entries (title, content) VALUES (?, ?)', [title, content]);
    
    res.status(201).json({ id: result.insertId, title, content });
    await connection.end();
  } catch (err) {
    console.error('Error inserting data: ', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'entrée' });
  }
});

// Route pour mettre à jour une entrée par ID
app.put('/api/entries/:id', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const { title, content } = req.body;
    await connection.query('UPDATE entries SET title = ?, content = ? WHERE id = ?', [title, content, req.params.id]);
    res.json({ id: req.params.id, title, content });
    await connection.end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entrée' });
  }
});

// Route pour supprimer une entrée par ID
app.delete('/api/entries/:id', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    await connection.query('DELETE FROM entries WHERE id = ?', [req.params.id]);
    res.status(204).end();
    await connection.end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'entrée' });
  }
});

// Route pour afficher une entrée (pour simuler la lecture d'une entrée sur le front)
app.get('/api/play/:id', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.query('SELECT * FROM entries WHERE id = ?', [req.params.id]);
    const entry = rows[0];
    if (entry) {
      res.send(`<h1>${entry.title}</h1><p>${entry.content}</p>`);
    } else {
      res.status(404).send('Entrée non trouvée');
    }
    await connection.end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la lecture de l\'entrée' });
  }
});

// Route principale pour servir la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
