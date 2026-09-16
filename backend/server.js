const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/volunteerRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Health Check & Root Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'ZeroHunger Backend API',
    database: 'Connected to MongoDB Atlas (zerohunger)',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ZeroHunger Backend server running on http://localhost:${PORT}`);
});
