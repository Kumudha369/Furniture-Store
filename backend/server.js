const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/products',        require('./routes/products'));
app.use('/api/orders',          require('./routes/orders'));
app.use('/api/layouts',         require('./routes/layouts'));
app.use('/api/contact',         require('./routes/contact'));
app.use('/api/reviews',         require('./routes/reviews'));
app.use('/api/admin',           require('./routes/admin'));
app.use('/api/recommendations', require('./routes/recommendations'));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Jothi Industrial And Furniture API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// ── 404 handler ─────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Connect MongoDB & Start Server ──────────────────────────
const PORT       = process.env.PORT       || 5000;
const MONGO_URI  = process.env.MONGODB_URI || 'mongodb://localhost:27017/jothi-furniture';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🪑  Jothi Industrial And Furniture');
    console.log('  📍  Ilampillai, Salem, Tamil Nadu');
    console.log('  🔢  GST: 33MUBPS8703H1ZA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅  MongoDB Connected Successfully');
    console.log(`  🗄️   Database: jothi-furniture`);
    app.listen(PORT, () => {
      console.log(`  🚀  API Server: http://localhost:${PORT}`);
      console.log(`  🏥  Health:     http://localhost:${PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  })
  .catch(err => {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  ❌  MongoDB Connection FAILED');
    console.error('  📋  Error:', err.message);
    console.error('');
    console.error('  🔧  Fix: Make sure MongoDB is running');
    console.error('  👉  Run: mongod  (in a separate terminal)');
    console.error('  👉  Or install MongoDB from: https://mongodb.com');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  });

module.exports = app;
