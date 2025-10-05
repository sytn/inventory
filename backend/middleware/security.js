const helmet = require('helmet');
const cors = require('cors');

// Cors configuration

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Security middleware

const securityMiddleware = [
    helmet(),
    cors(corsOptions),

    (req, res, next) => {
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Basic XSS Protection
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Clickjacking Protection
        res.setHeader('X-Frame-Options', 'DENY');

        // Strict transport security (would be HTTPS in production)
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Content Security Policy
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        );

        next();
    }
];

module.exports = securityMiddleware