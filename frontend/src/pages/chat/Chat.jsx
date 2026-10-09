import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://syllabusai-backend.onrender.com/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const AGENTS = [
  {
    id: 'teacher',
    name: 'Teacher',
    icon: '📚',
    color: '#83A5FF',
    desc: 'Explains topics',
  },
  {
    id: 'examiner',
    name: 'Examiner',
    icon: '❓',
    color: '#B39AFF',
    desc: 'Quizzes and exams',
  },
  {
    id: 'debugger',
    name: 'Debugger',
    icon: '⌘',
    color: '#5DD6B2',
    desc: 'Helps fix code',
  },
  {
    id: 'coach',
    name: 'Coach',
    icon: '↗',
    color: '#FFD08A',
    desc: 'Builds consistency',
  },
  {
    id: 'research',
    name: 'Research',
    icon: '⌕',
    color: '#72D3E5',
    desc: 'In-depth answers',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: '◎',
    color: '#F4AD91',
    desc: 'Career guidance',
  },
];

function groupByDate(sessions) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const week = new Date(today);
  week.setDate(week.getDate() - 7);

  const month = new Date(today);
  month.setDate(month.getDate() - 30);

  const groups = {
    Today: [],
    Yesterday: [],
    'Last 7 Days': [],
    'Last 30 Days': [],
    Older: [],
  };

  sessions.forEach((session) => {
    const date = new Date(
      session.updatedAt || session.createdAt || Date.now()
    );

    if (Number.isNaN(date.getTime())) {
      groups.Older.push(session);
    } else if (date >= today) {
      groups.Today.push(session);
    } else if (date >= yesterday) {
      groups.Yesterday.push(session);
    } else if (date >= week) {
      groups['Last 7 Days'].push(session);
    } else if (date >= month) {
      groups['Last 30 Days'].push(session);
    } else {
      groups.Older.push(session);
    }
  });

  return groups;
}

const STARTER_PROMPTS = {
  teacher: [
    'Explain recursion in simple words',
    'What is DBMS and its types?',
    'Explain OOP with examples',
    'What is a REST API?',
  ],
  examiner: [
    'Generate 5 MCQs on arrays',
    'Quiz me on linked lists',
    'Create a mock exam on SQL',
    'Test my OS knowledge',
  ],
  debugger: [
    'Debug my Java code',
    'Review my Python function',
    'Fix my SQL query',
    'Explain this error message',
  ],
  coach: [
    'Create my study plan for exams',
    'How can I be more productive?',
    'Help me stay consistent',
    'Motivate me to study',
  ],
  research: [
    'Research blockchain in depth',
    'Explain machine learning',
    'Explore cloud computing',
    'Research cybersecurity basics',
  ],
  mentor: [
    'What careers suit my IT degree?',
    'How should I prepare for placements?',
    'Best skills for software jobs',
    'How do I prepare for technical interviews?',
  ],
};

const AGENT_INTRODUCTIONS = {
  teacher:
    'Ask me to explain any topic from your syllabus clearly, step by step.',
  examiner:
    'Generate practice questions, test your knowledge, and prepare for exams.',
  debugger:
    'Share your code or error message to investigate bugs and understand solutions.',
  coach:
    'Tell me your goals and challenges to build a more consistent study routine.',
  research:
    'Explore complex subjects through detailed explanations and structured answers.',
  mentor:
    'Explore career paths, technical skills, and opportunities in your field.',
};

const Icon = ({ name, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    send: <path d="m5 12 14-7-4 14-3-6-7-1Z" />,
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 10v6M14 10v6" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="m19.4 15 .1.1 1.2 1-1.4 2.4-1.5-.6a8.3 8.3 0 0 1-1.8 1l-.2 1.6h-2.8l-.3-1.6a8.3 8.3 0 0 1-1.8-1l-1.5.6L6 16.1l1.2-1.1A7.5 7.5 0 0 1 7 13.1l-1.5-.8v-2.7L7 8.9a7.5 7.5 0 0 1 .3-1.9L6 5.9l1.4-2.4 1.5.6a8.3 8.3 0 0 1 1.8-1l.3-1.6h2.8l.2 1.6a8.3 8.3 0 0 1 1.8 1l1.5-.6 1.4 2.4-1.2 1.1a7.5 7.5 0 0 1 .3 1.9l1.5.7v2.7l-1.5.8a7.5 7.5 0 0 1-.4 1.9Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    message: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.4Z" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
        <path d="M12 19v3M8 22h8" />
      </>
    ),
    stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 7h8M8 11h7" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
        <path d="m19 3 .8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.sparkle}</svg>;
};

