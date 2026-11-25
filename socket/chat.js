// socket/chat.js - real-time chat using Socket.IO
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const appEvents = require('../events/eventEmitter');

function setupChat(io) {

  // ----- Security: only users with a valid token may connect -----
  io.use(function (socket, next) {
    const token = socket.handshake.auth.token;

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      next(new Error('Not authorized'));
    }
  });

  // ----- Runs every time a user connects -----
  io.on('connection', async function (socket) {
    const username = socket.user.username;
    console.log('[SOCKET] ' + username + ' connected');

    // send the last 10 saved messages to the new user
    const oldMessages = await Message.find().sort({ createdAt: -1 }).limit(10);
    socket.emit('oldMessages', oldMessages.reverse());

    // tell everybody that this user joined
    io.emit('systemMessage', username + ' joined the chat');

    // ----- when this user sends a message -----
    socket.on('sendMessage', async function (text) {
      if (!text || !text.trim()) return;

      await Message.create({ username: username, text: text });   // save in database

      io.emit('newMessage', { username: username, text: text });  // send to everyone
      appEvents.emit('chatMessage', username, text);
      console.log('[SOCKET] ' + username + ': ' + text);
    });

    // ----- typing indicator -----
    socket.on('typing', function () {
      socket.broadcast.emit('typing', username);   // everyone except the sender
    });

    // ----- when the user leaves -----
    socket.on('disconnect', function () {
      io.emit('systemMessage', username + ' left the chat');
      console.log('[SOCKET] ' + username + ' disconnected');
    });
  });
}

module.exports = setupChat;
