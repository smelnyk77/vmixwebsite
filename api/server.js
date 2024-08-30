const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuration de la connexion à la base de données Supabase
const client = new Client({
  host: 'aws-0-eu-west-3.pooler.supabase.com',  // Remplace par l'hôte de Supabase
  port: 6543,  // Le port PostgreSQL par défaut
  user: 'postgres.ljqtyrmjdgncknufqjmu',  // Remplace par ton nom d'utilisateur
  password: 'smtMjdfNW92!',  // Remplace par ton mot de passe
  database: 'postgres'  // Remplace par le nom de ta base de données
});

client.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données', err.stack);
  } else {
    console.log('Connecté à la base de données');
  }
});

// Route pour ajouter une nouvelle entrée
app.post('/api/entries', async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO entries (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'insertion des données', err);
    res.status(500).json({ error: 'Erreur lors de l\'insertion des données' });
  }
});

// Route pour récupérer toutes les entrées
app.get('/api/entries', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM entries ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des données', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
