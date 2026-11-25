// routes/noteRoutes.js - Notes API (CRUD = Create, Read, Update, Delete)
const express = require('express');
const Note = require('../models/Note');
const checkLogin = require('../middleware/authMiddleware');
const appEvents = require('../events/eventEmitter');

const router = express.Router();

// Every route in this file needs a valid token
router.use(checkLogin);

// ---------- CREATE: POST /api/notes ----------
router.post('/', async function (req, res) {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const note = await Note.create({
      title: title,
      content: content,
      owner: req.user.id      // the logged-in user owns this note
    });

    appEvents.emit('noteCreated', note.title);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------- READ ALL: GET /api/notes ----------
router.get('/', async function (req, res) {
  try {
    const notes = await Note.find({ owner: req.user.id });   // only MY notes
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------- READ ONE: GET /api/notes/:id ----------
router.get('/:id', async function (req, res) {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: 'Invalid note id' });
  }
});

// ---------- UPDATE: PUT /api/notes/:id ----------
router.put('/:id', async function (req, res) {
  try {
    // owner check = you can only change your own notes
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { title: req.body.title, content: req.body.content },
      { new: true }    // return the updated note
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: 'Invalid note id' });
  }
});

// ---------- DELETE: DELETE /api/notes/:id ----------
router.delete('/:id', async function (req, res) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    appEvents.emit('noteDeleted', note.title);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid note id' });
  }
});

module.exports = router;
