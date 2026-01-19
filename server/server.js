// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const helmet = require('helmet');
const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/error');
const logger = require('./middleware/logger');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// XSS protection middleware
const xssProtect = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss.filterXSS(req.body[key]);
        }
      });
    }
    
    // Sanitize query parameters
    if (req.query) {
      const sanitizedQuery = {};
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          sanitizedQuery[key] = xss.filterXSS(req.query[key]);
        } else {
          sanitizedQuery[key] = req.query[key];
        }
      });
      req.query = sanitizedQuery;
    }
    
    next();
  } catch (error) {
    console.error('XSS protection error:', error);
    next();
  }
};

// Import routes
const authRoutes = require('./routes/authRoutes');
const consumptionRoutes = require('./routes/consumption');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/aiRoutes');

// Initialize express
const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a room for real-time updates
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Client joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Set io in app for use in controllers
app.set('io', io);

// Set security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Prevent http param pollution
app.use(hpp());

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Apply XSS protection (must be after body parser)
app.use(xssProtect);

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotrackai';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/consumption', consumptionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handler middleware (must be after all other middleware and routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`MongoDB connected: ${MONGODB_URI}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});