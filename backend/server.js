const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.use('/api', require('./routes/volunteerRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Health Check & Root Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'ZeroHunger Backend API (REST + WebSockets)',
    database: 'Connected to MongoDB Atlas (zerohunger)',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ZeroHunger Backend server (HTTP + WebSockets) running on http://localhost:${PORT}`);
});
