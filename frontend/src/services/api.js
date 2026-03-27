import axios from 'axios';

const API = axios.create({
  baseURL: 'https://syllabusai-backend.onrender.com/api',
  withCredentials: true
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout')
};

// Syllabus APIs
export const syllabusAPI = {
  upload: (formData) => API.post('/syllabus/upload', formData),
  getMy: () => API.get('/syllabus/my'),
  markComplete: (subjectId, unitId, topicId) =>
    API.patch(`/syllabus/complete/${subjectId}/${unitId}/${topicId}`)
};

// Chat APIs
export const chatAPI = {
  sendMessage: (message, agentType) =>
    API.post('/chat/message', { message, agentType }),
  getHistory: (agentType) => API.get(`/chat/history/${agentType}`),
  clearChat: (agentType) => API.delete(`/chat/clear/${agentType}`)
};

// Teacher APIs
export const teacherAPI = {
  teach: (topic, subject) => API.post('/teacher/teach', { topic, subject })
};

// Examiner APIs
export const examinerAPI = {
  getQuiz: (topic, subject, difficulty) =>
    API.post('/examiner/quiz', { topic, subject, difficulty }),
  checkAnswer: (data) => API.post('/examiner/check', data)
};

// Coach APIs
export const coachAPI = {
  getDailyPlan: () => API.post('/coach/plan', {}),
  getMotivation: () => API.get('/coach/motivate')
};

// Research APIs
export const researchAPI = {
  askDoubt: (question, context) =>
    API.post('/research/doubt', { question, context })
};

export default API;