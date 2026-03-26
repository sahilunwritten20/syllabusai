const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { verifyAccessToken } = require('./src/utils/jwt');
const Groq = require('groq-sdk');
const { saveMessage, buildContext } = require('./src/services/memoryService');
const User = require('./src/models/User');
const Syllabus = require('./src/models/Syllabus');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket Auth Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    const decoded = verifyAccessToken(token);
    socket.userId = decoded.userId;
    socket.role = decoded.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket Connection
io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.userId}`);

  // Join personal room
  socket.join(socket.userId);

  // ✅ Real-time AI Chat with streaming feel
  socket.on('chat:message', async (data) => {
    try {
      const { message, agentType } = data;

      const user = await User.findById(socket.userId);
      const syllabus = await Syllabus.findOne({ userId: socket.userId });
      const branch = syllabus?.branch || 'Computer Science';
      const semester = syllabus?.semester || 1;

      // Get memory
      const context = await buildContext(socket.userId, agentType);

      // Save user message
      await saveMessage(socket.userId, agentType, 'user', message);

      // Tell frontend AI is typing
      socket.emit('chat:typing', { agentType, isTyping: true });

      const systemPrompts = {
        teacher: `You are an expert teacher for ${branch} Semester ${semester} students named ${user.name}. Be encouraging.`,
        examiner: `You are an examiner for ${branch} students. Generate and evaluate questions.`,
        debugger: `You are a code debugger for ${branch} students. Help fix code issues.`,
        coach: `You are a motivating coach for ${user.name}. Keep them on track.`,
        research: `You are a research assistant for ${branch} Semester ${semester} students.`,
        mentor: `You are a career mentor for ${branch} students.`
      };

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompts[agentType] || systemPrompts.teacher },
          { role: 'user', content: context ? `${context}Current: ${message}` : message }
        ]
      });

      const aiResponse = response.choices[0].message.content;

      // Save AI response
      await saveMessage(socket.userId, agentType, 'assistant', aiResponse);

      // Stop typing indicator
      socket.emit('chat:typing', { agentType, isTyping: false });

      // Send response
      socket.emit('chat:response', {
        agentType,
        message: aiResponse,
        timestamp: new Date()
      });

    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`⚡ User disconnected: ${socket.userId}`);
  });
});

// Start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
🚀 ================================
   SyllabusAI Server Started!
   Port: ${PORT}
   Mode: ${process.env.NODE_ENV}
   WebSockets: ✅ Active
================================ 🚀
    `);
  });
});