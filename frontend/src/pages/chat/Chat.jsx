import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://syllabusai-backend.onrender.com',
  withCredentials: true
});

const AGENTS = [
  { id: 'teacher', name: 'Teacher', icon: '📚', desc: 'Explains topics' },
  { id: 'examiner', name: 'Examiner', icon: '❓', desc: 'Quizzes you' },
  { id: 'debugger', name: 'Debugger', icon: '🐛', desc: 'Fixes code' },
  { id: 'coach', name: 'Coach', icon: '📈', desc: 'Motivates you' },
  { id: 'research', name: 'Research', icon: '🔍', desc: 'Answers doubts' },
  { id: 'mentor', name: 'Mentor', icon: '🎯', desc: 'Career guide' },
];

export default function Chat() {
  const { user } = useAuthStore();
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 🎤 Voice states
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [activeAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await chatAPI.getHistory(activeAgent.id);
      setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    }
    setLoadingHistory(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(input, activeAgent.id);
      const aiMsg = {
        role: 'assistant',
        content: res.data.message,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      toast.error('Failed to send message');
    }
    setLoading(false);
  };

  const clearChat = async () => {
    await chatAPI.clearChat(activeAgent.id);
    setMessages([]);
    toast.success('Chat cleared!');
  };

  // 🎤 Voice Recording Function
  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await API.post('/voice/speech-to-text', formData);
          setInput(res.data.text);
          toast.success('Voice captured!');
        } catch {
          toast.error('Voice failed');
        }
      };

      mediaRecorder.start();
      setRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
      }, 10000);

    } catch {
      toast.error('Microphone access denied!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
  <Link to="/dashboard" className="text-2xl font-black">
    Syllabus<span className="text-blue-500">AI</span>
  </Link>
  <div className="flex gap-4 text-sm">
    <Link to="/dashboard" className="text-gray-400 hover:text-white">📊 Dashboard</Link>
    <Link to="/learn" className="text-gray-400 hover:text-white">📚 Learn</Link>
    <Link to="/exam" className="text-gray-400 hover:text-white">📝 Exam</Link>
    <Link to="/career" className="text-gray-400 hover:text-white">💼 Career</Link>
    <button onClick={clearChat} className="text-gray-400 hover:text-red-400 text-xs border border-gray-700 px-3 py-1 rounded-lg">
      🗑️ Clear Chat
    </button>
  </div>
</nav>s

      <div className="flex flex-1">

        {/* Sidebar */}
        <div className="w-56 bg-gray-900 border-r border-gray-800 p-4">
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`w-full p-3 rounded-xl text-left mb-2 ${
                activeAgent.id === agent.id
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              {agent.icon} {agent.name}
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`px-4 py-3 rounded-xl ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 p-4 bg-gray-900">
            <div className="flex gap-2">

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-gray-800 px-4 py-3 rounded-xl"
                placeholder="Ask anything..."
              />

              {/* 🎤 Voice Button */}
              <button
                onClick={recording
                  ? () => {
                      mediaRecorderRef.current?.stop();
                      setRecording(false);
                    }
                  : startVoice}
                className={`px-4 py-3 rounded-xl ${
                  recording
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-gray-700'
                }`}
              >
                {recording ? '⏹️' : '🎤'}
              </button>

              {/* Send */}
              <button
                onClick={sendMessage}
                className="bg-blue-600 px-5 py-3 rounded-xl"
              >
                ↑
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}