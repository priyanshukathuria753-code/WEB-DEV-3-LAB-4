// middleware/roleMiddleware.js - RBAC (Role Based Access Control)
// Usage: checkRole('admin')  -> only admins are allowed

function checkRole(requiredRole) {
  return function (req, res, next) {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden. ' + requiredRole + ' access only.' });
    }
    next();
  };
}

module.exports = checkRole;
