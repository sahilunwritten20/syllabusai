import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const AGENTS = [
  { id: 'teacher', name: 'Teacher', icon: '📚', desc: 'Explains topics', color: 'blue' },
  { id: 'examiner', name: 'Examiner', icon: '❓', desc: 'Quizzes you', color: 'purple' },
  { id: 'debugger', name: 'Debugger', icon: '🐛', desc: 'Fixes code', color: 'cyan' },
  { id: 'coach', name: 'Coach', icon: '📈', desc: 'Motivates you', color: 'yellow' },
  { id: 'research', name: 'Research', icon: '🔍', desc: 'Answers doubts', color: 'green' },
  { id: 'mentor', name: 'Mentor', icon: '🎯', desc: 'Career guide', color: 'orange' },
];

export default function Chat() {
  const { user } = useAuthStore();
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
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
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden" style={{height: 'calc(100vh - 65px)'}}>
        {/* Agents Sidebar */}
        <div className="w-56 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Choose Agent</div>
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition w-full ${
                activeAgent.id === agent.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{agent.icon}</span>
              <div>
                <div className="text-sm font-semibold">{agent.name}</div>
                <div className="text-xs opacity-70">{agent.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeAgent.icon}</span>
              <div>
                <div className="font-bold">{activeAgent.name} Agent</div>
                <div className="text-xs text-green-400">● Online · Knows your syllabus</div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-xs text-gray-500 hover:text-red-400 transition"
            >
              Clear chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingHistory && (
              <div className="text-center text-gray-500 text-sm">Loading history...</div>
            )}

            {!loadingHistory && messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">{activeAgent.icon}</div>
                <div className="text-gray-400 font-medium">
                  Hi {user?.name?.split(' ')[0]}! I'm your {activeAgent.name} Agent.
                </div>
                <div className="text-gray-500 text-sm mt-2">
                  Ask me anything from your syllabus!
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {['Explain Binary Trees', 'Give me a quiz', 'Debug my code', 'Motivate me'].map(s => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0">
                    {activeAgent.icon}
                  </div>
                )}
                <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm flex-shrink-0 font-bold">
                    {user?.name?.[0]}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">
                  {activeAgent.icon}
                </div>
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-4 bg-gray-900">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Ask ${activeAgent.name} Agent anything...`}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition"
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