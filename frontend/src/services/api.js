import axios from 'axios';

const API = axios.create({
  baseURL: 'https://syllabusai-backend.onrender.com/api',
  withCredentials: true,
  timeout: 120000 // 2 minutes for large files
});

// ==========================================
// ADD TOKEN TO EVERY REQUEST
// ==========================================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==========================================
// HANDLE TOKEN EXPIRY
// ==========================================
API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Only redirect if NOT already on auth pages
      if (
        currentPath !== '/login' &&
        currentPath !== '/signup'
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// AUTH APIs
// ==========================================
export const authAPI = {
  signup: (data) =>
    API.post('/auth/signup', data),

  login: (data) =>
    API.post('/auth/login', data),

  getMe: () =>
    API.get('/auth/me'),

  logout: () =>
    API.post('/auth/logout'),

  forgotPassword: (email) =>
    API.post('/auth/forgot-password', {
      email
    }),

  resetPassword: (token, newPassword) =>
    API.post('/auth/reset-password', {
      token,
      newPassword
    })
};

// ==========================================
// SYLLABUS APIs
// ==========================================
export const syllabusAPI = {
  upload: (formData) =>
    API.post('/syllabus/upload', formData),

  getMy: () =>
    API.get('/syllabus/my'),

  markComplete: (
    subjectId,
    unitId,
    topicId
  ) =>
    API.patch(
      `/syllabus/complete/${subjectId}/${unitId}/${topicId}`
    )
};

// ==========================================
// CHAT APIs
// ==========================================
export const chatAPI = {

  // ----------------------------------------
  // SEND MESSAGE
  // ----------------------------------------
  // sessionId is optional.
  // If sessionId exists, message is added
  // to that chat.
  //
  // If sessionId is null, backend creates
  // a new chat session.
  // ----------------------------------------
  sendMessage: (
    message,
    agentType,
    sessionId = null
  ) =>
    API.post('/chat/message', {
      message,
      agentType,
      sessionId
    }),

  // ----------------------------------------
  // GET ALL CHAT SESSIONS FOR AN AGENT
  // ----------------------------------------
  getHistory: (agentType) =>
    API.get(`/chat/history/${agentType}`),

  // ----------------------------------------
  // GET ONE SPECIFIC CHAT SESSION
  // ----------------------------------------
  getSession: (sessionId) =>
    API.get(`/chat/session/${sessionId}`),

  // ----------------------------------------
  // CREATE NEW CHAT SESSION
  // ----------------------------------------
  createSession: (agentType) =>
    API.post('/chat/session', {
      agentType
    }),

  // ----------------------------------------
  // DELETE ONE CHAT SESSION
  // ----------------------------------------
  deleteSession: (sessionId) =>
    API.delete(`/chat/session/${sessionId}`)
};

// ==========================================
// TEACHER APIs
// ==========================================
export const teacherAPI = {
  teach: (topic, subject) =>
    API.post('/teacher/teach', {
      topic,
      subject
    })
};

// ==========================================
// EXAMINER APIs
// ==========================================
export const examinerAPI = {
  getQuiz: (
    topic,
    subject,
    difficulty
  ) =>
    API.post('/examiner/quiz', {
      topic,
      subject,
      difficulty
    }),

  checkAnswer: (data) =>
    API.post('/examiner/check', data)
};

// ==========================================
// COACH APIs
// ==========================================
export const coachAPI = {
  getDailyPlan: () =>
    API.post('/coach/plan', {}),

  getMotivation: () =>
    API.get('/coach/motivate')
};

// ==========================================
// RESEARCH APIs
// ==========================================
export const researchAPI = {
  askDoubt: (question, context) =>
    API.post('/research/doubt', {
      question,
      context
    })
};

// ==========================================
// DEFAULT API
// ==========================================
export default API;