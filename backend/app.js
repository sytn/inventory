const express = require('express');
const cors = require('cors');
require('dotenv').config();
const securityMiddleware = require('./middleware/security');
const { apiLimiter } = require('./middleware/rateLimit');
const setupswagger = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware (add at the top, before other middleware)
app.use(securityMiddleware);
app.use('/api', apiLimiter); // Apply rate limiting to all /api routes
app.use(cors());
// Existing middleware
app.use(express.json());
setupswagger(app);

// Routes
app.use('/api', require('./routes/productRoutes'));
app.use('/api', require('./routes/inventoryRoutes'));
app.use('/api', require('./routes/stockMovementRoutes'));
app.use('/api', require('./routes/reportRoutes'));
app.use('/api', require('./routes/exportRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Textile Inventory API is running!' });
});

// Error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});