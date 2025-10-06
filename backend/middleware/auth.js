const User = require('../models/User');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = User.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Token is not valid' });
      }

      // Check roles if specified
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }

      // Add user to request
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Token is not valid' });
    }
  };
};

module.exports = authMiddleware;