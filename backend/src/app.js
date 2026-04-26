const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// 🔐 Optional (recommended for production)
const hpp = require('hpp');
const xss = require('xss-clean');

const app = express();

// ======================================
// ✅ TRUST PROXY (IMPORTANT FOR RENDER)
// ======================================
app.set('trust proxy', 1);

// ======================================
// ✅ SECURITY HEADERS (HELMET)
// ======================================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "script-src": ["'self'", "'unsafe-inline'"], // ⚠️ tighten later
        "style-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", "https:"],
      },
    },
  })
);

// ======================================
// ✅ CORS
// ======================================
app.use(
  cors({
    origin: "https://syllabusai-two.vercel.app", // 🔥 replace with frontend URL in production
    credentials: true,
  })
);

// ======================================
// ✅ EXTRA SECURITY (RECOMMENDED)
// ======================================

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Prevent XSS attacks
app.use(xss());

// Fallback manual sanitization (extra safety layer)
app.use((req, res, next) => {
  if (req.query) {
    for (let key in req.query) {
      let value = req.query[key];

      if (typeof value === 'string') {
        req.query[key] = value.replace(/[<>$]/g, '');
      }

      if (Array.isArray(value)) {
        req.query[key] = value[0];
      }
    }
  }
  next();
});

// ======================================
// ✅ RATE LIMITERS
// ======================================

// 🔹 General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔹 Auth limiter (login/signup protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔹 Chat limiter (AI spam control)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Slow down! Too many messages.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================================
// ✅ BODY PARSING
// ======================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ======================================
// ✅ LOGGER
// ======================================
app.use(morgan('dev'));

// ======================================
// ✅ APPLY RATE LIMITS
// ======================================
app.use('/api', generalLimiter);

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use('/api/chat', chatLimiter);

// ======================================
// ✅ HEALTH CHECK
// ======================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 SyllabusAI Server is Running!',
    version: '1.0.0',
  });
});

// ======================================
// ✅ ROUTES
// ======================================
const passport = require('./config/passport');
app.use(passport.initialize());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/syllabus', require('./routes/syllabusRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/examiner', require('./routes/examinerRoutes'));
app.use('/api/debugger', require('./routes/debuggerRoutes'));
app.use('/api/coach', require('./routes/coachRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tools', require('./routes/toolsRoutes'));
app.use('/api/keys', require('./routes/apiKeyRoutes'));
app.use('/api/prompts', require('./routes/promptRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));

// ======================================
// ❌ 404 HANDLER
// ======================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ======================================
// ❌ GLOBAL ERROR HANDLER
// ======================================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;