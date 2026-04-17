import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://syllabusai-backend.onrender.com/api',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
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
  const chunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage(input, activeAgent.id);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
    setLoading(false);
  };

  const clearChat = async () => {
    await chatAPI.clearChat(activeAgent.id);
    setMessages([]);
    toast.success('Chat cleared!');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 100) { toast.error('Too short!'); return; }
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        toast.loading('Converting...', { id: 'voice' });
        try {
          const res = await API.post('/voice/speech-to-text', formData);
          if (res.data.success) {
            setInput(res.data.text);
            toast.success('Voice captured 🎤', { id: 'voice' });
          }
        } catch (err) {
          toast.error('Voice failed', { id: 'voice' });
        }
      };

      recorder.start();
      setRecording(true);
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') stopRecording();
      }, 15000);
    } catch {
      toast.error('Microphone permission denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" style={{maxWidth: '100vw', overflowX: 'hidden'}}>

      {/* ✅ NAVBAR — full text on all screens */}
      <nav className="border-b border-gray-800 px-4 py-3 flex items-center justify-between bg-gray-900 flex-shrink-0">
        <Link to="/dashboard" className="text-lg font-black flex-shrink-0">
          Syllabus<span className="text-blue-500">AI</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">📊 Dashboard</Link>
          <Link to="/learn" className="text-gray-400 hover:text-white hidden sm:block">📚 Learn</Link>
          <Link to="/exam" className="text-gray-400 hover:text-white hidden sm:block">📝 Exam</Link>
          <Link to="/career" className="text-gray-400 hover:text-white hidden sm:block">💼 Career</Link>
          <button
            onClick={clearChat}
            className="border border-gray-700 px-2 py-1 rounded-lg text-red-400 text-xs"
          >
            🗑️ Clear
          </button>
        </div>
      </nav>

      {/* ✅ MOBILE AGENT SELECTOR — visible on mobile */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeAgent.id === agent.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <span>{agent.icon}</span>
              <span>{agent.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ✅ DESKTOP SIDEBAR — hidden on mobile */}
        <div className="hidden md:flex flex-col w-56 bg-gray-900 p-4 border-r border-gray-800 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">AI Agents</p>
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`w-full p-3 rounded-xl mb-2 text-left text-sm font-medium transition ${
                activeAgent.id === agent.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {agent.icon} {agent.name}
            </button>
          ))}
        </div>

        {/* ✅ CHAT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Active agent header */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-2">
            <span className="text-lg">{activeAgent.icon}</span>
            <span className="font-bold text-sm">{activeAgent.name} Agent</span>
            <span className="text-xs text-gray-500 ml-auto">
              {messages.length} messages
            </span>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-5xl mb-4">{activeAgent.icon}</div>
                <p className="text-lg font-bold text-gray-400">
                  Chat with {activeAgent.name} Agent
                </p>
                <p className="text-sm mt-2">Ask anything about your studies!</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-xs sm:max-w-sm md:max-w-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown
                      className="text-sm prose prose-invert max-w-none"
                      components={{
                        code: ({node, inline, children, ...props}) => (
                          inline
                            ? <code className="bg-gray-700 px-1 rounded text-blue-300 text-xs">{children}</code>
                            : <pre className="bg-gray-900 p-3 rounded-xl overflow-x-auto my-2 text-xs">
                                <code className="text-green-400">{children}</code>
                              </pre>
                        ),
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-gray-800 p-3 bg-gray-900 flex-shrink-0">
            <div className="flex gap-2 items-center">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`p-2.5 rounded-xl flex-shrink-0 ${
                  recording ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {recording ? '⏹️' : '🎤'}
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={recording ? '🎤 Recording...' : `Ask ${activeAgent.name}...`}
                className="flex-1 bg-gray-800 px-3 py-2.5 rounded-xl outline-none text-sm min-w-0"
                disabled={loading || recording}
              />

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2.5 rounded-xl flex-shrink-0 font-bold"
              >
                ↑
              </button>
            </div>

            {recording && (
              <p className="text-red-400 text-xs mt-2 text-center animate-pulse">
                🎤 Recording... tap ⏹️ to stop
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}