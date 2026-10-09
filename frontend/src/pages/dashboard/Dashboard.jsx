import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { syllabusAPI, coachAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NavLink = ({ to, label }) => (
  <Link to={to} className="dashboard-nav-link">
    {label}
  </Link>
);

const Icon = ({ name, size = 18 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const icons = {
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </>
    ),
    upload: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m17 8-5-5-5 5M12 3v12" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
        <path d="m19 3 .8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 5-7" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 7h8M8 11h7" />
      </>
    ),
    flame: (
      <path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-2-1-3-3-3-5-3 3-4 6-4 9a7 7 0 0 0 7 7Z" />
    ),
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
  };

  return <svg {...props}>{icons[name] || icons.sparkles}</svg>;
};

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [syllabus, setSyllabus] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDashboard = async () => {
      const [syllabusResult, motivationResult] = await Promise.allSettled([
        syllabusAPI.getMy(),
        coachAPI.getMotivation(),
      ]);

      if (cancelled) return;

      if (syllabusResult.status === 'fulfilled') {
        setSyllabus(syllabusResult.value.data.syllabus || null);
      } else {
        if (syllabusResult.reason?.response?.status !== 404) {
          console.error('Unable to load syllabus:', syllabusResult.reason);
        }
        setSyllabus(null);
      }

      if (motivationResult.status === 'fulfilled') {
        setMotivation(motivationResult.value.data.message || '');
      }

      setLoading(false);
    };

    fetchDashboard().catch((error) => {
      console.error('Unable to load dashboard:', error);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (user?.role === 'admin') return null;

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'there';
  const subjects = syllabus?.subjects || [];
  const progress = Math.min(
    100,
    Math.max(0, Number(syllabus?.overallProgress) || 0)
  );

  const stats = [
    {
      label: 'Overall progress',
      value: `${progress}%`,
      detail: 'of syllabus covered',
      color: '#91A9FF',
      icon: 'chart',
      percent: progress,
    },
    {
      label: 'Topics completed',
      value: Number(syllabus?.completedTopics) || 0,
      detail: `of ${Number(syllabus?.totalTopics) || 0} total topics`,
      color: '#57D6B5',
      icon: 'check',
      percent:
        Number(syllabus?.totalTopics) > 0
          ? Math.min(
              100,
              ((Number(syllabus?.completedTopics) || 0) /
                Number(syllabus.totalTopics)) *
                100
            )
          : 0,
    },
    {
      label: 'Subjects',
      value: subjects.length,
      detail: syllabus?.branch || 'Your curriculum',
      color: '#C0A2FF',
      icon: 'layers',
      percent: subjects.length ? 100 : 0,
    },
    {
      label: 'Learning streak',
      value: `${Number(user?.streak) || 0}d`,
      detail: 'days active',
      color: '#FFC477',
      icon: 'flame',
      percent: Math.min(100, ((Number(user?.streak) || 0) / 30) * 100),
    },
  ];

  const studyTools = [
    {
      to: '/chat',
      number: '01',
      title: 'AI Chat',
      description: 'Ask questions and get help from your AI study assistants.',
      color: '#91A9FF',
      icon: 'sparkles',
    },
    {
      to: '/learn',
      number: '02',
      title: 'Learn',
      description: 'Understand concepts with structured explanations.',
      color: '#C0A2FF',
      icon: 'book',
    },
    {
      to: '/exam',
      number: '03',
      title: 'Practice exam',
      description: 'Test your knowledge with AI-generated quizzes.',
      color: '#57D6B5',
      icon: 'check',
    },
    {
      to: '/career',
      number: '04',
      title: 'Career guide',
      description: 'Explore career paths, skills, and opportunities.',
      color: '#FFC477',
      icon: 'chart',
    },
  ];

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      toast.error('Please select a PDF file.');
      event.target.value = '';
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('The PDF must be smaller than 50 MB.');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('syllabus', file);

      const response = await syllabusAPI.upload(formData);

      setSyllabus(response.data.syllabus);
      toast.success('Syllabus analyzed successfully.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Unable to sign out. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      <style>{css}</style>

      <div className="dashboard-background" aria-hidden="true">
        <div className="background-grid" />
        <div className="background-glow background-glow-one" />
        <div className="background-glow background-glow-two" />
      </div>

      <header className="dashboard-nav">
        <Link to="/dashboard" className="brand" aria-label="SyllabusAI home">
          <span className="brand-icon">
            <Icon name="layers" size={19} />
          </span>
          <span className="brand-name">
            Syllabus<span>AI</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/chat" label="Chat" />
          <NavLink to="/learn" label="Learn" />
          <NavLink to="/exam" label="Exam" />
          <NavLink to="/career" label="Career" />
          <NavLink to="/settings" label="Settings" />
        </nav>

        <div className="nav-account">
          <div className="avatar" aria-label={`Account for ${firstName}`}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span className="account-name">{firstName}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            <Icon name="logout" size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <div className="welcome-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              YOUR PERSONAL LEARNING SPACE
            </div>
            <h1>
              Good day, <span>{firstName}.</span>
            </h1>
            <p>Here is your learning overview. Let’s make today count.</p>
          </div>

          {motivation && (
            <div className="motivation-card">
              <div className="motivation-icon">
                <Icon name="sparkles" size={18} />
              </div>
              <div className="motivation-copy">
                <span>A thought for today</span>
                <p>{motivation}</p>
              </div>
            </div>
          )}
        </section>

        {loading ? (
          <section className="loading-panel" aria-live="polite">
            <span className="spinner" />
            <p>Preparing your learning dashboard…</p>
          </section>
        ) : !syllabus ? (
          <section className="upload-card">
            <div className="upload-content">
              <span className="section-kicker">LET’S GET STARTED</span>
              <h2>Make your syllabus work for you.</h2>
              <p className="upload-description">
                Upload your syllabus and turn your curriculum into a clear
                learning overview. Keep track of your subjects, follow your
                progress, and prepare for exams in one place.
              </p>

              <div className="upload-benefits">
                <span><Icon name="check" size={15} /> Subject overview</span>
                <span><Icon name="check" size={15} /> Progress tracking</span>
                <span><Icon name="check" size={15} /> Study tools</span>
              </div>

              <label className={`upload-button ${uploading ? 'is-loading' : ''}`}>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                  aria-label="Choose syllabus PDF"
                />
                {uploading ? (
                  <>
                    <span className="spinner spinner-small" />
                    Analyzing PDF…
                  </>
                ) : (
                  <>
                    <Icon name="upload" size={17} />
                    Choose syllabus PDF
                  </>
                )}
              </label>
              <p className="upload-hint">PDF only · Maximum file size 50 MB</p>
            </div>

            <div className="document-visual" aria-hidden="true">
              <div className="document-orbit orbit-one" />
              <div className="document-orbit orbit-two" />
              <div className="document-sheet">
                <div className="document-symbol">
                  <Icon name="file" size={27} />
                </div>
                <div className="document-line line-full" />
                <div className="document-line line-medium" />
                <div className="document-line line-short" />
                <div className="document-divider" />
                <div className="document-row"><span /><i /></div>
                <div className="document-row"><span /><i /></div>
                <div className="document-row"><span /><i /></div>
                <div className="document-progress"><span /></div>
              </div>
              <div className="floating-label floating-label-top">
                <span className="status-dot" />
                Smart learning starts here
              </div>
              <div className="floating-label floating-label-bottom">
                <Icon name="sparkles" size={15} />
                Your semester, organized
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="dashboard-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">YOUR PROGRESS</span>
                  <h2>Learning at a glance</h2>
                </div>
                <span className="overview-badge">
                  <span className="status-dot" />
                  YOUR OVERVIEW
                </span>
              </div>

              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <article
                    className="stat-card"
                    key={stat.label}
                    style={{
                      '--stat-color': stat.color,
                      '--card-index': index,
                    }}
                  >
                    <div className="stat-top">
                      <span className="stat-icon">
                        <Icon name={stat.icon} size={19} />
                      </span>
                      <span className="stat-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-detail">{stat.detail}</div>

                    <div
                      className="stat-progress-track"
                      role="progressbar"
                      aria-label={stat.label}
                      aria-valuenow={Math.round(stat.percent)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span style={{ width: `${stat.percent}%` }} />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">YOUR CURRICULUM</span>
                  <h2>
                    {syllabus.branch || 'Your syllabus'}
                    {syllabus.semester
                      ? ` · Semester ${syllabus.semester}`
                      : ''}
                  </h2>
                </div>
                <span className="subject-count">
                  {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                </span>
              </div>

              {subjects.length > 0 ? (
                <div className="subjects-grid">
                  {subjects.map((subject, index) => {
                    const subjectProgress = Math.min(
                      100,
                      Math.max(0, Number(subject.progress) || 0)
                    );

                    return (
                      <article
                        className="subject-card"
                        key={subject._id || `${subject.name}-${index}`}
                      >
                        <div className="subject-card-top">
                          <span className="subject-index">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`subject-status ${
                              subjectProgress >= 100 ? 'completed' : ''
                            }`}
                          >
                            {subjectProgress >= 100 ? 'Completed' : 'In progress'}
                          </span>
                        </div>

                        <h3>{subject.name}</h3>

                        <div className="subject-progress-label">
                          <span>Completion</span>
                          <strong>{subjectProgress}%</strong>
                        </div>
                        <div className="subject-progress-track">
                          <span style={{ width: `${subjectProgress}%` }} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-subjects">
                  <Icon name="book" size={22} />
                  <p>No subjects were found in this syllabus.</p>
                </div>
              )}
            </section>
          </>
        )}

        <section className="dashboard-section tools-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">YOUR NEXT STEP</span>
              <h2>Study tools</h2>
            </div>
            <p className="section-subtitle">
              Everything you need to keep moving.
            </p>
          </div>

          <div className="actions-grid">
            {studyTools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="action-card"
                style={{ '--action-color': tool.color }}
              >
                <div className="action-card-top">
                  <span className="action-icon">
                    <Icon name={tool.icon} size={21} />
                  </span>
                  <span className="action-number">{tool.number}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <span className="action-link">
                  Explore tool <Icon name="arrow" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="dashboard-footer">
          <Link to="/dashboard" className="footer-brand">
            Syllabus<span>AI</span>
          </Link>
          <span>Small steps. Consistent progress.</span>
        </footer>
      </main>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * {
    box-sizing: border-box;
  }

  html {
    min-width: 320px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    background: #090B12;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  button, input {
    font: inherit;
  }

  .dashboard {
    --page-bg: #090B12;
    --muted: #9299AD;
    --line: rgba(255, 255, 255, .075);
    position: relative;
    isolation: isolate;
    min-height: 100vh;
    overflow: clip;
    background: var(--page-bg);
    color: #F2F4FC;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .dashboard-background {
    position: absolute;
    inset: 0 0 auto;
    height: 760px;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
  }

  .background-grid {
    position: absolute;
    inset: 0;
    opacity: .24;
    background-image:
      linear-gradient(rgba(255,255,255,.027) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.027) 1px, transparent 1px);
    background-size: 54px 54px;
    mask-image: linear-gradient(to bottom, black, transparent 90%);
  }

  .background-glow {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
  }

  .background-glow-one {
    top: -280px;
    left: 14%;
    background: #5278FF;
    opacity: .14;
  }

  .background-glow-two {
    top: 100px;
    right: -320px;
    background: #855BFF;
    opacity: .09;
  }

  /* Navigation */

  .dashboard-nav {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;
    min-height: 70px;
    padding: 0 clamp(20px, 4.5vw, 68px);
    border-bottom: 1px solid rgba(255,255,255,.065);
    background: rgba(9,11,18,.86);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    color: #F2F4FC;
    text-decoration: none;
  }

  .brand-icon {
    display: grid;
    width: 35px;
    height: 35px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.24);
    border-radius: 10px;
    background: linear-gradient(145deg, rgba(115,145,255,.17), rgba(115,145,255,.035));
    color: #A8BAFF;
  }

  .brand-name {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.8px;
    white-space: nowrap;
  }

  .brand-name span,
  .footer-brand span {
    color: #91A9FF;
  }

  .nav-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(13px, 2.1vw, 29px);
    min-width: 0;
  }

  .dashboard-nav-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 70px;
    color: #969DB0;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    white-space: nowrap;
    transition: color .2s ease;
  }

  .dashboard-nav-link::after {
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    border-radius: 5px 5px 0 0;
    background: #91A9FF;
    content: '';
    transform: scaleX(0);
    transition: transform .2s ease;
  }

  .dashboard-nav-link:hover,
  .dashboard-nav-link:focus-visible {
    color: #F4F5FC;
  }

  .dashboard-nav-link:hover::after,
  .dashboard-nav-link:focus-visible::after {
    transform: scaleX(1);
  }

  .nav-account {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .avatar {
    display: grid;
    width: 33px;
    height: 33px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 50%;
    background: linear-gradient(145deg, #8CA5FF, #7359C9);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
  }

  .account-name {
    max-width: 100px;
    overflow: hidden;
    color: #D7DAE7;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 35px;
    padding: 0 11px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: rgba(255,255,255,.025);
    color: #B3B8C9;
    font-size: 11px;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, color .2s ease;
  }

  .logout-button:hover {
    border-color: rgba(255,255,255,.17);
    background: rgba(255,255,255,.07);
    color: #fff;
  }

  /* Main layout */

  .dashboard-main {
    width: min(100% - 64px, 1120px);
    margin: 0 auto;
    padding: 59px 0 25px;
  }

  .welcome-section {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
    margin-bottom: 48px;
    animation: enterUp .55s ease both;
  }

  .welcome-copy {
    min-width: 0;
  }

  .eyebrow,
  .section-kicker {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #929CB9;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.55px;
  }

  .eyebrow {
    margin-bottom: 16px;
  }

  .eyebrow-line {
    width: 22px;
    height: 1px;
    background: #91A9FF;
  }

  .welcome-copy h1 {
    margin: 0;
    color: #F4F5FB;
    font-size: clamp(32px, 4vw, 47px);
    font-weight: 700;
    letter-spacing: -2.1px;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .welcome-copy h1 span {
    color: #9DB1FF;
  }

  .welcome-copy > p {
    margin: 13px 0 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.8;
  }

  .motivation-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: min(100%, 340px);
    padding: 16px;
    border: 1px solid rgba(145,169,255,.15);
    border-radius: 15px;
    background: linear-gradient(135deg, rgba(145,169,255,.085), rgba(255,255,255,.018));
  }

  .motivation-icon {
    display: grid;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 10px;
    background: rgba(145,169,255,.12);
    color: #A8BAFF;
  }

  .motivation-copy {
    min-width: 0;
  }

  .motivation-copy > span {
    color: #AAB9F2;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .8px;
    text-transform: uppercase;
  }

  .motivation-copy p {
    margin: 7px 0 0;
    color: #C2C7D7;
    font-size: 12px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  /* Upload and loading */

  .loading-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 230px;
    margin-bottom: 50px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: rgba(255,255,255,.02);
    color: #A5ABC0;
  }

  .loading-panel p {
    margin: 0;
    font-size: 12px;
  }

  .spinner {
    display: inline-block;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    border: 2px solid rgba(145,169,255,.2);
    border-top-color: #91A9FF;
    border-radius: 50%;
    animation: dashboardSpin .8s linear infinite;
  }

  .spinner-small {
    width: 16px;
    height: 16px;
    border-color: rgba(10,16,38,.2);
    border-top-color: #0A1026;
  }

  @keyframes dashboardSpin {
    to { transform: rotate(360deg); }
  }

  .upload-card {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.12fr) minmax(250px, .88fr);
    align-items: center;
    gap: 30px;
    min-height: 355px;
    margin-bottom: 56px;
    padding: clamp(27px, 4vw, 46px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.085);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 100% 0%, rgba(112,130,255,.12), transparent 45%),
      linear-gradient(145deg, rgba(23,27,42,.96), rgba(15,18,29,.96));
    box-shadow: 0 25px 80px rgba(0,0,0,.15);
    animation: enterUp .55s ease both;
  }

  .upload-content {
    position: relative;
    z-index: 2;
    min-width: 0;
  }

  .upload-content h2 {
    max-width: 480px;
    margin: 15px 0 12px;
    color: #F4F5FC;
    font-size: clamp(25px, 3vw, 34px);
    font-weight: 700;
    letter-spacing: -1.2px;
    line-height: 1.22;
  }

  .upload-description {
    max-width: 490px;
    margin: 0;
    color: #9CA3B8;
    font-size: 13px;
    line-height: 1.9;
  }

  .upload-benefits {
    display: flex;
    flex-wrap: wrap;
    gap: 11px 16px;
    margin: 20px 0 24px;
  }

  .upload-benefits span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #C5CAD9;
    font-size: 11px;
  }

  .upload-benefits svg {
    color: #79DDBD;
  }

  .upload-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 45px;
    padding: 0 19px;
    border: 1px solid rgba(164,181,255,.35);
    border-radius: 10px;
    background: linear-gradient(135deg, #9BAEFF, #8195F0);
    box-shadow: 0 7px 25px rgba(93,117,231,.16);
    color: #0A1026;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
  }

  .upload-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(93,117,231,.27);
  }

  .upload-button.is-loading {
    opacity: .75;
    cursor: wait;
  }

  .upload-button input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    clip-path: inset(50%);
  }

  .upload-button:focus-within {
    outline: 2px solid #B6C5FF;
    outline-offset: 4px;
  }

  .upload-hint {
    margin: 12px 0 0;
    color: #777F96;
    font-size: 10px;
  }

  /* Decorative syllabus illustration */

  .document-visual {
    position: relative;
    display: grid;
    min-height: 285px;
    min-width: 0;
    place-items: center;
    isolation: isolate;
  }

  .document-orbit {
    position: absolute;
    z-index: -1;
    width: 220px;
    height: 220px;
    border: 1px solid rgba(145,169,255,.12);
    border-radius: 50%;
  }

  .orbit-two {
    width: 295px;
    height: 295px;
    border-style: dashed;
    opacity: .65;
  }

  .document-sheet {
    width: 176px;
    max-width: 75%;
    padding: 20px 18px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 15px;
    background: linear-gradient(150deg, #242B40, #151A29);
    box-shadow: 0 25px 65px rgba(0,0,0,.35), inset 0 1px rgba(255,255,255,.06);
    transform: rotate(-5deg);
  }

  .document-symbol {
    display: grid;
    width: 42px;
    height: 42px;
    margin-bottom: 19px;
    place-items: center;
    border: 1px solid rgba(145,169,255,.2);
    border-radius: 11px;
    background: rgba(145,169,255,.1);
    color: #A8BAFF;
  }

  .document-line {
    height: 5px;
    margin-bottom: 8px;
    border-radius: 8px;
    background: rgba(255,255,255,.12);
  }

  .line-full { width: 100%; }
  .line-medium { width: 76%; }
  .line-short { width: 51%; margin-bottom: 17px; }

  .document-divider {
    height: 1px;
    margin-bottom: 13px;
    background: rgba(255,255,255,.09);
  }

  .document-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 10px 0;
  }

  .document-row span {
    width: 65%;
    height: 5px;
    border-radius: 5px;
    background: rgba(255,255,255,.12);
  }

  .document-row i {
    width: 20px;
    height: 7px;
    border-radius: 5px;
    background: #7897FF;
    opacity: .75;
  }

  .document-progress {
    height: 5px;
    margin-top: 18px;
    overflow: hidden;
    border-radius: 5px;
    background: rgba(255,255,255,.08);
  }

  .document-progress span {
    display: block;
    width: 68%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #829AFF, #B6A0FF);
  }

  .floating-label {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: calc(100% - 4px);
    padding: 10px 12px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 11px;
    background: rgba(27,32,49,.96);
    box-shadow: 0 12px 35px rgba(0,0,0,.25);
    color: #D6DAE9;
    font-size: 10px;
    white-space: nowrap;
  }

  .floating-label-top {
    top: 22px;
    right: -2px;
  }

  .floating-label-bottom {
    bottom: 20px;
    left: -4px;
    color: #B6C5FF;
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #57D6B5;
    box-shadow: 0 0 10px rgba(87,214,181,.35);
  }

  /* Section headings */

  .dashboard-section {
    margin-bottom: 53px;
    animation: enterUp .5s ease both;
  }

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 19px;
  }

  .section-kicker {
    margin-bottom: 9px;
    font-size: 9px;
    letter-spacing: 1.5px;
  }

  .section-heading h2 {
    margin: 0;
    color: #F0F2FA;
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -.7px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .overview-badge,
  .subject-count {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255,255,255,.025);
    color: #A5ABC0;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .5px;
    white-space: nowrap;
  }

  /* Statistics */

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 15px;
  }

  .stat-card {
    position: relative;
    min-width: 0;
    padding: 20px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 15px;
    background: linear-gradient(145deg, rgba(23,27,40,.88), rgba(17,20,31,.9));
    transition: transform .22s ease, border-color .22s ease, background .22s ease;
    animation: cardReveal .45s ease both;
    animation-delay: calc(var(--card-index, 0) * 65ms);
  }

  .stat-card::before {
    position: absolute;
    top: -45px;
    right: -40px;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: var(--stat-color);
    content: '';
    filter: blur(65px);
    opacity: .12;
    pointer-events: none;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,.15);
  }

  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-icon {
    display: grid;
    width: 39px;
    height: 39px;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--stat-color) 20%, transparent);
    border-radius: 11px;
    background: color-mix(in srgb, var(--stat-color) 10%, transparent);
    color: var(--stat-color);
  }

  .stat-number {
    color: #464C60;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .7px;
  }

  .stat-value {
    margin-top: 21px;
    color: #F3F5FC;
    font-size: clamp(25px, 2.5vw, 33px);
    font-weight: 700;
    letter-spacing: -1.4px;
    overflow-wrap: anywhere;
  }

  .stat-label {
    margin-top: 5px;
    color: #C9CDDB;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  .stat-detail {
    min-height: 16px;
    margin-top: 5px;
    color: #7E869D;
    font-size: 10px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .stat-progress-track {
    height: 3px;
    margin-top: 17px;
    overflow: hidden;
    border-radius: 8px;
    background: rgba(255,255,255,.07);
  }

  .stat-progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--stat-color);
    transition: width .8s ease;
  }

  /* Subjects */

  .subjects-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px;
  }

  .subject-card {
    min-width: 0;
    padding: 19px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: rgba(19,23,35,.7);
    transition: border-color .2s ease, transform .2s ease, background .2s ease;
  }

  .subject-card:hover {
    transform: translateY(-2px);
    border-color: rgba(145,169,255,.22);
    background: rgba(25,30,46,.85);
  }

  .subject-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .subject-index {
    color: #737D9B;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .8px;
  }

  .subject-status {
    padding: 5px 7px;
    border: 1px solid rgba(145,169,255,.12);
    border-radius: 6px;
    background: rgba(145,169,255,.06);
    color: #A7B7F7;
    font-size: 9px;
    white-space: nowrap;
  }

  .subject-status.completed {
    border-color: rgba(87,214,181,.18);
    background: rgba(87,214,181,.07);
    color: #76DCC0;
  }

  .subject-card h3 {
    margin: 18px 0 20px;
    color: #E7EAF5;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }

  .subject-progress-label {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 9px;
    color: #858DA4;
    font-size: 10px;
  }

  .subject-progress-label strong {
    color: #CBD1E4;
    font-weight: 600;
  }

  .subject-progress-track {
    height: 4px;
    overflow: hidden;
    border-radius: 8px;
    background: rgba(255,255,255,.07);
  }

  .subject-progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #7F9AFF, #B09BFF);
    transition: width .7s ease;
  }

  .empty-subjects {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: rgba(255,255,255,.02);
    color: #8F97AD;
  }

  .empty-subjects p {
    margin: 0;
    font-size: 12px;
  }

  /* Study tools */

  .section-subtitle {
    margin: 0;
    color: #8189A0;
    font-size: 11px;
    line-height: 1.6;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .action-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 218px;
    padding: 20px;
    border: 1px solid var(--line);
    border-radius: 15px;
    background: linear-gradient(150deg, rgba(21,25,38,.85), rgba(15,18,28,.85));
    color: inherit;
    text-decoration: none;
    transition: transform .22s ease, border-color .22s ease, background .22s ease, box-shadow .22s ease;
  }

  .action-card:hover {
    transform: translateY(-4px);
    border-color: color-mix(in srgb, var(--action-color) 30%, transparent);
    background: linear-gradient(150deg, rgba(27,32,48,.95), rgba(18,22,34,.95));
    box-shadow: 0 18px 42px rgba(0,0,0,.2);
  }

  .action-card:focus-visible,
  .dashboard-nav-link:focus-visible,
  .logout-button:focus-visible {
    outline: 2px solid #91A9FF;
    outline-offset: 4px;
  }

  .action-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .action-icon {
    display: grid;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--action-color) 20%, transparent);
    border-radius: 12px;
    background: color-mix(in srgb, var(--action-color) 10%, transparent);
    color: var(--action-color);
  }

  .action-number {
    color: #555D74;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .8px;
  }

  .action-card h3 {
    margin: 19px 0 8px;
    color: #E8EAF5;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -.2px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .action-card > p {
    margin: 0 0 19px;
    color: #9299AD;
    font-size: 11px;
    line-height: 1.75;
    overflow-wrap: anywhere;
  }

  .action-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-top: auto;
    color: var(--action-color);
    font-size: 11px;
    font-weight: 600;
  }

  .action-link svg {
    transition: transform .2s ease;
  }

  .action-card:hover .action-link svg {
    transform: translateX(4px);
  }

  /* Footer */

  .dashboard-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 0 12px;
    border-top: 1px solid rgba(255,255,255,.07);
    color: #717990;
    font-size: 10px;
  }

  .footer-brand {
    color: #D8DDEF;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: -.3px;
    text-decoration: none;
  }

  /* Animations */

  @keyframes enterUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      scroll-behavior: auto !important;
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }

  /* Laptops and tablets */

  @media (max-width: 1050px) {
    .dashboard-nav {
      gap: 18px;
      padding-right: 24px;
      padding-left: 24px;
    }

    .nav-links {
      gap: 16px;
    }

    .dashboard-main {
      width: min(100% - 48px, 1120px);
    }

    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .subjects-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .actions-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .dashboard-nav {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0 12px;
      min-height: auto;
      padding: 12px 18px 0;
    }

    .brand {
      min-height: 38px;
    }

    .nav-account {
      justify-self: end;
      gap: 8px;
    }

    .account-name {
      display: none;
    }

    .logout-button {
      min-height: 34px;
      padding: 0 9px;
    }

    .nav-links {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-start;
      gap: 22px;
      width: 100%;
      margin-top: 7px;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .nav-links::-webkit-scrollbar {
      display: none;
    }

    .dashboard-nav-link {
      min-height: 43px;
      font-size: 11px;
    }

    .dashboard-main {
      width: calc(100% - 36px);
      padding-top: 39px;
    }

    .welcome-section {
      align-items: flex-start;
      flex-direction: column;
      gap: 22px;
      margin-bottom: 35px;
    }

    .motivation-card {
      width: 100%;
      max-width: none;
    }

    .upload-card {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
      padding: 29px 24px 18px;
    }

    .upload-content h2 {
      max-width: 520px;
    }

    .document-visual {
      min-height: 255px;
      margin-top: 8px;
    }

    .floating-label-top {
      right: 2px;
    }

    .floating-label-bottom {
      left: 0;
    }

    .dashboard-section {
      margin-bottom: 42px;
    }

    .stat-card {
      padding: 18px;
    }

    .actions-grid {
      gap: 12px;
    }

    .action-card {
      min-height: 205px;
      padding: 17px;
    }
  }

  /* Small mobile screens */

  @media (max-width: 480px) {
    .dashboard-nav {
      padding-right: 14px;
      padding-left: 14px;
    }

    .brand {
      gap: 8px;
    }

    .brand-icon {
      width: 32px;
      height: 32px;
    }

    .brand-name {
      font-size: 15px;
    }

    .nav-links {
      gap: 19px;
    }

    .dashboard-main {
      width: calc(100% - 30px);
      padding-top: 31px;
    }

    .welcome-copy h1 {
      font-size: clamp(29px, 8vw, 36px);
      letter-spacing: -1.5px;
    }

    .welcome-copy > p {
      font-size: 12px;
    }

    .eyebrow {
      font-size: 9px;
      letter-spacing: 1.1px;
    }

    .motivation-card {
      padding: 13px;
    }

    .upload-card {
      padding: 24px 18px 13px;
      border-radius: 17px;
    }

    .upload-content h2 {
      font-size: 26px;
      letter-spacing: -.8px;
    }

    .upload-description {
      font-size: 12px;
    }

    .upload-benefits {
      flex-direction: column;
      gap: 10px;
    }

    .upload-button {
      width: 100%;
    }

    .document-visual {
      min-height: 235px;
    }

    .document-orbit {
      width: 180px;
      height: 180px;
    }

    .orbit-two {
      width: 235px;
      height: 235px;
    }

    .document-sheet {
      width: 160px;
      padding: 17px;
    }

    .floating-label {
      gap: 6px;
      padding: 9px 10px;
      font-size: 9px;
    }

    .section-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section-heading h2 {
      font-size: 19px;
    }

    .stats-grid,
    .subjects-grid,
    .actions-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .stat-card {
      padding: 15px 13px;
    }

    .stat-icon {
      width: 34px;
      height: 34px;
    }

    .stat-value {
      margin-top: 17px;
      font-size: 27px;
    }

    .stat-label {
      font-size: 11px;
    }

    .stat-detail {
      font-size: 9px;
    }

    .subject-card {
      padding: 14px 12px;
    }

    .subject-card-top {
      align-items: flex-start;
      flex-direction: column;
      gap: 9px;
    }

    .subject-card h3 {
      margin: 15px 0;
      font-size: 12px;
    }

    .subject-status {
      white-space: normal;
      line-height: 1.4;
    }

    .action-card {
      min-height: 208px;
      padding: 14px 12px;
    }

    .action-icon {
      width: 36px;
      height: 36px;
    }

    .action-card h3 {
      margin-top: 16px;
      font-size: 12px;
    }

    .action-card > p {
      font-size: 10px;
    }

    .action-link {
      gap: 5px;
      font-size: 10px;
    }

    .section-subtitle {
      font-size: 10px;
    }

    .dashboard-footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 20px;
    }
  }

  @media (max-width: 350px) {
    .logout-button {
      width: 34px;
      padding: 0;
    }

    .logout-button span {
      display: none;
    }

    .stats-grid,
    .subjects-grid,
    .actions-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .stat-card {
      padding: 19px;
    }

    .subject-card {
      padding: 17px;
    }

    .action-card {
      min-height: 185px;
      padding: 18px;
    }

    .subject-card-top {
      align-items: center;
      flex-direction: row;
    }
  }
`;