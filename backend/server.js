require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');

const aiRoutes = require('./routes/ai');
const validateEnv = require('./utils/validateEnv');
const webhookController = require('./controllers/webhookController');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const isProduction = process.env.NODE_ENV === 'production';
const DB_READY_STATE = 1;
const DB_UNAVAILABLE_MESSAGE =
  'Service is temporarily unavailable. Please try again in a moment.';

// Validate required env vars
validateEnv();

const app = express();
const BASE_PORT = Number(process.env.PORT) || 8080;
let server;

// Trust proxy in production (needed for secure cookies behind proxy, etc.)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
  })
);

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting on /api
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS allowed origins - Fixed and improved
const allowedOrigins = [
  'http://localhost:5173',
  // 'http://localhost:8080',
  'https://www.myprofilelink.in',
  'https://myprofilelink.in',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean) : [])
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or requests without origin header
      if (!origin) return callback(null, true);
      
      // In development, allow all origins for easier development
      if (!isProduction) return callback(null, true);
      
      // In production, allow only configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

const requireDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState === DB_READY_STATE) {
    return next();
  }

  return res.status(503).json({
    success: false,
    error: DB_UNAVAILABLE_MESSAGE,
  });
};

app.use('/api', requireDatabaseConnection);

// Stripe webhook must receive raw body for signature verification.
// This MUST be before any express.json() that would consume the body.
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  webhookController.handleWebhook
);

// Body parsers and middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    uptime: process.uptime(),
    dbState,
    dbMessage: isHealthy ? 'Connected' : 'Disconnected',
  });
});

// Static file serving for production (SPA, etc.)
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const statusCode = err.statusCode || 500;
  const message =
    isProduction && statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  const payload = { success: false, error: message };
  if (!isProduction) payload.stack = err.stack;

  res.status(statusCode).json(payload);
});

// DB connection
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is NOT defined!');
    process.exit(1);
  }

  console.log('🔎 Using MONGO_URI:', process.env.MONGO_URI.replace(/\/\/[^@]*@/, '//****:****@'));

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  console.log(`📂 Database name: ${conn.connection.name}`);
};

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Graceful shutdown failed:', err.message);
    process.exit(1);
  }
};

// Start server with port conflict handling in non-production
const startServer = (port) => {
  server = app.listen(port, '0.0.0.0', () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`
    );
    console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !isProduction) {
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} is in use. Retrying on port ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error(`❌ Failed to start server on port ${port}: ${err.message}`);
    process.exit(1);
  });
};

// Process-level handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  shutdown('UNHANDLED_REJECTION');
});
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Bootstrap
const bootstrap = async () => {
  try {
    await connectDB();
    startServer(BASE_PORT);
  } catch (err) {
    console.error('💥 Startup failed:', err.message);
    process.exit(1);
  }
};

bootstrap();
