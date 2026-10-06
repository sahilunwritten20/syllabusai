import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { syllabusAPI, coachAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NavLink = ({ to, label }) => (
  <Link to={to} style={navLinkStyle} className="nav-link">{label}</Link>
);

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  if (user?.role === 'admin') return null;

  const fetchSyllabus = async () => {
    try {
      const res = await syllabusAPI.getMy();
      setSyllabus(res.data.syllabus);
    } catch (err) {
      if (err.response?.status !== 404) console.log(err);
      setSyllabus(null);
    } finally { setLoading(false); }
  };

  const fetchMotivation = async () => {
    try {
      const res = await coachAPI.getMotivation();
      setMotivation(res.data.message);
    } catch {}
  };

  useEffect(() => {
    if (!user) return;
    fetchSyllabus();
    fetchMotivation();
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('syllabus', file);
      const res = await syllabusAPI.upload(formData);
      toast.success('Syllabus analyzed');
      setSyllabus(res.data.syllabus);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div style={s.root}>
      <style>{css}</style>
      <div style={s.grid} />

      {/* NAV */}
      <nav style={s.nav}>
        <Link to="/dashboard" style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.brandText}>SyllabusAI</span>
        </Link>

        <div style={s.navLinks}>
          <NavLink to="/chat" label="Chat" />
          <NavLink to="/learn" label="Learn" />
          <NavLink to="/exam" label="Exam" />
          <NavLink to="/career" label="Career" />
          <NavLink to="/settings" label="Settings" />
        </div>

        <div style={s.navRight}>
          <div style={s.avatar}>{firstName.charAt(0).toUpperCase()}</div>
          <button onClick={handleLogout} style={s.logoutBtn} className="logout-btn">Sign out</button>
        </div>
      </nav>

      {/* MAIN */}
      <main style={s.main}>
        <div style={s.container}>

          {/* Header */}
          <div style={s.pageHeader} className="slide-up">
            <div>
              <h1 style={s.greeting}>Good day, {firstName}</h1>
              <p style={s.greetingSub}>Here is your learning overview</p>
            </div>
            {motivation && (
              <div style={s.motivationPill}>
                <div style={s.motivationDot} />
                <span style={s.motivationText}>{motivation.slice(0, 80)}...</span>
              </div>
            )}
          </div>

          {/* Upload state */}
          {!loading && !syllabus && (
            <div style={s.uploadCard} className="slide-up-delay">
              <div style={s.uploadInner}>
                <div style={s.uploadIconWrap}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <h2 style={s.uploadTitle}>Upload your syllabus</h2>
                <p style={s.uploadDesc}>
                  Drop your PDF and watch AI map out your entire semester — subjects, topics, and a personalized study path.
                </p>
                <label style={s.uploadBtn} className="upload-btn">
                  {uploading ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={s.spinner} className="spin" /> Analyzing PDF...
                    </span>
                  ) : (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Choose PDF
                    </span>
                  )}
                  <input type="file" accept=".pdf" onChange={handleUpload} style={{ display:'none' }} disabled={uploading} />
                </label>
                <p style={s.uploadHint}>PDF only · Max 50 MB</p>
              </div>
            </div>
          )}

          {/* Syllabus loaded */}
          {syllabus && (
            <>
              {/* Stats */}
              <div style={s.statsGrid} className="slide-up-delay">
                {[
                  { label: 'Progress', value: `${syllabus.overallProgress || 0}%`, sub: 'of syllabus covered', color: '#3B82F6' },
                  { label: 'Topics done', value: syllabus.completedTopics || 0, sub: `of ${syllabus.totalTopics || 0} total`, color: '#06B6D4' },
                  { label: 'Subjects', value: syllabus.subjects?.length || 0, sub: syllabus.branch || 'Branch', color: '#8B5CF6' },
                  { label: 'Streak', value: `${user?.streak || 0}d`, sub: 'days active', color: '#F59E0B' },
                ].map((stat, i) => (
                  <div key={i} style={s.statCard} className="stat-card">
                    <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, letterSpacing: '-0.04em' }}>{stat.value}</div>
                    <div style={s.statLabel}>{stat.label}</div>
                    <div style={s.statSub}>{stat.sub}</div>
                    <div style={{ ...s.statBar, background: `${stat.color}15` }}>
                      <div style={{ ...s.statBarFill, background: stat.color, width: stat.label === 'Progress' ? `${syllabus.overallProgress || 0}%` : '60%' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Subjects */}
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>Syllabus — {syllabus.branch} Sem {syllabus.semester}</h2>
                  <span style={s.sectionBadge}>{syllabus.subjects?.length} subjects</span>
                </div>
                <div style={s.subjectsGrid}>
                  {syllabus.subjects?.map((subject, i) => (
                    <div key={i} style={s.subjectCard} className="subject-card">
                      <div style={s.subjectHeader}>
                        <span style={s.subjectName}>{subject.name}</span>
                        <span style={{ ...s.subjectPct, color: (subject.progress || 0) > 50 ? '#10B981' : '#94A3B8' }}>
                          {subject.progress || 0}%
                        </span>
                      </div>
                      <div style={s.progressTrack}>
                        <div style={{ ...s.progressFill, width: `${subject.progress || 0}%` }} className="progress-fill" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quick actions */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Study tools</h2>
            <div style={s.actionsGrid}>
              {[
                { to: '/chat', label: 'AI Chat', desc: 'Talk to 6 specialized agents', color: '#3B82F6' },
                { to: '/learn', label: 'Learn', desc: 'Study any topic deeply', color: '#8B5CF6' },
                { to: '/exam', label: 'Practice exam', desc: 'Test yourself with AI quizzes', color: '#10B981' },
                { to: '/career', label: 'Career guide', desc: 'Explore job paths and skills', color: '#F59E0B' },
              ].map((action, i) => (
                <Link key={i} to={action.to} style={s.actionCard} className="action-card">
                  <div style={{ ...s.actionDot, background: action.color }} />
                  <div style={s.actionLabel}>{action.label}</div>
                  <div style={s.actionDesc}>{action.desc}</div>
                  <svg style={{ marginTop: 'auto', color: 'rgba(255,255,255,0.2)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

const navLinkStyle = {
  color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
  fontSize: 13, fontWeight: 500, transition: 'color 0.2s',
  padding: '4px 0',
};

const s = {
  root: { minHeight: '100vh', background: '#07090F', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif" },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: 'rgba(7,9,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  brand: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  brandIcon: { width: 32, height: 32, borderRadius: 9, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' },
  navLinks: { display: 'flex', gap: 28, alignItems: 'center' },
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' },
  logoutBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" },
  main: { position: 'relative', zIndex: 1 },
  container: { maxWidth: 1080, margin: '0 auto', padding: '40px 32px 80px' },

  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 36 },
  greeting: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 4px' },
  greetingSub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 },
  motivationPill: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 100, padding: '8px 16px', maxWidth: 360 },
  motivationDot: { width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 },
  motivationText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 },

  uploadCard: { background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 20, marginBottom: 32 },
  uploadInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '64px 32px' },
  uploadIconWrap: { width: 64, height: 64, borderRadius: 16, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  uploadTitle: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 10px', color: '#fff' },
  uploadDesc: { fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 380, lineHeight: 1.7, margin: '0 0 28px' },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3B82F6', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 12 },
  uploadHint: { fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 },
  spinner: { display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 20px', transition: 'all 0.25s' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontWeight: 500 },
  statSub: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 },
  statBar: { height: 3, borderRadius: 99, marginTop: 16, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 99, transition: 'width 0.8s ease' },

  section: { marginBottom: 32 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#fff' },
  sectionBadge: { fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: 100, padding: '3px 10px' },

  subjectsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 },
  subjectCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', transition: 'all 0.2s' },
  subjectHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subjectName: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' },
  subjectPct: { fontSize: 12, fontWeight: 600 },
  progressTrack: { height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: 99, transition: 'width 0.8s ease' },

  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 },
  actionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 20px', textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 130, transition: 'all 0.2s' },
  actionDot: { width: 8, height: 8, borderRadius: '50%', marginBottom: 6 },
  actionLabel: { fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' },
  actionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; -webkit-font-smoothing: antialiased; }

  .slide-up { animation: slideUp 0.5s ease; }
  .slide-up-delay { animation: slideUp 0.5s ease 0.1s both; }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }

  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .nav-link:hover { color: rgba(255,255,255,0.9) !important; }
  .logout-btn:hover { color: rgba(255,255,255,0.8) !important; border-color: rgba(255,255,255,0.2) !important; }

  .stat-card:hover { background: rgba(255,255,255,0.05) !important; transform: translateY(-2px); border-color: rgba(255,255,255,0.12) !important; }
  .subject-card:hover { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.12) !important; }

  .action-card:hover { background: rgba(255,255,255,0.06) !important; transform: translateY(-3px); border-color: rgba(255,255,255,0.12) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.3); }

  .upload-btn:hover { background: #2563EB !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,130,246,0.3); }

  .progress-fill { animation: grow 1s ease 0.3s both; }
  @keyframes grow { from { width: 0 !important; } }

  @media (max-width: 768px) {
    nav { padding: 0 16px !important; }
    .container { padding: 24px 16px 60px !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .actions-grid { grid-template-columns: 1fr 1fr !important; }
    .nav-links { display: none !important; }
  }
`;