const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    service: 'Zero Hunger — Food Rescue Platform Backend',
    modules: ['Auth', 'Donor Requests', 'Donor Analytics', 'Donor Chat', 'Notifications', 'Google Maps API'],
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/requests', require('./src/routes/donorRequestRoutes'));
app.use('/api/requests/:id/messages', require('./src/routes/donorChatRoutes'));
app.use('/api/donors/me', require('./src/routes/donorStatsRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/maps', require('./src/routes/mapRoutes'));

// 404 Catch-All Route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ZeroHunger Donor Backend Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗺️  Google Maps API Key: ${process.env.GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not Set'}`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
  });
}

module.exports = app;
