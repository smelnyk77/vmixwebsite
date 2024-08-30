const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour analyser les requêtes JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simuler une base de données en utilisant un fichier JSON
const entriesFile = path.join(__dirname, 'entries.json');

// Charger les entrées depuis le fichier JSON
function loadEntries() {
  if (fs.existsSync(entriesFile)) {
    return JSON.parse(fs.readFileSync(entriesFile));
  }
  return [];
}

// Sauvegarder les entrées dans le fichier JSON
function saveEntries(entries) {
  fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2));
}

// Routes API pour les entrées
app.get('/api/entries', (req, res) => {
  res.json(loadEntries());
});

app.get('/api/entries/:id', (req, res) => {
  const entries = loadEntries();
  const entry = entries.find(e => e.id === req.params.id);
  res.json(entry || {});
});

app.post('/api/entries', (req, res) => {
  const entries = loadEntries();
  const newEntry = { id: Date.now().toString(), ...req.body };
  entries.push(newEntry);
  saveEntries(entries);
  res.status(201).json(newEntry);
});

app.put('/api/entries/:id', (req, res) => {
  const entries = loadEntries();
  const index = entries.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...req.body };
    saveEntries(entries);
    res.json(entries[index]);
  } else {
    res.status(404).send('Entrée non trouvée');
  }
});

app.delete('/api/entries/:id', (req, res) => {
  const entries = loadEntries();
  const filteredEntries = entries.filter(e => e.id !== req.params.id);
  saveEntries(filteredEntries);
  res.status(204).end();
});

app.get('/api/play/:id', (req, res) => {
  const entries = loadEntries();
  const entry = entries.find(e => e.id === req.params.id);
  if (entry) {
    // Simuler la lecture de l'entrée (remplace par ta logique d'animation)
    res.send(`<h1>${entry.title}</h1><p>${entry.content}</p>`);
  } else {
    res.status(404).send('Entrée non trouvée');
  }
});

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
