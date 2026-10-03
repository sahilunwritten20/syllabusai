import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://syllabusai-backend.onrender.com/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AGENTS = [
  { id: 'teacher',  name: 'Teacher',  icon: '📚', color: '#3B82F6', desc: 'Explains topics' },
  { id: 'examiner', name: 'Examiner', icon: '❓', color: '#8B5CF6', desc: 'Quiz & exams'   },
  { id: 'debugger', name: 'Debugger', icon: '🐛', color: '#10B981', desc: 'Fix code'        },
  { id: 'coach',    name: 'Coach',    icon: '📈', color: '#F59E0B', desc: 'Motivate you'   },
  { id: 'research', name: 'Research', icon: '🔍', color: '#06B6D4', desc: 'Deep answers'   },
  { id: 'mentor',   name: 'Mentor',   icon: '🎯', color: '#F97316', desc: 'Career guide'   },
];

// Group chat sessions by date
function groupByDate(sessions) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const week = new Date(today); week.setDate(week.getDate() - 7);
  const month = new Date(today); month.setDate(month.getDate() - 30);

  const groups = { Today: [], Yesterday: [], 'Last 7 Days': [], 'Last 30 Days': [], Older: [] };

  sessions.forEach(s => {
    const d = new Date(s.updatedAt || s.createdAt);
    if (d >= today) groups['Today'].push(s);
    else if (d >= yesterday) groups['Yesterday'].push(s);
    else if (d >= week) groups['Last 7 Days'].push(s);
    else if (d >= month) groups['Last 30 Days'].push(s);
    else groups['Older'].push(s);
  });

  return groups;
}

