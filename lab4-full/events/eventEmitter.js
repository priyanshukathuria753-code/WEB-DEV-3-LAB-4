// events/eventEmitter.js - Node.js EventEmitter (event-driven programming)
//   emit() = announce that something happened
//   on()   = run code when that event happens
const EventEmitter = require('events');
const appEvents = new EventEmitter();

appEvents.on('userRegistered', function (username) {
  console.log('[EVENT] userRegistered -> Welcome, ' + username + '!');
});

appEvents.on('userLoggedIn', function (username) {
  console.log('[EVENT] userLoggedIn -> ' + username + ' at ' + new Date().toLocaleTimeString());
});

appEvents.on('loginFailed', function (email) {
  console.log('[EVENT] loginFailed -> wrong login attempt for ' + email);
});

appEvents.on('noteCreated', function (title) {
  console.log('[EVENT] noteCreated -> "' + title + '"');
});

appEvents.on('noteDeleted', function (title) {
  console.log('[EVENT] noteDeleted -> "' + title + '"');
});

appEvents.on('chatMessage', function (username, text) {
  console.log('[EVENT] chatMessage -> ' + username + ': ' + text);
});

module.exports = appEvents;
