const helmet = require('helmet');
const cors = require('cors');

// CORS configuration - allow both common frontend ports
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Security middleware setup
const securityMiddleware = [
  // Basic helmet protection
  helmet(),
  
  // CORS with options
  cors(corsOptions),
  
  // Additional security headers
  (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Basic XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Strict transport security (would be HTTPS in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content security policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
    
    next();
  }
];

module.exports = securityMiddleware;