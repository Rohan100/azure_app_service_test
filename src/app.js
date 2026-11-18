const express = require('express');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { orders } = require('./data/store');

const app = express();
const startedAt = Date.now();
let totalRequests = 0;

// Count each incoming HTTP request, including health checks and unknown routes.
app.use((req, res, next) => {
  totalRequests += 1;
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    application: process.env.APP_NAME || 'TechMart',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.get('/metrics', (req, res) => {
  res.json({
    totalApiRequests: totalRequests,
    totalOrders: orders.length,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000)
  });
});

// Keep unknown paths in the same JSON error format as other API errors.
app.use((req, res) => {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.originalUrl} was not found.` } });
});

// Express error middleware handles malformed JSON and unexpected errors.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: { message: 'Request body must contain valid JSON.' } });
  }

  console.error('Unexpected request error:', error);
  return res.status(500).json({ error: { message: 'An unexpected server error occurred.' } });
});

module.exports = app;
