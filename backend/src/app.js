const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

// ✅ Security Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests' }
});
app.use('/api', limiter);

// ✅ Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ✅ Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 SyllabusAI Server is Running!',
    version: '1.0.0'
  });
});

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const syllabusRoutes = require('./routes/syllabusRoutes');
app.use('/api/syllabus', syllabusRoutes);

const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/teacher', teacherRoutes);

const examinerRoutes = require('./routes/examinerRoutes');
app.use('/api/examiner', examinerRoutes);

const debuggerRoutes = require('./routes/debuggerRoutes');
app.use('/api/debugger', debuggerRoutes);

const coachRoutes = require('./routes/coachRoutes');
app.use('/api/coach', coachRoutes);

const researchRoutes = require('./routes/researchRoutes');
app.use('/api/research', researchRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);


// ✅ 404 Handler
app.use( (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});



// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;