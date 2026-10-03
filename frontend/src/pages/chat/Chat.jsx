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
    color: '#3B82F6',
    desc: 'Explains topics',
  },
  {
    id: 'examiner',
    name: 'Examiner',
    icon: '❓',
    color: '#8B5CF6',
    desc: 'Quiz & exams',
  },
  {
    id: 'debugger',
    name: 'Debugger',
    icon: '🐛',
    color: '#10B981',
    desc: 'Fix code',
  },
  {
    id: 'coach',
    name: 'Coach',
    icon: '📈',
    color: '#F59E0B',
    desc: 'Motivate you',
  },
  {
    id: 'research',
    name: 'Research',
    icon: '🔍',
    color: '#06B6D4',
    desc: 'Deep answers',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: '🎯',
    color: '#F97316',
    desc: 'Career guide',
  },
];

/* -------------------------------------------------------
   GROUP SESSIONS BY DATE
------------------------------------------------------- */

function groupByDate(sessions) {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

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

    if (date >= today) {
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

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */

export default function Chat() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);

  const [recording, setRecording] = useState(false);

  /* Sidebar */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Sessions for every agent */
  const [sessions, setSessions] = useState({});

  /* Current session for every agent */
  const [activeSession, setActiveSession] = useState({});

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* -------------------------------------------------------
     AUTO SCROLL
  ------------------------------------------------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, loading]);

  /* -------------------------------------------------------
     LOAD HISTORY WHEN AGENT CHANGES
  ------------------------------------------------------- */

  useEffect(() => {
    loadHistory();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [activeAgent.id]);

  /* -------------------------------------------------------
     LOAD CHAT HISTORY
  ------------------------------------------------------- */

  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory(activeAgent.id);

      const history = res.data.sessions || [];

      setSessions((prev) => ({
        ...prev,
        [activeAgent.id]: history,
      }));

      const currentSessionId = activeSession[activeAgent.id];

      if (currentSessionId) {
        const currentSession = history.find(
          (session) =>
            session._id === currentSessionId ||
            session.id === currentSessionId
        );

        if (currentSession) {
          await loadSession(currentSession, false);
          return;
        }
      }

      /* If no active session, show empty chat */
      setMessages([]);
    } catch (error) {
      console.error('History error:', error);

      setSessions((prev) => ({
        ...prev,
        [activeAgent.id]: [],
      }));

      setMessages([]);
    }
  };

  /* -------------------------------------------------------
     CREATE NEW CHAT
  ------------------------------------------------------- */

  const startNewChat = async () => {
    try {
      const res = await chatAPI.createSession(activeAgent.id);

      const newSession = res.data.session;

      if (!newSession) {
        throw new Error('Session was not returned by server');
      }

      setSessions((prev) => ({
        ...prev,
        [activeAgent.id]: [
          newSession,
          ...(prev[activeAgent.id] || []),
        ],
      }));

      setActiveSession((prev) => ({
        ...prev,
        [activeAgent.id]: newSession._id,
      }));

      setMessages([]);

      setInput('');

      /* Close mobile sidebar */
      setSidebarOpen(false);

      toast.success(`${activeAgent.name} new chat started!`);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Create session error:', error);

      toast.error(
        error.response?.data?.message ||
          'Could not create new chat'
      );
    }
  };

  /* -------------------------------------------------------
     LOAD PARTICULAR SESSION
  ------------------------------------------------------- */

  const loadSession = async (session, closeSidebar = true) => {
    try {
      const sessionId = session._id || session.id;

      const res = await chatAPI.getSession(sessionId);

      const loadedSession = res.data.session;

      setMessages(loadedSession?.messages || []);

      setActiveSession((prev) => ({
        ...prev,
        [activeAgent.id]: sessionId,
      }));

      if (closeSidebar) {
        setSidebarOpen(false);
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Load session error:', error);

      toast.error(
        error.response?.data?.message ||
          'Could not load chat'
      );
    }
  };

  /* -------------------------------------------------------
     SWITCH AGENT
  ------------------------------------------------------- */

  const switchAgent = (agent) => {
    setActiveAgent(agent);

    /* Close mobile sidebar */
    setSidebarOpen(false);
  };

  /* -------------------------------------------------------
     SEND MESSAGE
  ------------------------------------------------------- */

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    setInput('');

    const optimisticUserMessage = {
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [
      ...prev,
      optimisticUserMessage,
    ]);

    setLoading(true);

    try {
      let currentSessionId =
        activeSession[activeAgent.id];

      /*
        If there is no session yet, create one automatically.
      */

      if (!currentSessionId) {
        const sessionRes = await chatAPI.createSession(
          activeAgent.id
        );

        const newSession = sessionRes.data.session;

        currentSessionId = newSession._id;

        setActiveSession((prev) => ({
          ...prev,
          [activeAgent.id]: currentSessionId,
        }));

        setSessions((prev) => ({
          ...prev,
          [activeAgent.id]: [
            newSession,
            ...(prev[activeAgent.id] || []),
          ],
        }));
      }

      const res = await chatAPI.sendMessage(
        text,
        activeAgent.id,
        currentSessionId
      );

      const aiMessage = {
        role: 'assistant',
        content: res.data.message,
        createdAt: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

      /*
        Refresh history so the session title and
        updated time are updated.
      */

      try {
        const historyRes =
          await chatAPI.getHistory(activeAgent.id);

        const updatedSessions =
          historyRes.data.sessions || [];

        setSessions((prev) => ({
          ...prev,
          [activeAgent.id]: updatedSessions,
        }));
      } catch (historyError) {
        console.error(
          'History refresh error:',
          historyError
        );
      }
    } catch (error) {
      console.error('Send message error:', error);

      /*
        Remove optimistic message if request failed.
      */

      setMessages((prev) =>
        prev.filter(
          (message) =>
            message !== optimisticUserMessage
        )
      );

      toast.error(
        error.response?.data?.message ||
          'Failed to send message'
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  /* -------------------------------------------------------
     DELETE CURRENT SESSION
  ------------------------------------------------------- */

  const clearChat = async () => {
    const sessionId =
      activeSession[activeAgent.id];

    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      await chatAPI.deleteSession(sessionId);

      setMessages([]);

      setSessions((prev) => ({
        ...prev,
        [activeAgent.id]: (
          prev[activeAgent.id] || []
        ).filter(
          (session) =>
            session._id !== sessionId &&
            session.id !== sessionId
        ),
      }));

      setActiveSession((prev) => ({
        ...prev,
        [activeAgent.id]: null,
      }));

      toast.success('Chat deleted');
    } catch (error) {
      console.error('Delete session error:', error);

      toast.error(
        error.response?.data?.message ||
          'Could not delete chat'
      );
    }
  };

  /* -------------------------------------------------------
     VOICE RECORDING
  ------------------------------------------------------- */

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        const blob = new Blob(
          chunksRef.current,
          {
            type: 'audio/webm',
          }
        );

        if (blob.size < 100) {
          toast.error('Recording too short');
          return;
        }

        const formData = new FormData();

        formData.append(
          'audio',
          blob,
          'recording.webm'
        );

        toast.loading('Converting...', {
          id: 'voice',
        });

        try {
          const res = await API.post(
            '/voice/speech-to-text',
            formData
          );

          if (res.data.success) {
            setInput(res.data.text);

            toast.success(
              '🎤 Voice captured!',
              {
                id: 'voice',
              }
            );

            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        } catch (error) {
          console.error(
            'Voice conversion error:',
            error
          );

          toast.error(
            'Voice conversion failed',
            {
              id: 'voice',
            }
          );
        }
      };

      recorder.start();

      setRecording(true);

      setTimeout(() => {
        if (
          mediaRecorderRef.current?.state ===
          'recording'
        ) {
          stopRecording();
        }
      }, 15000);
    } catch (error) {
      console.error(
        'Microphone error:',
        error
      );

      toast.error(
        'Microphone permission denied'
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current?.state ===
      'recording'
    ) {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
  };

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /* -------------------------------------------------------
     CURRENT SESSIONS
  ------------------------------------------------------- */

  const agentSessions =
    sessions[activeAgent.id] || [];

  const groupedSessions =
    groupByDate(agentSessions);

  const currentSessionId =
    activeSession[activeAgent.id];

  /* -------------------------------------------------------
     STARTER PROMPTS
  ------------------------------------------------------- */

  const starterPrompts =
    activeAgent.id === 'teacher'
      ? [
          'Explain recursion in simple words',
          'What is DBMS and its types?',
          'Explain OOP concepts with examples',
          'What is REST API?',
        ]
      : activeAgent.id === 'examiner'
      ? [
          'Generate 5 MCQs on arrays',
          'Quiz me on linked lists',
          'Create a mock exam on SQL',
          'Test my OS knowledge',
        ]
      : activeAgent.id === 'debugger'
      ? [
          'Debug my Java code',
          'Review my Python function',
          'Fix my SQL query',
          'Explain this error message',
        ]
      : activeAgent.id === 'coach'
      ? [
          'Create my study plan for exams',
          'How to be more productive?',
          'Help me stay consistent',
          'Motivate me to study',
        ]
      : activeAgent.id === 'research'
      ? [
          'Research blockchain in depth',
          'Explain machine learning',
          'Deep dive into cloud computing',
          'Research cybersecurity basics',
        ]
      : [
          'What careers suit my IT degree?',
          'How to prepare for placements?',
          'Best skills for software jobs',
          'How to crack technical interviews?',
        ];

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="chat-app">

      {/* ================================================
          MOBILE SIDEBAR BACKDROP
      ================================================= */}

      {sidebarOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`chat-sidebar ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        <div className="sidebar-inner">

          {/* Logo */}
          <div className="sidebar-header">

            <Link
              to="/dashboard"
              className="sidebar-logo"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              Syllabus
              <span>AI</span>
            </Link>

            <button
              className="sidebar-close"
              onClick={() =>
                setSidebarOpen(false)
              }
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          {/* <div className="sidebar-navigation">

            <Link
              to="/dashboard"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              📊 Dashboard
            </Link>

            <Link
              to="/learn"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              📚 Learn
            </Link>

            <Link
              to="/exam"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              📝 Exam
            </Link>

            <Link
              to="/career"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              💼 Career
            </Link>

          </div> */}

          {/* New Chat */}
          <div className="new-chat-wrapper">

            <button
              className="new-chat-button"
              onClick={startNewChat}
            >
              <span>✏️</span>
              New Chat
            </button>

          </div>

          {/* Agents */}
          <div className="agents-section">

            <div className="section-label">
              AI AGENTS
            </div>

            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                className={`agent-button ${
                  activeAgent.id === agent.id
                    ? 'agent-active'
                    : ''
                }`}
                onClick={() =>
                  switchAgent(agent)
                }
              >

                <span
                  className="agent-icon"
                  style={{
                    background:
                      activeAgent.id === agent.id
                        ? `${agent.color}25`
                        : 'rgba(255,255,255,0.05)',
                    borderColor:
                      activeAgent.id === agent.id
                        ? `${agent.color}50`
                        : 'rgba(255,255,255,0.06)',
                  }}
                >
                  {agent.icon}
                </span>

                <span className="agent-information">

                  <span className="agent-name">
                    {agent.name}
                  </span>

                  <span className="agent-description">
                    {agent.desc}
                  </span>

                </span>

                {activeAgent.id === agent.id && (
                  <span
                    className="agent-dot"
                    style={{
                      background:
                        agent.color,
                    }}
                  />
                )}

              </button>
            ))}

          </div>

          {/* History */}
          <div className="history-section no-scrollbar">

            <div className="section-label history-title">
              HISTORY
            </div>

            {agentSessions.length === 0 ? (
              <div className="empty-history">

                <div className="empty-history-icon">
                  💬
                </div>

                No chat history yet.
                <br />
                Start a conversation!

              </div>
            ) : (
              Object.entries(
                groupedSessions
              ).map(
                ([group, groupSessions]) => {

                  if (!groupSessions.length) {
                    return null;
                  }

                  return (
                    <div
                      key={group}
                      className="history-group"
                    >

                      <div className="history-group-title">
                        {group}
                      </div>

                      {groupSessions.map(
                        (session) => {

                          const sessionId =
                            session._id ||
                            session.id;

                          return (
                            <button
                              key={sessionId}
                              className={`history-item ${
                                currentSessionId ===
                                sessionId
                                  ? 'history-active'
                                  : ''
                              }`}
                              onClick={() =>
                                loadSession(
                                  session
                                )
                              }
                            >
                              {activeAgent.icon}{' '}
                              {session.title ||
                                'New Chat'}
                            </button>
                          );
                        }
                      )}

                    </div>
                  );
                }
              )
            )}

          </div>

          {/* User */}
          <div className="sidebar-user">

            <div className="user-information">

              <div className="user-avatar">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || 'S'}
              </div>

              <div className="user-details">

                <div className="user-name">
                  {user?.name || 'Student'}
                </div>

                <div className="user-plan">
                  {user?.plan || 'Free Plan'}
                </div>

              </div>

            </div>

            <div className="user-actions">

              <Link
                to="/settings"
                onClick={() =>
                  setSidebarOpen(false)
                }
              >
                ⚙️ Settings
              </Link>

              <button
                onClick={handleLogout}
              >
                🚪 Logout
              </button>

            </div>

          </div>

        </div>
      </aside>

      {/* ================================================
          MAIN
      ================================================= */}

      <main className="chat-main">

        {/* ==============================================
            TOP HEADER
        =============================================== */}

        <header className="chat-topbar">

          {/* Left */}
          <div className="topbar-left">

            <button
              className="menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              ☰
            </button>

            {/* Desktop navigation */}
            <nav className="desktop-navigation">

              <Link to="/dashboard">
                Dashboard
              </Link>

              <Link to="/learn">
                Learn
              </Link>

              <Link to="/exam">
                Exam
              </Link>

              <Link to="/career">
                Career
              </Link>

            </nav>

          </div>

          {/* Center/Agent */}
          <div className="active-agent-header">

            <div
              className="active-agent-icon"
              style={{
                background:
                  `${activeAgent.color}20`,
                borderColor:
                  `${activeAgent.color}40`,
              }}
            >
              {activeAgent.icon}
            </div>

            <div className="active-agent-text">

              <div className="active-agent-name">
                {activeAgent.name} Agent
              </div>

              <div className="active-agent-desc">
                {activeAgent.desc}
              </div>

            </div>

          </div>

          {/* Right */}
          <div className="topbar-actions">

            {/* Desktop agent buttons */}
            <div className="desktop-agent-switcher">

              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() =>
                    switchAgent(agent)
                  }
                  title={agent.name}
                  className="desktop-agent-button"
                  style={{
                    background:
                      activeAgent.id === agent.id
                        ? `${agent.color}25`
                        : 'rgba(255,255,255,0.04)',
                    outline:
                      activeAgent.id === agent.id
                        ? `1px solid ${agent.color}50`
                        : 'none',
                  }}
                >
                  {agent.icon}
                </button>
              ))}

            </div>

            <button
              onClick={clearChat}
              className="clear-button"
              title="Delete current chat"
            >
              🗑️
              <span>Clear</span>
            </button>

          </div>

        </header>

        {/* ==============================================
            MESSAGES AREA
        =============================================== */}

        <section className="messages-area no-scrollbar">

          <div className="messages-container">

            {/* EMPTY STATE */}
            {messages.length === 0 && (
              <div className="empty-chat">

                <div
                  className="empty-chat-icon"
                  style={{
                    background:
                      `${activeAgent.color}12`,
                    borderColor:
                      `${activeAgent.color}25`,
                  }}
                >
                  {activeAgent.icon}
                </div>

                <h1>
                  Chat with{' '}
                  <span
                    style={{
                      color:
                        activeAgent.color,
                    }}
                  >
                    {activeAgent.name}
                  </span>
                </h1>

                <p>
                  {activeAgent.id ===
                    'teacher' &&
                    'Ask me to explain any topic from your syllabus clearly and simply.'}

                  {activeAgent.id ===
                    'examiner' &&
                    'Ask me to generate quiz questions or evaluate your answers.'}

                  {activeAgent.id ===
                    'debugger' &&
                    "Paste your code and I'll find bugs and fix them for you."}

                  {activeAgent.id ===
                    'coach' &&
                    "Tell me your goals and I'll create your personalized study plan."}

                  {activeAgent.id ===
                    'research' &&
                    'Ask me to research any topic with deep, comprehensive answers.'}

                  {activeAgent.id ===
                    'mentor' &&
                    'Ask me about career paths, skills, and opportunities in your field.'}
                </p>

                {/* Starter prompts */}
                <div className="starter-prompts">

                  {starterPrompts.map(
                    (prompt, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setInput(prompt)
                        }
                        className="starter-prompt"
                      >
                        {prompt}
                      </button>
                    )
                  )}

                </div>

              </div>
            )}

            {/* MESSAGES */}
            {messages.map(
              (msg, index) => (
                <div
                  key={
                    msg._id ||
                    `${msg.role}-${index}`
                  }
                  className={`message-row ${
                    msg.role === 'user'
                      ? 'user-message'
                      : 'assistant-message'
                  }`}
                >

                  <div className="message-label">
                    {msg.role === 'user'
                      ? '👤 You'
                      : `${activeAgent.icon} ${activeAgent.name}`}
                  </div>

                  <div
                    className={`message-bubble ${
                      msg.role === 'user'
                        ? 'user-bubble'
                        : 'assistant-bubble'
                    }`}
                    style={
                      msg.role === 'user'
                        ? {
                            background: `linear-gradient(135deg, ${activeAgent.color}CC, ${activeAgent.color}99)`,
                          }
                        : {}
                    }
                  >

                    {msg.role ===
                    'user' ? (
                      <p>
                        {msg.content}
                      </p>
                    ) : (
                      <div className="markdown-content">

                        <ReactMarkdown
                          components={{
                            code: ({
                              inline,
                              children,
                              ...props
                            }) =>
                              inline ? (
                                <code
                                  className="inline-code"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre className="code-block">
                                  <code
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                </pre>
                              ),

                            p: ({
                              children,
                            }) => (
                              <p>
                                {children}
                              </p>
                            ),

                            ul: ({
                              children,
                            }) => (
                              <ul>
                                {children}
                              </ul>
                            ),

                            ol: ({
                              children,
                            }) => (
                              <ol>
                                {children}
                              </ol>
                            ),

                            li: ({
                              children,
                            }) => (
                              <li>
                                {children}
                              </li>
                            ),

                            h1: ({
                              children,
                            }) => (
                              <h1>
                                {children}
                              </h1>
                            ),

                            h2: ({
                              children,
                            }) => (
                              <h2>
                                {children}
                              </h2>
                            ),

                            h3: ({
                              children,
                            }) => (
                              <h3>
                                {children}
                              </h3>
                            ),

                            strong: ({
                              children,
                            }) => (
                              <strong>
                                {children}
                              </strong>
                            ),

                            blockquote: ({
                              children,
                            }) => (
                              <blockquote
                                style={{
                                  borderLeft: `3px solid ${activeAgent.color}`,
                                }}
                              >
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>

                      </div>
                    )}

                  </div>

                </div>
              )
            )}

            {/* TYPING */}
            {loading && (
              <div className="message-row assistant-message">

                <div className="message-label">
                  {activeAgent.icon}{' '}
                  {activeAgent.name}
                </div>

                <div className="typing-bubble">

                  <span
                    style={{
                      background:
                        activeAgent.color,
                    }}
                  />

                  <span
                    style={{
                      background:
                        activeAgent.color,
                    }}
                  />

                  <span
                    style={{
                      background:
                        activeAgent.color,
                    }}
                  />

                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

        </section>

        {/* ==============================================
            INPUT
        =============================================== */}

        <div className="input-area">

          <div className="input-container">

            <div className="input-box">

              {/* Voice */}
              <button
                onClick={
                  recording
                    ? stopRecording
                    : startRecording
                }
                className={`voice-button ${
                  recording
                    ? 'recording'
                    : ''
                }`}
                title={
                  recording
                    ? 'Stop recording'
                    : 'Voice input'
                }
              >
                {recording
                  ? '⏹️'
                  : '🎤'}
              </button>

              {/* Text */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  recording
                    ? '🎤 Recording...'
                    : `Message ${activeAgent.name}...`
                }
                rows={1}
                disabled={
                  loading || recording
                }
                className="chat-input"
                onInput={(e) => {
                  e.target.style.height =
                    'auto';

                  e.target.style.height =
                    Math.min(
                      e.target
                        .scrollHeight,
                      120
                    ) + 'px';
                }}
              />

              {/* Send */}
              <button
                onClick={sendMessage}
                disabled={
                  loading ||
                  !input.trim()
                }
                className="send-button"
                style={{
                  background:
                    input.trim()
                      ? activeAgent.color
                      : 'rgba(255,255,255,0.06)',
                }}
              >
                ↑
              </button>

            </div>

            <div className="input-hint">
              Enter to send · Shift+Enter
              for new line · 🎤 for voice
            </div>

          </div>

        </div>

      </main>

      {/* ================================================
          STYLES
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          background: #0A0F1E;
        }

        button,
        textarea,
        input {
          font-family: 'DM Sans', sans-serif;
        }

        .chat-app {
  position: relative;
  display: flex;
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  background: #0A0F1E;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

        /* ==========================================
           SIDEBAR
        ========================================== */

        .chat-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100%;
          background: #060C18;
          border-right: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          transition: width 0.25s ease,
                      min-width 0.25s ease;
          overflow: hidden;
          z-index: 1000;
        }

        .sidebar-inner {
  width: 260px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

        .sidebar-header {
          height: 62px;
          padding: 0 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .sidebar-logo {
          color: #fff;
          text-decoration: none;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .sidebar-logo span {
          color: #3B82F6;
        }

        .sidebar-close {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 18px;
        }

        .sidebar-close:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }

        /* Navigation */

        .sidebar-navigation {
          padding: 10px 12px 4px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-navigation a {
          display: block;
          padding: 8px 10px;
          margin-bottom: 2px;
          border-radius: 8px;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
        }

        .sidebar-navigation a:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        /* New chat */

        .new-chat-wrapper {
          padding: 10px 12px;
          flex-shrink: 0;
        }

        .new-chat-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(59,130,246,0.25);
          background: rgba(59,130,246,0.12);
          color: #60A5FA;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .new-chat-button:hover {
          background: rgba(59,130,246,0.2);
        }

        /* Agents */

        .agents-section {
          padding: 4px 12px 8px;
          flex-shrink: 0;
        }

        .section-label {
          padding: 4px 2px 6px;
          color: rgba(255,255,255,0.3);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .agent-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 8px;
          margin-bottom: 2px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          text-align: left;
        }

        .agent-button:hover {
          background: rgba(255,255,255,0.04);
          color: #fff;
        }

        .agent-active {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        .agent-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        .agent-information {
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .agent-name {
          font-size: 12.5px;
          font-weight: 600;
        }

        .agent-description {
          margin-top: 2px;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .agent-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-left: auto;
          flex-shrink: 0;
        }

        /* History */

        .history-section {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 4px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .history-title {
          margin-top: 6px;
        }

        .history-group-title {
          padding: 7px 2px 4px;
          color: rgba(255,255,255,0.25);
          font-size: 10px;
          font-weight: 600;
        }

        .history-item {
          width: 100%;
          display: block;
          padding: 7px 9px;
          margin-bottom: 2px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 12px;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-item:hover {
          background: rgba(255,255,255,0.04);
          color: #fff;
        }

        .history-active {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }

        .empty-history {
          padding: 20px 8px;
          text-align: center;
          color: rgba(255,255,255,0.2);
          font-size: 12px;
          line-height: 1.6;
        }

        .empty-history-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        /* User */

        .sidebar-user {
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .user-information {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #3B82F6,
            #8B5CF6
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .user-details {
          min-width: 0;
          flex: 1;
        }

        .user-name {
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-plan {
          margin-top: 2px;
          font-size: 10px;
          color: rgba(255,255,255,0.35);
        }

        .user-actions {
          display: flex;
          gap: 6px;
        }

        .user-actions a,
        .user-actions button {
          flex: 1;
          padding: 6px 4px;
          border-radius: 8px;
          font-size: 11px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
        }

        .user-actions a {
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }

        .user-actions button {
          color: #F87171;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
        }

        /* ==========================================
           MAIN
        ========================================== */

        .chat-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

        /* ==========================================
           TOPBAR
        ========================================== */

        .chat-topbar {
          height: 62px;
          min-height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 16px;
          background: rgba(6,12,24,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          z-index: 20;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 18px;
          min-width: 0;
        }

        .menu-button {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: none;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 19px;
        }

        .menu-button:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        .desktop-navigation {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .desktop-navigation a {
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        .desktop-navigation a:hover {
          color: #fff;
        }

        .active-agent-header {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .active-agent-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        .active-agent-text {
          min-width: 0;
        }

        .active-agent-name {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .active-agent-desc {
          margin-top: 2px;
          color: rgba(255,255,255,0.35);
          font-size: 10px;
          white-space: nowrap;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .desktop-agent-switcher {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .desktop-agent-button {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .clear-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 9px;
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 8px;
          background: rgba(239,68,68,0.1);
          color: #F87171;
          cursor: pointer;
          font-size: 11px;
          white-space: nowrap;
        }

        /* ==========================================
           MESSAGES
        ========================================== */

        .messages-area {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px 0;
        }

        .messages-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .empty-chat {
          text-align: center;
          padding-top: 55px;
        }

        .empty-chat-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 18px;
          border-radius: 20px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
        }

        .empty-chat h1 {
          margin: 0 0 8px;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .empty-chat > p {
          max-width: 430px;
          margin: 0 auto 30px;
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          line-height: 1.7;
        }

        .starter-prompts {
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .starter-prompt {
          min-width: 0;
          min-height: 62px;
          padding: 12px 14px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          text-align: left;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .starter-prompt:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }

        /* Messages */

        .message-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
          min-width: 0;
        }

        .user-message {
          align-items: flex-end;
        }

        .assistant-message {
          align-items: flex-start;
        }

        .message-label {
          margin-bottom: 6px;
          padding-left: 4px;
          color: rgba(255,255,255,0.25);
          font-size: 11px;
        }

        .message-bubble {
          min-width: 0;
          max-width: 88%;
          padding: 12px 16px;
          border-radius: 18px;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .user-bubble {
          max-width: 72%;
          border-radius: 18px 18px 4px 18px;
        }

        .assistant-bubble {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px 18px 18px 4px;
        }

        .message-bubble p {
          margin: 0;
          font-size: 14px;
          line-height: 1.65;
        }

        .markdown-content {
          min-width: 0;
          max-width: 100%;
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .markdown-content p {
          margin: 0 0 8px;
        }

        .markdown-content p:last-child {
          margin-bottom: 0;
        }

        .markdown-content ul,
        .markdown-content ol {
          margin: 4px 0 8px;
          padding-left: 20px;
        }

        .markdown-content li {
          margin-bottom: 4px;
        }

        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          color: #fff;
        }

        .markdown-content h1 {
          font-size: 18px;
        }

        .markdown-content h2 {
          font-size: 16px;
        }

        .markdown-content h3 {
          font-size: 14px;
        }

        .inline-code {
          background: rgba(0,0,0,0.3);
          padding: 1px 6px;
          border-radius: 4px;
          color: #60A5FA;
          font-family: monospace;
          font-size: 13px;
        }

        .code-block {
          max-width: 100%;
          overflow-x: auto;
          padding: 12px 14px;
          margin: 8px 0;
          border-radius: 10px;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .code-block code {
          color: #6EE7B7;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.6;
          white-space: pre;
        }

        /* Typing */

        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 14px 18px;
          border-radius: 18px 18px 18px 4px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .typing-bubble span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          animation: bounce 1s infinite;
          opacity: 0.5;
        }

        .typing-bubble span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing-bubble span:nth-child(3) {
          animation-delay: 0.3s;
        }

        /* ==========================================
           INPUT
        ========================================== */

        .input-area {
          flex-shrink: 0;
          padding: 12px 20px 16px;
          background: rgba(6,12,24,0.98);
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .input-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .input-box {
          width: 100%;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 8px 8px 8px 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
        }

        .voice-button,
        .send-button {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .voice-button {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.4);
          font-size: 16px;
        }

        .voice-button.recording {
          background: rgba(239,68,68,0.2);
          color: #F87171;
          animation: pulse 1s infinite;
        }

        .chat-input {
          flex: 1;
          min-width: 0;
          max-width: 100%;
          padding: 5px 0;
          border: none;
          outline: none;
          resize: none;
          background: transparent;
          color: #fff;
          font-size: 14px;
          line-height: 1.6;
        }

        .chat-input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .send-button {
          color: #fff;
          font-size: 17px;
          opacity: 1;
        }

        .send-button:disabled {
          cursor: default;
          opacity: 0.4;
        }

        .input-hint {
          margin-top: 8px;
          text-align: center;
          color: rgba(255,255,255,0.2);
          font-size: 11px;
        }

        /* ==========================================
           MOBILE BACKDROP
        ========================================== */

        .mobile-sidebar-backdrop {
          display: none;
        }

        /* ==========================================
           SCROLLBAR
        ========================================== */

        .no-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .no-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .no-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
        }

        /* ==========================================
           ANIMATIONS
        ========================================== */

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }

          50% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.5;
          }
        }

        /* ==========================================
           TABLET
        ========================================== */

        @media (max-width: 900px) {

          .desktop-navigation {
            gap: 10px;
          }

          .desktop-navigation a {
            font-size: 12px;
          }

          .desktop-agent-switcher {
            display: none;
          }

          .active-agent-header {
            margin-left: auto;
            margin-right: auto;
          }

        }

        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 640px) {

          .chat-app {
            width: 100%;
            height: 100dvh;
            min-height: 100dvh;
          }

          /* -----------------------------------------
             MOBILE SIDEBAR
          ----------------------------------------- */

          .chat-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px !important;
            min-width: 280px !important;
            height: 100dvh;
            transform: translateX(-105%);
            transition: transform 0.25s ease;
            box-shadow: 12px 0 35px rgba(0,0,0,0.5);
            z-index: 1001;
          }

          .chat-sidebar.sidebar-open {
            transform: translateX(0);
          }

          .chat-sidebar.sidebar-closed {
            transform: translateX(-105%);
          }

          .sidebar-inner {
            width: 280px;
          }

          /* -----------------------------------------
             BACKDROP
          ----------------------------------------- */

          .mobile-sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.58);
            backdrop-filter: blur(2px);
            z-index: 1000;
          }

          /* -----------------------------------------
             TOPBAR
          ----------------------------------------- */

          .chat-topbar {
            height: 58px;
            min-height: 58px;
            padding: 0 8px;
            gap: 6px;
          }

          .topbar-left {
            gap: 6px;
            flex-shrink: 0;
          }

          .menu-button {
            width: 36px;
            height: 36px;
            font-size: 19px;
          }

          /* Hide desktop navigation */
          .desktop-navigation {
            display: none;
          }

          .active-agent-header {
            flex: 1;
            min-width: 0;
            margin: 0;
            justify-content: center;
          }

          .active-agent-icon {
            width: 32px;
            height: 32px;
            font-size: 15px;
          }

          .active-agent-name {
            font-size: 12px;
          }

          .active-agent-desc {
            font-size: 9px;
          }

          .topbar-actions {
            flex-shrink: 0;
          }

          .desktop-agent-switcher {
            display: none;
          }

          .clear-button {
            padding: 6px 7px;
            font-size: 10px;
          }

          .clear-button span {
            display: none;
          }

          /* -----------------------------------------
             MESSAGES
          ----------------------------------------- */

          .messages-area {
            padding: 18px 0;
          }

          .messages-container {
            padding: 0 12px;
          }

          .empty-chat {
            padding-top: 35px;
          }

          .empty-chat-icon {
            width: 62px;
            height: 62px;
            margin-bottom: 14px;
            border-radius: 17px;
            font-size: 34px;
          }

          .empty-chat h1 {
            font-size: 22px;
          }

          .empty-chat > p {
            padding: 0 12px;
            margin-bottom: 24px;
            font-size: 13px;
            line-height: 1.6;
          }

          /* Single column starter buttons */
          .starter-prompts {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 0 4px;
          }

          .starter-prompt {
            min-height: auto;
            padding: 11px 13px;
          }

          /* Messages */
          .message-row {
            margin-bottom: 18px;
          }

          .message-bubble {
            max-width: 94%;
            padding: 10px 13px;
          }

          .user-bubble {
            max-width: 88%;
          }

          .message-bubble p {
            font-size: 13.5px;
          }

          .markdown-content {
            font-size: 13.5px;
          }

          .code-block {
            max-width: calc(100vw - 55px);
            padding: 10px;
            overflow-x: auto;
          }

          /* -----------------------------------------
             INPUT
          ----------------------------------------- */

          .input-area {
            padding: 8px 8px 10px;
          }

          .input-box {
            gap: 5px;
            padding: 6px;
            border-radius: 14px;
          }

          .voice-button,
          .send-button {
            width: 34px;
            height: 34px;
            min-width: 34px;
          }

          .chat-input {
            font-size: 14px;
            min-width: 0;
          }

          .input-hint {
            display: none;
          }

        }

        /* ==========================================
           VERY SMALL PHONES
        ========================================== */

        @media (max-width: 360px) {

          .chat-topbar {
            padding: 0 5px;
          }

          .active-agent-name {
            font-size: 11px;
          }

          .active-agent-desc {
            display: none;
          }

          .clear-button {
            padding: 5px;
          }

          .messages-container {
            padding: 0 9px;
          }

          .message-bubble {
            max-width: 96%;
          }

          .user-bubble {
            max-width: 92%;
          }

        }

      `}</style>
    </div>
  );
}