export default function Chat() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState({});
  const [activeSession, setActiveSession] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeAgentRef = useRef(activeAgent.id);
  const historyRequestRef = useRef(0);
  const messageRequestRef = useRef(0);

  useEffect(() => {
    activeAgentRef.current = activeAgent.id;
  }, [activeAgent.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, loading]);

  useEffect(() => {
    let cancelled = false;
    const agentId = activeAgent.id;
    const requestId = ++historyRequestRef.current;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    const fetchHistory = async () => {
      setHistoryLoading(true);

      try {
        const response = await chatAPI.getHistory(agentId);
        if (cancelled || requestId !== historyRequestRef.current) return;

        const history = response.data.sessions || [];

        setSessions((previous) => ({
          ...previous,
          [agentId]: history,
        }));

        const currentSessionId = activeSession[agentId];

        const currentSession = currentSessionId
          ? history.find(
              (session) =>
                (session._id || session.id) === currentSessionId
            )
          : null;

        if (currentSession) {
          const sessionId = currentSession._id || currentSession.id;
          const sessionResponse = await chatAPI.getSession(sessionId);

          if (cancelled || requestId !== historyRequestRef.current) return;

          const loadedSession = sessionResponse.data.session;

          setMessages(loadedSession?.messages || []);
          setActiveSession((previous) => ({
            ...previous,
            [agentId]: sessionId,
          }));
        } else {
          setMessages([]);
        }
      } catch (error) {
        if (cancelled || requestId !== historyRequestRef.current) return;

        console.error('History error:', error);

        setSessions((previous) => ({
          ...previous,
          [agentId]: [],
        }));

        setMessages([]);
      } finally {
        if (!cancelled && requestId === historyRequestRef.current) {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
      window.clearTimeout(focusTimer);
    };
  }, [activeAgent.id]);

  useEffect(() => {
    return () => {
      window.clearTimeout(recordingTimerRef.current);

      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null;
        recorder.onstop = null;

        try {
          recorder.stop();
        } catch {
          // Recorder may already be stopping.
        }
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startNewChat = async () => {
    if (loading) {
      toast.error('Wait for the current response to finish first.');
      return;
    }

    try {
      const response = await chatAPI.createSession(activeAgent.id);
      const newSession = response.data.session;

      if (!newSession) {
        throw new Error('Session was not returned by server');
      }

      const sessionId = newSession._id || newSession.id;

      setSessions((previous) => ({
        ...previous,
        [activeAgent.id]: [
          newSession,
          ...(previous[activeAgent.id] || []).filter(
            (session) => (session._id || session.id) !== sessionId
          ),
        ],
      }));

      setActiveSession((previous) => ({
        ...previous,
        [activeAgent.id]: sessionId,
      }));

      setMessages([]);
      setInput('');
      setSidebarOpen(false);

      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }

      toast.success(`${activeAgent.name} chat started`);

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Create session error:', error);
      toast.error(
        error.response?.data?.message || 'Could not create a new chat'
      );
    }
  };

  const loadSession = async (session, closeSidebar = true) => {
    try {
      const sessionId = session._id || session.id;
      const agentId = activeAgent.id;
      const requestId = ++historyRequestRef.current;

      setHistoryLoading(true);

      const response = await chatAPI.getSession(sessionId);

      if (
        requestId !== historyRequestRef.current ||
        activeAgentRef.current !== agentId
      ) {
        return;
      }

      const loadedSession = response.data.session;

      setMessages(loadedSession?.messages || []);

      setActiveSession((previous) => ({
        ...previous,
        [agentId]: sessionId,
      }));

      if (closeSidebar) setSidebarOpen(false);

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Load session error:', error);
      toast.error(
        error.response?.data?.message || 'Could not load chat'
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const switchAgent = (agent) => {
    if (agent.id === activeAgent.id) {
      setSidebarOpen(false);
      return;
    }

    setActiveAgent(agent);
    setSidebarOpen(false);
    setInput('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();

    if (!text || loading) return;

    const agent = activeAgent;
    const agentId = agent.id;
    const requestId = ++messageRequestRef.current;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const optimisticUserMessage = {
      role: 'user',
      content: text,
      createdAt: new Date(),
      _optimisticId: `${Date.now()}-${Math.random()}`,
    };

    setMessages((previous) => [...previous, optimisticUserMessage]);
    setLoading(true);

    try {
      let sessionId = activeSession[agentId];

      if (!sessionId) {
        const sessionResponse = await chatAPI.createSession(agentId);
        const newSession = sessionResponse.data.session;

        if (!newSession) {
          throw new Error('Session was not returned by server');
        }

        sessionId = newSession._id || newSession.id;

        setActiveSession((previous) => ({
          ...previous,
          [agentId]: sessionId,
        }));

        setSessions((previous) => ({
          ...previous,
          [agentId]: [
            newSession,
            ...(previous[agentId] || []).filter(
              (session) => (session._id || session.id) !== sessionId
            ),
          ],
        }));
      }

      const response = await chatAPI.sendMessage(text, agentId, sessionId);

      if (activeAgentRef.current !== agentId) return;

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        createdAt: new Date(),
      };

      setMessages((previous) => [...previous, aiMessage]);

      try {
        const historyResponse = await chatAPI.getHistory(agentId);
        const updatedSessions = historyResponse.data.sessions || [];

        setSessions((previous) => ({
          ...previous,
          [agentId]: updatedSessions,
        }));
      } catch (historyError) {
        console.error('History refresh error:', historyError);
      }
    } catch (error) {
      console.error('Send message error:', error);

      if (activeAgentRef.current === agentId) {
        setMessages((previous) =>
          previous.filter(
            (message) => message._optimisticId !== optimisticUserMessage._optimisticId
          )
        );
      }

      toast.error(
        error.response?.data?.message || 'Failed to send message'
      );
    } finally {
      if (requestId === messageRequestRef.current) {
        setLoading(false);

        window.setTimeout(() => {
          if (activeAgentRef.current === agentId) {
            inputRef.current?.focus();
          }
        }, 100);
      }
    }
  };

  const clearChat = async () => {
    if (loading) {
      toast.error('Wait for the current response to finish first.');
      return;
    }

    const agentId = activeAgent.id;
    const sessionId = activeSession[agentId];

    if (!sessionId) {
      setMessages([]);
      toast.success('Chat cleared');
      return;
    }

    try {
      await chatAPI.deleteSession(sessionId);

      setMessages([]);

      setSessions((previous) => ({
        ...previous,
        [agentId]: (previous[agentId] || []).filter(
          (session) => (session._id || session.id) !== sessionId
        ),
      }));

      setActiveSession((previous) => ({
        ...previous,
        [agentId]: null,
      }));

      toast.success('Chat deleted');
    } catch (error) {
      console.error('Delete session error:', error);
      toast.error(
        error.response?.data?.message || 'Could not delete chat'
      );
    }
  };

  const stopRecording = () => {
    window.clearTimeout(recordingTimerRef.current);

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }

    setRecording(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      toast.error('Voice recording is not supported by this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaStreamRef.current = stream;

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : undefined;

      const recorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        toast.error('An error occurred during recording.');
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (mediaStreamRef.current === stream) {
          mediaStreamRef.current = null;
        }

        setRecording(false);

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });

        if (blob.size < 100) {
          toast.error('Recording too short');
          return;
        }

        const extension = mimeType.includes('ogg')
          ? 'ogg'
          : mimeType.includes('mp4')
          ? 'mp4'
          : 'webm';

        const formData = new FormData();
        formData.append('audio', blob, `recording.${extension}`);

        toast.loading('Converting speech to text…', { id: 'voice' });

        try {
          const response = await API.post('/voice/speech-to-text', formData);

          if (response.data.success && response.data.text) {
            setInput((previous) =>
              previous.trim()
                ? `${previous.trim()} ${response.data.text}`
                : response.data.text
            );

            toast.success('Voice captured', { id: 'voice' });

            window.setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          } else {
            toast.error('No speech was detected.', { id: 'voice' });
          }
        } catch (error) {
          console.error('Voice conversion error:', error);
          toast.error('Voice conversion failed', { id: 'voice' });
        }
      };

      recorder.start();
      setRecording(true);

      recordingTimerRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
          toast('Recording stopped after 15 seconds.', { icon: '🎙️' });
        }
      }, 15000);
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error(
        error.name === 'NotAllowedError'
          ? 'Allow microphone access to use voice input.'
          : 'Could not access your microphone.'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Could not sign out. Please try again.');
    }
  };

  const agentSessions = sessions[activeAgent.id] || [];
  const groupedSessions = groupByDate(agentSessions);
  const currentSessionId = activeSession[activeAgent.id];
  const starterPrompts = STARTER_PROMPTS[activeAgent.id] || [];

  return (
    <div className={`chat-app ${sidebarOpen ? 'sidebar-visible' : ''}`}>
      <style>{chatCSS}</style>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`chat-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <Link
              to="/dashboard"
              className="sidebar-brand"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="brand-symbol">
                <Icon name="book" size={19} />
              </span>
              <span className="brand-wordmark">
                Syllabus<span>AI</span>
              </span>
            </Link>

            <button
              type="button"
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <Icon name="close" size={19} />
            </button>
          </div>

          <div className="sidebar-primary">
            <button
              type="button"
              className="new-chat-button"
              onClick={startNewChat}
              disabled={loading}
            >
              <Icon name="plus" size={17} />
              <span>New conversation</span>
              <span className="new-chat-shortcut">NEW</span>
            </button>
          </div>

          <div className="sidebar-section agents-section">
            <div className="sidebar-section-heading">
              <span>YOUR AI TEAM</span>
              <span className="agent-count">06</span>
            </div>

            <div className="agent-list">
              {AGENTS.map((agent) => (
                <button
                  type="button"
                  key={agent.id}
                  className={`agent-button ${
                    activeAgent.id === agent.id ? 'agent-active' : ''
                  }`}
                  onClick={() => switchAgent(agent)}
                  aria-pressed={activeAgent.id === agent.id}
                  style={{ '--agent-color': agent.color }}
                >
                  <span className="agent-symbol">{agent.icon}</span>

                  <span className="agent-information">
                    <span className="agent-name">{agent.name}</span>
                    <span className="agent-description">{agent.desc}</span>
                  </span>

                  {activeAgent.id === agent.id && (
                    <span className="agent-active-indicator" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="history-section">
            <div className="sidebar-section-heading history-heading">
              <span>RECENT CONVERSATIONS</span>
              {historyLoading && <span className="mini-spinner" />}
            </div>

            <div className="history-list">
              {historyLoading && agentSessions.length === 0 ? (
                <div className="history-loading">
                  <span className="mini-spinner" />
                  Loading conversations…
                </div>
              ) : agentSessions.length === 0 ? (
                <div className="empty-history">
                  <span className="empty-history-icon">
                    <Icon name="message" size={19} />
                  </span>
                  <p>No conversations yet</p>
                  <span>Your chats will appear here.</span>
                </div>
              ) : (
                Object.entries(groupedSessions).map(([group, items]) => {
                  if (!items.length) return null;

                  return (
                    <div className="history-group" key={group}>
                      <div className="history-group-title">{group}</div>

                      {items.map((session) => {
                        const sessionId = session._id || session.id;

                        return (
                          <button
                            type="button"
                            key={sessionId}
                            className={`history-item ${
                              currentSessionId === sessionId
                                ? 'history-active'
                                : ''
                            }`}
                            onClick={() => loadSession(session)}
                            title={session.title || 'New conversation'}
                          >
                            <Icon name="message" size={15} />
                            <span>{session.title || 'New conversation'}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>

              <div className="user-details">
                <span className="user-name">{user?.name || 'Student'}</span>
                <span className="user-plan">{user?.plan || 'Free Plan'}</span>
              </div>

              <button
                type="button"
                className="user-settings-button"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/settings');
                }}
                aria-label="Settings"
                title="Settings"
              >
                <Icon name="settings" size={17} />
              </button>
            </div>

            <button
              type="button"
              className="sidebar-logout"
              onClick={handleLogout}
            >
              <Icon name="logout" size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Icon name="menu" size={20} />
            </button>

            <nav className="desktop-navigation" aria-label="Main navigation">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/learn">Learn</Link>
              <Link to="/exam">Exam</Link>
              <Link to="/career">Career</Link>
            </nav>
          </div>

          <div className="active-agent-header">
            <span
              className="active-agent-indicator"
              style={{ '--agent-color': activeAgent.color }}
            />
            <div className="active-agent-text">
              <span className="active-agent-name">
                {activeAgent.name}
                <span className="agent-title-suffix"> Agent</span>
              </span>
              <span className="active-agent-desc">{activeAgent.desc}</span>
            </div>
            <span className="online-status" title="Ready">
              <span />
            </span>
          </div>

          <div className="topbar-actions">
            <div className="desktop-agent-switcher" aria-label="Switch AI agent">
              {AGENTS.map((agent) => (
                <button
                  type="button"
                  key={agent.id}
                  className={`desktop-agent-button ${
                    activeAgent.id === agent.id ? 'selected' : ''
                  }`}
                  onClick={() => switchAgent(agent)}
                  title={`Switch to ${agent.name}`}
                  aria-label={`Switch to ${agent.name}`}
                  aria-pressed={activeAgent.id === agent.id}
                  style={{ '--agent-color': agent.color }}
                >
                  {agent.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearChat}
              className="clear-button"
              title="Delete current conversation"
              disabled={loading}
            >
              <Icon name="trash" size={15} />
              <span>Clear chat</span>
            </button>
          </div>
        </header>

        <section className="messages-area" aria-label="Conversation">
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="empty-chat">
                <div
                  className="empty-chat-symbol"
                  style={{
                    '--agent-color': activeAgent.color,
                  }}
                >
                  <span>{activeAgent.icon}</span>
                  <i />
                </div>

                <div className="empty-chat-eyebrow">
                  YOUR AI STUDY PARTNER
                </div>

                <h1>
                  Let’s work on <span>{activeAgent.name.toLowerCase()}.</span>
                </h1>

                <p className="empty-chat-description">
                  {AGENT_INTRODUCTIONS[activeAgent.id]}
                </p>

                <div className="starter-heading">
                  <span>TRY ASKING</span>
                  <span className="starter-heading-line" />
                </div>

                <div className="starter-prompts">
                  {starterPrompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                        inputRef.current?.focus();
                      }}
                      className="starter-prompt"
                      disabled={loading}
                    >
                      <span>{prompt}</span>
                      <Icon name="arrow" size={15} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const isUser = message.role === 'user';

              return (
                <article
                  key={
                    message._id ||
                    message._optimisticId ||
                    `${message.role}-${index}`
                  }
                  className={`message-row ${
                    isUser ? 'user-message' : 'assistant-message'
                  }`}
                >
                  <div className="message-identity">
                    {isUser ? (
                      <span className="message-avatar user-message-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'Y'}
                      </span>
                    ) : (
                      <span
                        className="message-avatar assistant-message-avatar"
                        style={{
                          '--agent-color': activeAgent.color,
                        }}
                      >
                        {activeAgent.icon}
                      </span>
                    )}

                    <span className="message-author">
                      {isUser ? 'You' : activeAgent.name}
                    </span>
                    <span className="message-role">
                      {isUser ? 'YOU' : 'AI ASSISTANT'}
                    </span>
                  </div>

                  <div
                    className={`message-bubble ${
                      isUser ? 'user-bubble' : 'assistant-bubble'
                    }`}
                  >
                    {isUser ? (
                      <p>{message.content}</p>
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown
                          components={{
                            code({ className, children, ...props }) {
                              const isBlock = Boolean(className);

                              return isBlock ? (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="inline-code" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            pre({ children }) {
                              return <pre className="code-block">{children}</pre>;
                            },
                            blockquote({ children }) {
                              return (
                                <blockquote
                                  style={{
                                    '--agent-color': activeAgent.color,
                                  }}
                                >
                                  {children}
                                </blockquote>
                              );
                            },
                            a({ children, href, ...props }) {
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {message.content || ''}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {loading && (
              <div className="message-row assistant-message">
                <div className="message-identity">
                  <span
                    className="message-avatar assistant-message-avatar"
                    style={{ '--agent-color': activeAgent.color }}
                  >
                    {activeAgent.icon}
                  </span>
                  <span className="message-author">{activeAgent.name}</span>
                  <span className="message-role">THINKING</span>
                </div>

                <div className="typing-bubble">
                  <span style={{ '--dot-index': 0 }} />
                  <span style={{ '--dot-index': 1 }} />
                  <span style={{ '--dot-index': 2 }} />
                  <span className="typing-label">Working on your answer</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <footer className="input-area">
          <div className="input-container">
            {recording && (
              <div className="recording-indicator">
                <span className="recording-dot" />
                <span>Listening… speak clearly</span>
                <span className="recording-timer">15s max</span>
              </div>
            )}

            <div className={`input-box ${recording ? 'input-recording' : ''}`}>
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`voice-button ${recording ? 'recording' : ''}`}
                title={recording ? 'Stop recording' : 'Voice input'}
                aria-label={recording ? 'Stop recording' : 'Start voice input'}
                disabled={loading}
              >
                {recording ? <Icon name="stop" size={18} /> : <Icon name="mic" size={19} />}
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  recording
                    ? 'Recording your voice…'
                    : `Message ${activeAgent.name}…`
                }
                rows={1}
                disabled={loading || recording}
                className="chat-input"
                aria-label={`Message ${activeAgent.name}`}
                onInput={(event) => {
                  event.currentTarget.style.height = 'auto';
                  event.currentTarget.style.height =
                    `${Math.min(event.currentTarget.scrollHeight, 160)}px`;
                }}
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim() || recording}
                className="send-button"
                aria-label="Send message"
                title="Send message"
              >
                {loading ? (
                  <span className="send-spinner" />
                ) : (
                  <Icon name="send" size={18} />
                )}
              </button>
            </div>

            <div className="input-footer">
              <span>
                <kbd>Enter</kbd> to send
                <span className="hint-divider">·</span>
                <kbd>Shift + Enter</kbd> for a new line
              </span>
              <span className="privacy-note">
                <Icon name="sparkle" size={12} />
                AI-powered learning
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

const chatCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    min-width: 320px;
    min-height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background: #090B12;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  button,
  textarea,
  input {
    font: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  .chat-app {
    position: relative;
    display: flex;
    width: 100%;
    height: 100dvh;
    min-height: 420px;
    overflow: hidden;
    background: #090B12;
    color: #F1F3FA;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    isolation: isolate;
  }

  .chat-app button:focus-visible,
  .chat-app a:focus-visible,
  .chat-app textarea:focus-visible {
    outline: 2px solid #91A9FF;
    outline-offset: 3px;
  }

  /* Sidebar */

  .chat-sidebar {
    position: fixed;
    z-index: 1001;
    inset: 0 auto 0 0;
    display: flex;
    width: 280px;
    height: 100dvh;
    transform: translateX(-101%);
    border-right: 1px solid rgba(255,255,255,.075);
    background: #0D101A;
    box-shadow: 18px 0 60px rgba(0,0,0,.22);
    transition: transform .25s cubic-bezier(.2,.75,.25,1);
    overflow: hidden;
  }

  .chat-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 70px;
    padding: 0 19px;
    border-bottom: 1px solid rgba(255,255,255,.065);
    flex-shrink: 0;
  }

  .sidebar-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #F3F5FC;
  }

  .brand-symbol {
    display: grid;
    width: 35px;
    height: 35px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(145,169,255,.23);
    border-radius: 10px;
    background: rgba(145,169,255,.09);
    color: #A8BAFF;
  }

  .brand-wordmark {
    font-family: Inter, sans-serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -.7px;
  }

  .brand-wordmark span {
    color: #91A9FF;
  }

  .sidebar-close,
  .user-settings-button {
    display: grid;
    width: 33px;
    height: 33px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid transparent;
    border-radius: 9px;
    background: transparent;
    color: #7D859B;
    cursor: pointer;
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }

  .sidebar-close:hover,
  .user-settings-button:hover {
    border-color: rgba(255,255,255,.08);
    background: rgba(255,255,255,.055);
    color: #F2F4FC;
  }

  .sidebar-primary {
    padding: 15px 13px 17px;
    flex-shrink: 0;
  }

  .new-chat-button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    width: 100%;
    min-height: 43px;
    padding: 0 12px;
    border: 1px solid rgba(145,169,255,.23);
    border-radius: 11px;
    background: linear-gradient(135deg, rgba(145,169,255,.14), rgba(145,169,255,.055));
    color: #D4DEFF;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color .2s ease, background .2s ease, transform .2s ease;
  }

  .new-chat-button:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(145,169,255,.4);
    background: rgba(145,169,255,.16);
  }

  .new-chat-button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .new-chat-shortcut {
    margin-left: auto;
    padding: 3px 5px;
    border: 1px solid rgba(145,169,255,.17);
    border-radius: 5px;
    color: #8C9BC8;
    font-size: 8px;
    letter-spacing: .7px;
  }

  .sidebar-section {
    padding: 0 12px;
    flex-shrink: 0;
  }

  .sidebar-section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 28px;
    padding: 0 5px 8px;
    color: #666F87;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.25px;
  }

  .agent-count {
    padding: 3px 6px;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: 5px;
    color: #727C95;
    font-size: 9px;
    letter-spacing: .3px;
  }

  .agent-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .agent-button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-width: 0;
    min-height: 54px;
    padding: 7px 10px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: #A0A7BA;
    text-align: left;
    cursor: pointer;
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }

  .agent-button:hover {
    background: rgba(255,255,255,.035);
    color: #F1F3FA;
  }

  .agent-button.agent-active {
    border-color: color-mix(in srgb, var(--agent-color) 18%, transparent);
    background: color-mix(in srgb, var(--agent-color) 8%, transparent);
    color: #F3F5FC;
  }

  .agent-symbol {
    display: grid;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: 10px;
    background: rgba(255,255,255,.04);
    font-size: 15px;
    line-height: 1;
  }

  .agent-active .agent-symbol {
    border-color: color-mix(in srgb, var(--agent-color) 25%, transparent);
    background: color-mix(in srgb, var(--agent-color) 12%, transparent);
  }

  .agent-information {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .agent-name {
    font-size: 12px;
    font-weight: 600;
  }

  .agent-description {
    overflow: hidden;
    color: #737B90;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .agent-active .agent-description {
    color: #A0A9C2;
  }

  .agent-active-indicator {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--agent-color);
    box-shadow: 0 0 12px color-mix(in srgb, var(--agent-color) 65%, transparent);
  }

  /* Chat history */

  .history-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    margin-top: 16px;
    padding: 13px 12px 5px;
    border-top: 1px solid rgba(255,255,255,.065);
    overflow: hidden;
  }

  .history-heading {
    flex-shrink: 0;
    padding-bottom: 8px;
  }

  .history-list {
    flex: 1;
    min-height: 0;
    padding-bottom: 8px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.1) transparent;
  }

  .history-list::-webkit-scrollbar {
    width: 4px;
  }

  .history-list::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: rgba(255,255,255,.1);
  }

  .history-group + .history-group {
    margin-top: 11px;
  }

  .history-group-title {
    padding: 8px 7px 5px;
    color: #69728A;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .3px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    min-width: 0;
    min-height: 36px;
    padding: 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: #9299AD;
    text-align: left;
    cursor: pointer;
    transition: color .18s ease, background .18s ease, border-color .18s ease;
  }

  .history-item > svg {
    flex-shrink: 0;
    color: #69738C;
  }

  .history-item > span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 11px;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-item:hover {
    background: rgba(255,255,255,.04);
    color: #E6E9F4;
  }

  .history-item.history-active {
    border-color: rgba(145,169,255,.12);
    background: rgba(145,169,255,.075);
    color: #DDE4FF;
  }

  .history-item.history-active > svg {
    color: #91A9FF;
  }

  .empty-history {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 25px 12px;
    text-align: center;
  }

  .empty-history-icon {
    display: grid;
    width: 39px;
    height: 39px;
    margin-bottom: 3px;
    place-items: center;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 12px;
    background: rgba(255,255,255,.03);
    color: #818BA4;
  }

  .empty-history p {
    margin: 0;
    color: #C1C7D8;
    font-size: 11px;
    font-weight: 600;
  }

  .empty-history > span:last-child {
    color: #6E778E;
    font-size: 10px;
    line-height: 1.6;
  }

  .history-loading {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 17px 7px;
    color: #858DA3;
    font-size: 10px;
  }

  .mini-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    border: 1.5px solid rgba(145,169,255,.2);
    border-top-color: #91A9FF;
    border-radius: 50%;
    animation: chatSpin .8s linear infinite;
  }

  /* User footer */

  .sidebar-footer {
    flex-shrink: 0;
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,.065);
    background: rgba(7,9,15,.5);
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 4px 2px 12px;
  }

  .user-avatar {
    display: grid;
    width: 35px;
    height: 35px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 11px;
    background: linear-gradient(145deg, #8CA5FF, #7359C9);
    color: white;
    font-size: 13px;
    font-weight: 700;
  }

  .user-details {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .user-name {
    overflow: hidden;
    color: #E2E5F0;
    font-size: 11px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-plan {
    color: #7C849A;
    font-size: 10px;
  }

  .sidebar-logout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 35px;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 9px;
    background: rgba(255,255,255,.025);
    color: #A5ACC0;
    font-size: 11px;
    cursor: pointer;
    transition: background .2s ease, color .2s ease;
  }

  .sidebar-logout:hover {
    background: rgba(255,255,255,.06);
    color: #F2F4FC;
  }

  /* Main layout */

  .chat-main {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse at 50% -28%, rgba(87,110,190,.09), transparent 53%),
      #090B12;
  }

  .sidebar-backdrop {
    position: fixed;
    z-index: 1000;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    background: rgba(1,3,9,.7);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    cursor: pointer;
    animation: backdropIn .2s ease both;
  }

  /* Top navigation */

  .chat-topbar {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 15px;
    min-height: 68px;
    padding: 0 25px;
    border-bottom: 1px solid rgba(255,255,255,.065);
    background: rgba(10,12,20,.86);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    flex-shrink: 0;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 21px;
    min-width: 0;
  }

  .menu-button {
    display: grid;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 10px;
    background: rgba(255,255,255,.035);
    color: #B0B7CB;
    cursor: pointer;
    transition: color .2s ease, background .2s ease, border-color .2s ease;
  }

  .menu-button:hover {
    border-color: rgba(145,169,255,.22);
    background: rgba(145,169,255,.08);
    color: #E5E9F8;
  }

  .desktop-navigation {
    display: flex;
    align-items: center;
    gap: clamp(11px, 1.7vw, 22px);
    min-width: 0;
  }

  .desktop-navigation a {
    color: #8D95AA;
    font-size: 11px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    transition: color .2s ease;
  }

  .desktop-navigation a:hover {
    color: #F1F3FA;
  }

  .active-agent-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 0;
  }

  .active-agent-indicator {
    position: relative;
    width: 9px;
    height: 9px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--agent-color);
    box-shadow: 0 0 12px color-mix(in srgb, var(--agent-color) 45%, transparent);
  }

  .active-agent-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .active-agent-name {
    overflow: hidden;
    color: #E9ECF6;
    font-size: 12px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .agent-title-suffix {
    color: #AAB1C3;
    font-weight: 500;
  }

  .active-agent-desc {
    overflow: hidden;
    color: #80899F;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .online-status {
    display: grid;
    width: 19px;
    height: 19px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(87,214,181,.13);
    border-radius: 50%;
    background: rgba(87,214,181,.055);
  }

  .online-status span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #57D6B5;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    min-width: 0;
  }

  .desktop-agent-switcher {
    display: flex;
    align-items: center;
    gap: 3px;
    min-width: 0;
    padding: 3px;
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    background: rgba(255,255,255,.025);
  }

  .desktop-agent-button {
    min-width: 0;
    padding: 7px 9px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: #8E96AA;
    font-size: 10px;
    cursor: pointer;
    white-space: nowrap;
    transition: color .2s ease, background .2s ease, border-color .2s ease;
  }

  .desktop-agent-button:hover {
    color: #E9ECF7;
    background: rgba(255,255,255,.045);
  }

  .desktop-agent-button.selected {
    border-color: color-mix(in srgb, var(--agent-color) 22%, transparent);
    background: color-mix(in srgb, var(--agent-color) 11%, transparent);
    color: #F0F2FA;
  }

  .clear-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 35px;
    padding: 0 10px;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 9px;
    background: rgba(255,255,255,.025);
    color: #969EB2;
    font-size: 10px;
    cursor: pointer;
    white-space: nowrap;
    transition: color .2s ease, background .2s ease, border-color .2s ease;
  }

  .clear-button:hover:not(:disabled) {
    border-color: rgba(255,255,255,.17);
    background: rgba(255,255,255,.06);
    color: #E1E5F1;
  }

  .clear-button:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  /* Message region */

  .messages-area {
    flex: 1;
    min-height: 0;
    padding: 28px 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.1) transparent;
  }

  .messages-area::-webkit-scrollbar {
    width: 5px;
  }

  .messages-area::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(255,255,255,.1);
  }

  .messages-container {
    width: 100%;
    max-width: 830px;
    min-width: 0;
    margin: 0 auto;
    padding: 0 29px;
  }

  /* Empty conversation */

  .empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: clamp(30px, 7vh, 65px) 0 35px;
    text-align: center;
    animation: contentIn .45s ease both;
  }

  .empty-chat-symbol {
    position: relative;
    display: grid;
    width: 74px;
    height: 74px;
    margin-bottom: 23px;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--agent-color) 24%, transparent);
    border-radius: 22px;
    background: color-mix(in srgb, var(--agent-color) 9%, transparent);
    box-shadow: 0 12px 42px color-mix(in srgb, var(--agent-color) 7%, transparent);
  }

  .empty-chat-symbol > span {
    font-size: 34px;
    line-height: 1;
  }

  .empty-chat-symbol > i {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 15px;
    height: 15px;
    border: 3px solid #090B12;
    border-radius: 50%;
    background: var(--agent-color);
  }

  .empty-chat-eyebrow {
    margin-bottom: 13px;
    color: #8792B0;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.65px;
  }

  .empty-chat h1 {
    margin: 0;
    color: #F2F4FC;
    font-family: Inter, sans-serif;
    font-size: clamp(26px, 3.5vw, 35px);
    font-weight: 700;
    letter-spacing: -1.3px;
    line-height: 1.3;
  }

  .empty-chat h1 span {
    color: var(--agent-color, #91A9FF);
  }

  .empty-chat-description {
    max-width: 450px;
    margin: 13px 0 29px;
    color: #939BAF;
    font-size: 13px;
    line-height: 1.85;
  }

  .starter-heading {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    max-width: 575px;
    margin-bottom: 12px;
    color: #717A91;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-align: left;
  }

  .starter-heading-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,.07);
  }

  .starter-prompts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: 100%;
    max-width: 575px;
  }

  .starter-prompt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
    min-height: 61px;
    padding: 13px 14px;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.012));
    color: #B1B8CA;
    font-size: 11px;
    line-height: 1.55;
    text-align: left;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease;
  }

  .starter-prompt > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .starter-prompt > svg {
    flex-shrink: 0;
    color: #69738C;
    transition: color .2s ease, transform .2s ease;
  }

  .starter-prompt:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(145,169,255,.22);
    background: rgba(145,169,255,.055);
    color: #EDF0FB;
  }

  .starter-prompt:hover > svg {
    transform: translateX(3px);
    color: #91A9FF;
  }

  .starter-prompt:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  /* Message bubbles */

  .message-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    margin-bottom: 29px;
    animation: contentIn .25s ease both;
  }

  .message-row.user-message {
    align-items: flex-end;
  }

  .message-identity {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin-bottom: 9px;
    padding: 0 2px;
  }

  .message-avatar {
    display: grid;
    width: 27px;
    height: 27px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 700;
  }

  .user-message-avatar {
    border: 1px solid rgba(255,255,255,.13);
    background: linear-gradient(140deg, #68789F, #434F70);
    color: #F4F6FC;
  }

  .assistant-message-avatar {
    border: 1px solid color-mix(in srgb, var(--agent-color) 22%, transparent);
    background: color-mix(in srgb, var(--agent-color) 10%, transparent);
    color: #F1F3FA;
  }

  .message-author {
    color: #D5D9E8;
    font-size: 11px;
    font-weight: 600;
  }

  .message-role {
    color: #636D85;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .85px;
  }

  .message-bubble {
    min-width: 0;
    max-width: min(92%, 690px);
    padding: 14px 17px;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .user-bubble {
    max-width: min(80%, 610px);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 17px 17px 5px 17px;
    background: linear-gradient(145deg, #252D45, #1C2235);
    color: #F1F3FB;
  }

  .assistant-bubble {
    width: fit-content;
    max-width: min(100%, 700px);
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 5px 17px 17px 17px;
    background: linear-gradient(145deg, rgba(23,27,40,.91), rgba(17,20,31,.86));
    color: #DDE1ED;
  }

  .message-bubble > p {
    margin: 0;
    font-size: 13px;
    line-height: 1.8;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .markdown-content {
    min-width: 0;
    max-width: 100%;
    color: #D2D7E6;
    font-size: 13px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .markdown-content > :first-child {
    margin-top: 0;
  }

  .markdown-content > :last-child {
    margin-bottom: 0;
  }

  .markdown-content p {
    margin: 0 0 12px;
    line-height: 1.8;
  }

  .markdown-content p:last-child {
    margin-bottom: 0;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4 {
    margin: 21px 0 9px;
    color: #F0F2FA;
    font-family: Inter, sans-serif;
    font-weight: 700;
    letter-spacing: -.35px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .markdown-content h1 { font-size: 20px; }
  .markdown-content h2 { font-size: 17px; }
  .markdown-content h3 { font-size: 15px; }
  .markdown-content h4 { font-size: 13px; }

  .markdown-content ul,
  .markdown-content ol {
    margin: 8px 0 13px;
    padding-left: 23px;
  }

  .markdown-content li {
    margin: 5px 0;
    padding-left: 3px;
  }

  .markdown-content li::marker {
    color: #8FA7FF;
  }

  .markdown-content strong {
    color: #F0F2FC;
    font-weight: 700;
  }

  .markdown-content em {
    color: #DDE2F0;
  }

  .markdown-content hr {
    height: 1px;
    margin: 19px 0;
    border: 0;
    background: rgba(255,255,255,.09);
  }

  .markdown-content a {
    color: #A8BDFF;
    text-decoration: underline;
    text-decoration-color: rgba(168,189,255,.35);
    text-underline-offset: 3px;
  }

  .markdown-content a:hover {
    color: #D7E1FF;
  }

  .markdown-content blockquote {
    margin: 14px 0;
    padding: 4px 0 4px 14px;
    border-left: 3px solid var(--agent-color, #91A9FF);
    color: #ADB5CA;
  }

  .markdown-content blockquote p {
    margin: 0;
  }

  .inline-code {
    padding: 2px 5px;
    border: 1px solid rgba(145,169,255,.12);
    border-radius: 5px;
    background: rgba(145,169,255,.075);
    color: #BDD0FF;
    font-family: 'Consolas', 'SFMono-Regular', monospace;
    font-size: .91em;
    overflow-wrap: anywhere;
  }

  .code-block {
    max-width: 100%;
    margin: 13px 0;
    padding: 14px;
    overflow-x: auto;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 11px;
    background: #080B12;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.12) transparent;
  }

  .code-block code {
    color: #B9E9D4;
    font-family: 'Consolas', 'SFMono-Regular', monospace;
    font-size: 12px;
    line-height: 1.7;
    white-space: pre;
    overflow-wrap: normal;
  }

  .markdown-content table {
    display: block;
    width: 100%;
    max-width: 100%;
    margin: 14px 0;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: 12px;
  }

  .markdown-content th,
  .markdown-content td {
    padding: 9px 11px;
    border: 1px solid rgba(255,255,255,.1);
    text-align: left;
    vertical-align: top;
  }

  .markdown-content th {
    background: rgba(255,255,255,.045);
    color: #F0F2FA;
  }

  .markdown-content td {
    color: #C6CCDD;
  }

  /* Typing indicator */

  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 12px 15px;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 5px 14px 14px 14px;
    background: rgba(255,255,255,.035);
  }

  .typing-bubble > span:not(.typing-label) {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--agent-color, #91A9FF);
    animation: typingBounce 1s ease-in-out infinite;
    animation-delay: calc(var(--dot-index, 0) * 150ms);
  }

  .typing-label {
    margin-left: 6px;
    color: #8E97AD;
    font-size: 10px;
  }

  /* Input area */

  .input-area {
    position: relative;
    z-index: 5;
    flex-shrink: 0;
    padding: 13px 23px 15px;
    border-top: 1px solid rgba(255,255,255,.065);
    background: rgba(9,11,18,.96);
  }

  .input-container {
    width: 100%;
    max-width: 830px;
    margin: 0 auto;
  }

  .recording-indicator {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0 0 10px 2px;
    color: #B8C0D4;
    font-size: 10px;
  }

  .recording-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #77D7BE;
    box-shadow: 0 0 11px rgba(119,215,190,.3);
    animation: recordPulse 1s ease-in-out infinite;
  }

  .recording-timer {
    margin-left: auto;
    color: #858EA4;
  }

  .input-box {
    display: flex;
    align-items: flex-end;
    gap: 9px;
    width: 100%;
    min-width: 0;
    padding: 9px;
    border: 1px solid rgba(255,255,255,.105);
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(24,28,42,.98), rgba(17,20,31,.98));
    box-shadow: 0 8px 35px rgba(0,0,0,.13);
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  .input-box:focus-within {
    border-color: rgba(145,169,255,.35);
    box-shadow: 0 0 0 3px rgba(145,169,255,.045), 0 8px 35px rgba(0,0,0,.13);
  }

  .input-box.input-recording {
    border-color: rgba(119,215,190,.3);
  }

  .voice-button,
  .send-button {
    display: grid;
    width: 37px;
    height: 37px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid transparent;
    border-radius: 11px;
    cursor: pointer;
    transition: background .2s ease, color .2s ease, transform .2s ease;
  }

  .voice-button {
    background: rgba(255,255,255,.045);
    color: #A2AABE;
  }

  .voice-button:hover:not(:disabled) {
    background: rgba(255,255,255,.085);
    color: #F1F3FB;
  }

  .voice-button:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  .voice-button.recording {
    background: rgba(119,215,190,.14);
    color: #77D7BE;
    animation: recordPulse 1s ease-in-out infinite;
  }

  .chat-input {
    display: block;
    flex: 1;
    width: 0;
    min-width: 0;
    max-height: 160px;
    min-height: 37px;
    padding: 8px 1px 7px;
    border: none;
    outline: none;
    resize: none;
    overflow-y: auto;
    background: transparent;
    color: #F0F2FA;
    font-size: 13px;
    line-height: 1.6;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.14) transparent;
  }

  .chat-input::placeholder {
    color: #777F95;
  }

  .chat-input:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .send-button {
    background: #91A9FF;
    color: #10162A;
  }

  .send-button:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #A9BBFF;
  }

  .send-button:disabled {
    background: rgba(255,255,255,.055);
    color: #737D94;
    cursor: not-allowed;
  }

  .send-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,.2);
    border-top-color: #B5C5FF;
    border-radius: 50%;
    animation: chatSpin .75s linear infinite;
  }

  .input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 2px 0;
    color: #727B91;
    font-size: 9px;
    line-height: 1.5;
  }

  .input-footer kbd {
    padding: 2px 4px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 4px;
    background: rgba(255,255,255,.025);
    color: #9199AE;
    font-family: inherit;
    font-size: 9px;
  }

  .hint-divider {
    margin: 0 7px;
    color: #515A70;
  }

  .privacy-note {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
    color: #747E95;
  }

  .privacy-note svg {
    color: #9DACDE;
  }

  /* Animations */

  @keyframes chatSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: .45; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  @keyframes recordPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .55; }
  }

  @keyframes contentIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes backdropIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }

  /* Laptop */

  @media (max-width: 1250px) {
    .chat-topbar {
      gap: 12px;
      padding: 0 17px;
    }

    .topbar-left {
      gap: 13px;
    }

    .desktop-navigation {
      gap: 13px;
    }

    .desktop-agent-button {
      padding-right: 7px;
      padding-left: 7px;
    }

    .topbar-actions {
      gap: 7px;
    }
  }

  @media (max-width: 1080px) {
    .desktop-navigation {
      display: none;
    }

    .chat-topbar {
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    }

    .topbar-left {
      gap: 8px;
    }

    .desktop-agent-switcher {
      display: none;
    }

    .active-agent-header {
      justify-self: center;
    }

    .topbar-actions {
      justify-self: end;
    }

    .clear-button {
      padding-right: 10px;
      padding-left: 10px;
    }
  }

  /* Tablet and mobile */

  @media (max-width: 700px) {
    .chat-sidebar {
      width: min(300px, 88vw);
      box-shadow: 18px 0 55px rgba(0,0,0,.38);
    }

    .chat-topbar {
      grid-template-columns: 38px minmax(0, 1fr) auto;
      gap: 8px;
      min-height: 61px;
      padding: 0 12px;
    }

    .topbar-left {
      gap: 0;
    }

    .menu-button {
      width: 35px;
      height: 35px;
    }

    .active-agent-header {
      justify-self: start;
      gap: 8px;
    }

    .active-agent-name {
      font-size: 11px;
    }

    .active-agent-desc {
      font-size: 9px;
    }

    .agent-title-suffix {
      display: none;
    }

    .online-status {
      width: 16px;
      height: 16px;
    }

    .topbar-actions {
      gap: 5px;
    }

    .clear-button {
      width: 35px;
      height: 35px;
      min-height: 35px;
      padding: 0;
    }

    .clear-button span {
      display: none;
    }

    .messages-area {
      padding: 16px 0 21px;
    }

    .messages-container {
      padding: 0 15px;
    }

    .empty-chat {
      padding-top: clamp(28px, 6vh, 48px);
    }

    .empty-chat-symbol {
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      border-radius: 19px;
    }

    .empty-chat-symbol > span {
      font-size: 29px;
    }

    .empty-chat h1 {
      font-size: clamp(24px, 6.5vw, 31px);
      letter-spacing: -.9px;
    }

    .empty-chat-description {
      max-width: 410px;
      margin: 11px 0 25px;
      font-size: 12px;
    }

    .starter-prompts {
      gap: 8px;
    }

    .starter-prompt {
      min-height: 57px;
      padding: 11px;
      font-size: 10px;
    }

    .message-row {
      margin-bottom: 22px;
    }

    .message-bubble {
      max-width: 96%;
      padding: 12px 14px;
    }

    .user-bubble {
      max-width: 91%;
    }

    .message-bubble > p,
    .markdown-content {
      font-size: 12.5px;
    }

    .input-area {
      padding: 9px 12px max(10px, env(safe-area-inset-bottom));
    }

    .input-box {
      gap: 6px;
      padding: 6px;
      border-radius: 14px;
    }

    .voice-button,
    .send-button {
      width: 35px;
      height: 35px;
    }

    .chat-input {
      font-size: 13px;
    }

    .input-footer {
      padding-top: 7px;
      font-size: 8px;
    }

    .input-footer kbd {
      font-size: 8px;
    }
  }

  /* Small mobile */

  @media (max-width: 430px) {
    .chat-topbar {
      grid-template-columns: 35px minmax(0, 1fr) 35px;
      gap: 6px;
      padding: 0 9px;
    }

    .topbar-actions {
      justify-self: end;
    }

    .active-agent-indicator {
      width: 7px;
      height: 7px;
    }

    .active-agent-desc {
      max-width: 145px;
    }

    .active-agent-name {
      font-size: 11px;
    }

    .empty-chat {
      padding-top: 28px;
    }

    .empty-chat-eyebrow {
      font-size: 8px;
      letter-spacing: 1.2px;
    }

    .empty-chat-description {
      margin-bottom: 23px;
      padding: 0 3px;
      font-size: 11.5px;
    }

    .starter-prompts {
      grid-template-columns: minmax(0, 1fr);
    }

    .starter-prompt {
      min-height: 46px;
      padding: 10px 12px;
      font-size: 11px;
    }

    .starter-heading {
      margin-bottom: 10px;
    }

    .messages-container {
      padding-right: 11px;
      padding-left: 11px;
    }

    .message-identity {
      gap: 7px;
    }

    .message-role {
      font-size: 7px;
    }

    .message-bubble {
      max-width: 98%;
      padding: 11px 12px;
    }

    .user-bubble {
      max-width: 93%;
    }

    .code-block {
      max-width: calc(100vw - 62px);
      padding: 10px;
    }

    .code-block code {
      font-size: 11px;
    }

    .input-area {
      padding-right: 8px;
      padding-left: 8px;
    }

    .privacy-note {
      display: none;
    }

    .input-footer {
      justify-content: center;
    }

    .recording-indicator {
      font-size: 9px;
    }
  }

  @media (max-width: 350px) {
    .sidebar-close {
      width: 29px;
      height: 29px;
    }

    .active-agent-header {
      gap: 6px;
    }

    .active-agent-desc,
    .online-status {
      display: none;
    }

    .message-role {
      display: none;
    }

    .message-bubble > p,
    .markdown-content {
      font-size: 12px;
    }

    .input-footer {
      font-size: 8px;
    }

    .hint-divider {
      margin: 0 4px;
    }
  }
`;