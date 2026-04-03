import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://syllabusai-backend.onrender.com/api',
  withCredentials: true
});

const AGENTS = [
  { id: 'teacher', name: 'Teacher', icon: '📚' },
  { id: 'examiner', name: 'Examiner', icon: '❓' },
  { id: 'debugger', name: 'Debugger', icon: '🐛' },
  { id: 'coach', name: 'Coach', icon: '📈' },
  { id: 'research', name: 'Research', icon: '🔍' },
  { id: 'mentor', name: 'Mentor', icon: '🎯' },
];

export default function Chat() {
  const { user } = useAuthStore();

  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎤 Voice states
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const messagesEndRef = useRef(null);

  // Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history
  useEffect(() => {
    loadHistory();
  }, [activeAgent]);

  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory(activeAgent.id);
      setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(input, activeAgent.id);
      const aiMsg = { role: 'assistant', content: res.data.message };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
  console.error(err);
  toast.error(err.response?.data?.message || 'Failed to send message');
}

    setLoading(false);
  };

  // Clear chat
  const clearChat = async () => {
    await chatAPI.clearChat(activeAgent.id);
    setMessages([]);
    toast.success('Chat cleared!');
  };

  // 🎤 START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (blob.size < 100) {
          toast.error('Recording too short!');
          return;
        }

        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        toast.loading('Converting...', { id: 'voice' });

        try {
          const token = localStorage.getItem('token');

const res = await API.post('/voice/speech-to-text', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`
  }
});

          if (res.data.success) {
            setInput(res.data.text);
            toast.success('Voice captured 🎤', { id: 'voice' });
          } else {
            toast.error('Voice failed', { id: 'voice' });
          }
        } catch (err) {
          toast.error('Voice failed', { id: 'voice' });
        }
      };

      mediaRecorder.start();
      setRecording(true);

      // Auto stop (15s)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 15000);

    } catch {
      toast.error('Mic permission denied');
    }
  };

  // 🎤 STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between bg-gray-900">
        <Link to="/dashboard" className="text-2xl font-black">
          Syllabus<span className="text-blue-500">AI</span>
        </Link>

        <div className="flex gap-4 text-sm">
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/learn">📚 Learn</Link>
          <Link to="/exam">📝 Exam</Link>
          <Link to="/career">💼 Career</Link>

          <button onClick={clearChat} className="border px-3 py-1 rounded-lg text-red-400">
            🗑️ Clear
          </button>
        </div>
      </nav>

      <div className="flex flex-1">

        {/* Sidebar */}
        <div className="w-56 bg-gray-900 p-4 border-r border-gray-800">
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`w-full p-3 rounded-xl mb-2 ${
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

          {/* INPUT + VOICE */}
          <div className="border-t border-gray-800 p-4 bg-gray-900">
            <div className="flex gap-3 items-center">

              {/* MIC */}
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`p-3 rounded-xl ${
                  recording
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-gray-700'
                }`}
              >
                {recording ? '⏹️' : '🎤'}
              </button>

              {/* INPUT */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={recording ? 'Recording...' : `Ask ${activeAgent.name}...`}
                className="flex-1 bg-gray-800 px-4 py-3 rounded-xl outline-none"
                disabled={loading || recording}
              />

              {/* SEND */}
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 px-6 py-3 rounded-xl"
              >
                ↑
              </button>
            </div>

            {recording && (
              <p className="text-red-400 text-xs mt-2 text-center animate-pulse">
                🎤 Recording...
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}