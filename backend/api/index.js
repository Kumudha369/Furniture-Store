const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://furniture-store-git-main-kumudha369s-projects.vercel.app'],
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

// ── MongoDB Connection ──────────────────────────────────────
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jothi-furniture';
  
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = mongoose.connection;
    console.log('✅ MongoDB Connected');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
}

// ── Vercel Serverless Export ────────────────────────────────
module.exports = async (req, res) => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Pass request to Express app
    app(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
