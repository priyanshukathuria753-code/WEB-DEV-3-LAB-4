// middleware/authMiddleware.js - checks that the user is logged in (valid JWT)
const jwt = require('jsonwebtoken');

function checkLogin(req, res, next) {
  // The client sends:  Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = header.split(' ')[1];   // take the part after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // error if fake or expired
    req.user = decoded;   // { id, username, role } - available in the next function
    next();               // continue to the route
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = checkLogin;
