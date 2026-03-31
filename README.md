# SyllabusAI 🎓

> AI-Powered Personalized Learning Platform

## 🚀 Live Demo
- Frontend: https://syllabusai-two.vercel.app
- Backend: https://syllabusai-backend.onrender.com

## 💡 What is SyllabusAI?
SyllabusAI is a full-stack AI platform where students upload their college syllabus and get a personal AI teacher, exam predictor, doubt solver, and career guide — all in one place, completely free.

## 🤖 AI Agents
- 🗺️ **Mentor Agent** — Builds personalized learning roadmap
- 📚 **Teacher Agent** — Explains topics from your syllabus
- ❓ **Examiner Agent** — Generates personalized quizzes
- 🐛 **Debugger Agent** — Fixes and reviews your code
- 📈 **Coach Agent** — Daily study plans + motivation
- 🔍 **Research Agent** — Answers doubts deeply

## 🛠️ Tech Stack
### Frontend
- React.js + Vite
- Tailwind CSS
- Zustand (state management)
- Socket.io client
- Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Redis (session management)
- Socket.io (WebSockets)
- JWT Authentication
- Passport.js (Google OAuth)

### AI
- Groq API (LLaMA 3.3 70B)
- LangChain
- Vector Database (Pinecone)

### DevOps
- Docker + Docker Compose
- Render (backend deployment)
- Vercel (frontend deployment)
- GitHub Actions (CI/CD)

## ✨ Features
- 📄 Upload syllabus PDF → AI reads and understands it
- 🧬 Learning DNA — personalized to your learning style
- 🤖 6 specialized AI agents working together
- 💾 Memory system — AI remembers your conversations
- 📊 Progress tracking dashboard
- 🏆 Gamification (streaks, badges)
- 💼 Career Bridge — matches syllabus skills to real jobs
- 🛡️ Admin dashboard
- 🔐 JWT + Google OAuth authentication
- 📱 Mobile responsive

## 🏗️ Architecture
\`\`\`
Frontend (React) → Backend (Node.js) → AI Agents (Groq)
                                     → MongoDB (data)
                                     → WebSockets (real-time)
\`\`\`

## 🚀 Setup Locally

### Prerequisites
- Node.js v20+
- MongoDB
- Groq API Key

### Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Docker
\`\`\`bash
docker-compose up
\`\`\`

## 🌍 Environment Variables
\`\`\`env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
GROQ_API_KEY=your_groq_key
CLIENT_URL=your_frontend_url
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
\`\`\`

## 👥 Team
Built with ❤️ by Sahil Gupta

## 📄 License
MIT License