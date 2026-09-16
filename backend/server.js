const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const errorHandler = require('./src/middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// Attach io instance to express app so routes can broadcast
app.set('io', io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected via WebSocket: ${socket.id}`);

  // Join a specific food request mission chat room
  socket.on('join_room', (requestId) => {
    socket.join(requestId);
    console.log(`👥 Socket ${socket.id} joined mission room: ${requestId}`);
  });

  // Leave room
  socket.on('leave_room', (requestId) => {
    socket.leave(requestId);
    console.log(`👋 Socket ${socket.id} left room: ${requestId}`);
  });

  // Real-time message event: saves to MongoDB and broadcasts to room
  socket.on('send_message', async (data) => {
    try {
      const { requestId, senderId, senderName, senderRole, content } = data;
      if (!requestId || !content) return;

      const savedMessage = await Message.create({
        request: requestId,
        sender: senderId || 'vol-1',
        senderName: senderName || 'Volunteer',
        senderRole: senderRole || 'VOLUNTEER',
        content: content.trim()
      });

      // Broadcast to everyone in this request room (including sender)
      io.to(requestId).emit('receive_message', savedMessage);
      console.log(`💬 WebSocket Message broadcasted to room ${requestId}: "${content}"`);
    } catch (err) {
      console.error('❌ WebSocket message error:', err.message);
      socket.emit('error', { message: 'Failed to save/send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    service: 'Zero Hunger — Food Rescue Platform Backend',
    modules: ['Auth', 'Admin', 'Volunteer', 'Donor Requests', 'Donor Analytics', 'Donor Chat', 'Notifications', 'Google Maps API', 'WebSockets'],
    database: 'Connected to MongoDB Atlas (zerohunger)',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
// Auth & Admin Modules
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Donor Module & Google Maps Integration
app.use('/api/requests', require('./src/routes/donorRequestRoutes'));
app.use('/api/requests/:id/messages', require('./src/routes/donorChatRoutes'));
app.use('/api/donors/me', require('./src/routes/donorStatsRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/maps', require('./src/routes/mapRoutes'));

// Volunteer Module
app.use('/api', require('./routes/volunteerRoutes'));

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
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ZeroHunger Full Backend Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗺️  Google Maps API: ${process.env.GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not Set'}`);
    console.log(`🔌 WebSockets: Enabled`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
  });
}

module.exports = { app, server };
