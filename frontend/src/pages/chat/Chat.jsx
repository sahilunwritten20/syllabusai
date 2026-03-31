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
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
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

      const aiMsg = {
        role: 'assistant',
        content: res.data.message
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      toast.error('Failed to send message');
    }

    setLoading(false);
  };

  // Clear chat
  const clearChat = async () => {
    await chatAPI.clearChat(activeAgent.id);
    setMessages([]);
    toast.success('Chat cleared!');
  };

  // 🎤 Voice Start
  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await API.post('/voice/speech-to-text', formData);
          setInput(res.data.text || '');
          toast.success('Voice captured!');
        } catch {
          toast.error('Voice failed');
        }
      };

      recorder.start();
      setRecording(true);

      // Auto stop after 10s
      setTimeout(() => stopRecording(stream), 10000);

    } catch {
      toast.error('Microphone access denied');
    }
  };

  // 🎤 Stop Voice
  const stopRecording = (stream) => {
    mediaRecorderRef.current?.stop();
    stream?.getTracks().forEach(t => t.stop());
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

          <button
            onClick={clearChat}
            className="border px-3 py-1 rounded-lg text-red-400"
          >
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : ''
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600'
                      : 'bg-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-4 bg-gray-900">
            <div className="flex gap-3">

              {/* Mic */}
              <button
                onClick={() =>
                  recording
                    ? stopRecording()
                    : startVoice()
                }
                className={`px-4 py-3 rounded-xl ${
                  recording
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-gray-700'
                }`}
              >
                {recording ? '⏹️' : '🎤'}
              </button>

              {/* Input */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Ask ${activeAgent.name}...`}
                className="flex-1 bg-gray-800 px-4 py-3 rounded-xl outline-none"
                disabled={loading}
              />

              {/* Send */}
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
                🎤 Recording... speak now
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}