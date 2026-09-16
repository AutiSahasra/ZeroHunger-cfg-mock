const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/Message');

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

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', volunteerRoutes);
app.use('/api/messages', messageRoutes);

// Health Check & Root Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'ZeroHunger Backend API (Auth + Admin + Volunteer + WebSockets)',
    database: 'Connected to MongoDB Atlas (zerohunger)',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ZeroHunger Backend server running on http://localhost:${PORT}`);
});
