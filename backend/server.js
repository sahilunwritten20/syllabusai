
const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Connect to database then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
🚀 ================================
   SyllabusAI Server Started!
   Port: ${PORT}
   Mode: ${process.env.NODE_ENV}
================================ 🚀
    `);
  });
});