export default function Chat() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Chat sessions per agent
  const [sessions, setSessions] = useState({});
  // Active session id per agent
  const [activeSession, setActiveSession] = useState({});

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history when agent changes
  useEffect(() => {
    loadHistory();
    inputRef.current?.focus();
  }, [activeAgent]);

  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory(activeAgent.id);
      const msgs = res.data.messages || [];
      setMessages(msgs);

      // Build local sessions from history
      // Group messages into sessions by day
      buildSessions(activeAgent.id, msgs);
    } catch {
      setMessages([]);
    }
  };

  // Build sessions from messages grouped by day
  const buildSessions = (agentId, msgs) => {
    if (!msgs.length) return;

    const byDay = {};
    msgs.forEach(m => {
      const day = new Date(m.createdAt || Date.now()).toDateString();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(m);
    });

    const builtSessions = Object.entries(byDay).map(([day, dayMsgs]) => ({
      id: `${agentId}-${day}`,
      agentId,
      title: dayMsgs.find(m => m.role === 'user')?.content?.slice(0, 40) || 'New Chat',
      updatedAt: new Date(day),
      messages: dayMsgs,
    }));

    setSessions(prev => ({ ...prev, [agentId]: builtSessions }));
  };

  const startNewChat = async () => {
    await chatAPI.clearChat(activeAgent.id);
    setMessages([]);
    setActiveSession(prev => ({ ...prev, [activeAgent.id]: null }));
    toast.success(`New ${activeAgent.name} chat started!`);
    inputRef.current?.focus();
  };

  const loadSession = (session) => {
    setMessages(session.messages);
    setActiveSession(prev => ({ ...prev, [activeAgent.id]: session.id }));
  };

  const switchAgent = (agent) => {
    setActiveAgent(agent);
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
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      // Refresh sessions
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
    setLoading(false);
  };

  const clearChat = async () => {
    await chatAPI.clearChat(activeAgent.id);
    setMessages([]);
    setSessions(prev => ({ ...prev, [activeAgent.id]: [] }));
    toast.success('Chat cleared!');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 100) { toast.error('Too short!'); return; }
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        toast.loading('Converting...', { id: 'voice' });
        try {
          const res = await API.post('/voice/speech-to-text', formData);
          if (res.data.success) { setInput(res.data.text); toast.success('🎤 Voice captured!', { id: 'voice' }); }
        } catch { toast.error('Voice failed', { id: 'voice' }); }
      };
      recorder.start();
      setRecording(true);
      setTimeout(() => { if (mediaRecorderRef.current?.state === 'recording') stopRecording(); }, 15000);
    } catch { toast.error('Mic permission denied'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const agentSessions = sessions[activeAgent.id] || [];
  const groupedSessions = groupByDate(agentSessions);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0F1E', color: '#fff', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', maxWidth: '100vw' }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        background: '#060C18',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>

          {/* Logo + Toggle */}
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              Syllabus<span style={{ color: '#3B82F6' }}>AI</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, padding: 4, display: 'flex', alignItems: 'center' }}>☰</button>
          </div>

          {/* New Chat Button */}
          <div style={{ padding: '10px 12px', flexShrink: 0 }}>
            <button onClick={startNewChat} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 10, padding: '10px 14px', color: '#60A5FA', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.12)'}
            >
              <span style={{ fontSize: 16 }}>✏️</span> New Chat
            </button>
          </div>

          {/* Agent Selector */}
          <div style={{ padding: '4px 12px 8px', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 6, paddingLeft: 2 }}>AI AGENTS</div>
            {AGENTS.map(agent => (
              <button key={agent.id} onClick={() => switchAgent(agent)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                background: activeAgent.id === agent.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                color: activeAgent.id === agent.id ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                marginBottom: 2, transition: 'all 0.15s', textAlign: 'left',
              }}
                onMouseEnter={e => { if (activeAgent.id !== agent.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (activeAgent.id !== agent.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: activeAgent.id === agent.id ? `${agent.color}25` : 'rgba(255,255,255,0.05)',
                  border: activeAgent.id === agent.id ? `1px solid ${agent.color}40` : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>{agent.icon}</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{agent.desc}</div>
                </div>
                {activeAgent.id === agent.id && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: agent.color, flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {/* Chat History */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            className="no-scrollbar">
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', margin: '10px 0 6px 2px' }}>HISTORY</div>

            {agentSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 8px', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                No chat history yet.<br />Start a conversation!
              </div>
            ) : (
              Object.entries(groupedSessions).map(([group, groupSessions]) => {
                if (!groupSessions.length) return null;
                return (
                  <div key={group}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', padding: '6px 2px 4px', fontWeight: 600 }}>{group}</div>
                    {groupSessions.map(session => (
                      <button key={session.id} onClick={() => loadSession(session)} style={{
                        width: '100%', textAlign: 'left', background: activeSession[activeAgent.id] === session.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                        border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                        marginBottom: 2, transition: 'all 0.15s', display: 'block',
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      }}
                        onMouseEnter={e => { if (activeSession[activeAgent.id] !== session.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { if (activeSession[activeAgent.id] !== session.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {activeAgent.icon} {session.title}
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* User + Logout */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Student'}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{user?.plan || 'Free Plan'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Link to="/settings" style={{ flex: 1, textAlign: 'center', padding: '6px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none', transition: 'all 0.2s' }}>⚙️ Settings</Link>
              <button onClick={handleLogout} style={{ flex: 1, padding: '6px 0', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#F87171', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif' " }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT AREA ───────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(6,12,24,0.8)', backdropFilter: 'blur(10px)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Sidebar toggle when closed */}
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, padding: 4, display: 'flex' }}>☰</button>
            )}
            {/* Agent indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${activeAgent.color}20`, border: `1px solid ${activeAgent.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {activeAgent.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{activeAgent.name} Agent</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{activeAgent.desc}</div>
              </div>
            </div>
          </div>

          {/* Mobile agent tabs */}
          <div style={{ display: 'none' }} className="mobile-agents" />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Mobile: show agent switcher */}
            <div style={{ display: 'flex', gap: 4 }}>
              {AGENTS.map(a => (
                <button key={a.id} onClick={() => switchAgent(a)} title={a.name} style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeAgent.id === a.id ? `${a.color}25` : 'rgba(255,255,255,0.04)',
                  fontSize: 15, transition: 'all 0.15s',
                  outline: activeAgent.id === a.id ? `1px solid ${a.color}50` : 'none',
                }}>
                  {a.icon}
                </button>
              ))}
            </div>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />
            <button onClick={clearChat} title="Clear chat" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '5px 12px', color: '#F87171', cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }} className="no-scrollbar">
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{activeAgent.icon}</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em' }}>
                  Chat with <span style={{ color: activeAgent.color }}>{activeAgent.name}</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
                  {activeAgent.id === 'teacher' && 'Ask me to explain any topic from your syllabus clearly and simply.'}
                  {activeAgent.id === 'examiner' && 'Ask me to generate quiz questions or evaluate your answers.'}
                  {activeAgent.id === 'debugger' && 'Paste your code and I\'ll find bugs and fix them for you.'}
                  {activeAgent.id === 'coach' && 'Tell me your goals and I\'ll create your personalized study plan.'}
                  {activeAgent.id === 'research' && 'Ask me to research any topic with deep, comprehensive answers.'}
                  {activeAgent.id === 'mentor' && 'Ask me about career paths, skills, and opportunities in your field.'}
                </p>

                {/* Starter prompts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 520, margin: '0 auto' }}>
                  {(activeAgent.id === 'teacher' ? [
                    'Explain recursion in simple words', 'What is DBMS and its types?', 'Explain OOP concepts with examples', 'What is REST API?',
                  ] : activeAgent.id === 'examiner' ? [
                    'Generate 5 MCQs on arrays', 'Quiz me on linked lists', 'Create a mock exam on SQL', 'Test my OS knowledge',
                  ] : activeAgent.id === 'debugger' ? [
                    'Debug my Java code', 'Review my Python function', 'Fix my SQL query', 'Explain this error message',
                  ] : activeAgent.id === 'coach' ? [
                    'Create my study plan for exams', 'How to be more productive?', 'Help me stay consistent', 'Motivate me to study',
                  ] : activeAgent.id === 'research' ? [
                    'Research blockchain in depth', 'Explain machine learning', 'Deep dive into cloud computing', 'Research cybersecurity basics',
                  ] : [
                    'What careers suit my IT degree?', 'How to prepare for placements?', 'Best skills for software jobs', 'How to crack technical interviews?',
                  ]).map((prompt, i) => (
                    <button key={i} onClick={() => setInput(prompt)} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >{prompt}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {/* Label */}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 6, paddingLeft: msg.role === 'user' ? 0 : 4 }}>
                  {msg.role === 'user' ? '👤 You' : `${activeAgent.icon} ${activeAgent.name}`}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: msg.role === 'user' ? '72%' : '88%',
                  background: msg.role === 'user'
                    ? `linear-gradient(135deg, ${activeAgent.color}CC, ${activeAgent.color}99)`
                    : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                }}>
                  {msg.role === 'user' ? (
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{msg.content}</p>
                  ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                      <ReactMarkdown
                        components={{
                          code: ({ inline, children, ...props }) =>
                            inline
                              ? <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4, fontSize: 13, color: '#60A5FA', fontFamily: 'monospace' }} {...props}>{children}</code>
                              : <pre style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 10, overflowX: 'auto', margin: '8px 0' }}>
                                  <code style={{ fontSize: 12.5, color: '#6EE7B7', fontFamily: 'monospace', lineHeight: 1.6 }} {...props}>{children}</code>
                                </pre>,
                          p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: '4px 0 8px', paddingLeft: 20, color: 'rgba(255,255,255,0.75)' }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: '4px 0 8px', paddingLeft: 20, color: 'rgba(255,255,255,0.75)' }}>{children}</ol>,
                          li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
                          h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{children}</h1>,
                          h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#fff' }}>{children}</h2>,
                          h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: '#fff' }}>{children}</h3>,
                          strong: ({ children }) => <strong style={{ color: '#fff', fontWeight: 700 }}>{children}</strong>,
                          blockquote: ({ children }) => <blockquote style={{ borderLeft: `3px solid ${activeAgent.color}`, paddingLeft: 12, margin: '8px 0', color: 'rgba(255,255,255,0.6)' }}>{children}</blockquote>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 6, paddingLeft: 4 }}>{activeAgent.icon} {activeAgent.name}</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: activeAgent.color, animation: `bounce 1s infinite ${j * 0.15}s`, opacity: 0.8 }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: '12px 20px 16px', background: 'rgba(6,12,24,0.9)', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '8px 8px 8px 14px', transition: 'border-color 0.2s' }}>

              {/* Voice button */}
              <button onClick={recording ? stopRecording : startRecording} style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: recording ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                color: recording ? '#F87171' : 'rgba(255,255,255,0.4)', fontSize: 16,
                animation: recording ? 'pulse 1s infinite' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {recording ? '⏹️' : '🎤'}
              </button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={recording ? '🎤 Recording... tap ⏹️ to stop' : `Message ${activeAgent.name}...`}
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  resize: 'none', lineHeight: 1.6, paddingTop: 4, maxHeight: 120,
                  overflowY: 'auto',
                }}
                disabled={loading || recording}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              />

              {/* Send button */}
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                background: input.trim() ? activeAgent.color : 'rgba(255,255,255,0.06)',
                color: '#fff', fontSize: 16, transition: 'all 0.2s', opacity: !input.trim() ? 0.4 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                ↑
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
              Enter to send · Shift+Enter for new line · 🎤 for voice
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce {
          0%,100% { transform: translateY(0); opacity:0.4; }
          50% { transform: translateY(-5px); opacity:1; }
        }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50% { opacity:0.5; }
        }
        * { box-sizing: border-box; }
        @media (max-width: 640px) {
          /* Auto-close sidebar on mobile */
        }
      `}</style>
    </div>
  );
}
