// server.js - starting point of the project
require('dotenv').config();      // load values from the .env file FIRST

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const setupChat = require('./socket/chat');

// stop early if the secret key is missing
if (!process.env.JWT_SECRET) {
  console.log('Error: JWT_SECRET is missing in the .env file');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);   // Socket.IO needs the http server
const io = new Server(server);

// ----- middleware -----
app.use(express.json());                 // read JSON from request body
app.use(express.static('public'));       // serve the chat page

// ----- routes -----
app.use('/api/auth', authRoutes);        // /api/auth/signup, /login, /profile
app.use('/api/notes', noteRoutes);       // /api/notes ...
app.use('/api/admin', adminRoutes);      // /api/admin/users ...

// ----- unknown route -----
app.use(function (req, res) {
  res.status(404).json({ message: 'Route not found' });
});

// ----- chat -----
setupChat(io);

// ----- connect to database, then start server -----
const PORT = process.env.PORT || 3000;

connectDB()
  .then(function () {
    server.listen(PORT, function () {
      console.log('Server running at http://localhost:' + PORT);
    });
  })
  .catch(function (error) {
    console.log('MongoDB connection failed: ' + error.message);
  });
