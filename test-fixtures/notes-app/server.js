const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('.'));

let notes = [];
let nextId = 1;

app.get('/notes', (req, res) => {
  res.json(notes);
});

app.post('/notes', (req, res) => {
  const note = { id: nextId++, title: req.body.title };
  notes.push(note);
  res.status(201).json(note);
});

// TODO: delete route — planted gap; front-end calls DELETE /notes/:id

app.listen(3000, () => console.log('Notes app on http://localhost:3000'));
