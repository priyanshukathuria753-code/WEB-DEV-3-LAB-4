// models/Note.js - how a note is stored
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, default: '' },
  owner:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // who owns the note
}, { timestamps: true });   // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Note', noteSchema);
