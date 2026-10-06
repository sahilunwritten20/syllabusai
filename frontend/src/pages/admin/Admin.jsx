import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/dashboard'); return; }
    fetchData();
  }, [user, navigate]);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#07090F', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.1)', borderTopColor:'#3B82F6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>
      <div style={s.grid} />

      <nav style={s.nav}>
        <div style={s.navLeft}>
          <Link to="/dashboard" style={s.brand}>
            <div style={s.brandIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/></svg></div>
            <span style={s.brandText}>SyllabusAI</span>
          </Link>
          <div style={s.adminBadge}>Admin</div>
        </div>
        <div style={s.navRight}>
          <span style={s.navUser}>{user?.name}</span>
          <button onClick={handleLogout} style={s.logoutBtn} className="logout-btn">Sign out</button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}>
          <div style={s.pageHeader}>
            <h1 style={s.heading}>Admin panel</h1>
            <p style={s.sub}>Platform overview and user management</p>
          </div>

          {stats && (
            <div style={s.statsGrid}>
              {[
                { label:'Total users', value: stats.totalUsers || 0 },
                { label:'Students', value: stats.totalStudents || 0 },
                { label:'Teachers', value: stats.totalTeachers || 0 },
                { label:'Syllabuses', value: stats.totalSyllabuses || 0 },
                { label:'AI messages', value: stats.totalMessages || 0 },
              ].map((stat, i) => (
                <div key={i} style={s.statCard} className="stat-card">
                  <div style={s.statValue}>{stat.value.toLocaleString()}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={s.tableSection}>
            <div style={s.tableSectionHeader}>
              <div>
                <h2 style={s.tableTitle}>Users</h2>
                <p style={s.tableSub}>{filtered.length} of {users.length} shown</p>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={s.searchInput} className="input-focus" />
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Name','Email','Role','Branch','Joined','Action'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={i} style={s.tr} className="table-row">
                      <td style={s.td}>
                        <div style={s.userCell}>
                          <div style={{ ...s.userAvatar, background: u.role === 'admin' ? 'rgba(239,68,68,0.2)' : u.role === 'teacher' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.15)' }}>
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span style={s.userName}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ ...s.td, color:'rgba(255,255,255,0.4)', fontSize:12 }}>{u.email}</td>
                      <td style={s.td}>
                        <span style={{ ...s.roleBadge,
                          background: u.role === 'admin' ? 'rgba(239,68,68,0.1)' : u.role === 'teacher' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                          color: u.role === 'admin' ? '#F87171' : u.role === 'teacher' ? '#A78BFA' : '#60A5FA',
                          borderColor: u.role === 'admin' ? 'rgba(239,68,68,0.2)' : u.role === 'teacher' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)',
                        }}>{u.role}</span>
                      </td>
                      <td style={{ ...s.td, color:'rgba(255,255,255,0.4)', fontSize:12 }}>{u.branch || '—'}</td>
                      <td style={{ ...s.td, color:'rgba(255,255,255,0.35)', fontSize:12 }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                      <td style={s.td}>
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u._id)} style={s.deleteBtn} className="delete-btn">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={s.emptyState}>No users match your search.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  root: { minHeight:'100vh', background:'#07090F', color:'#fff', fontFamily:"'Inter',-apple-system,sans-serif" },
  grid: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none', zIndex:0 },
  nav: { position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:60, background:'rgba(7,9,15,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  navLeft: { display:'flex', alignItems:'center', gap:14 },
  brand: { display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
  brandIcon: { width:32, height:32, borderRadius:9, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  brandText: { fontSize:16, fontWeight:700, color:'#fff', letterSpacing:'-0.03em' },
  adminBadge: { fontSize:11, fontWeight:600, color:'#F87171', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:100, padding:'3px 10px', letterSpacing:'0.04em' },
  navRight: { display:'flex', alignItems:'center', gap:14 },
  navUser: { fontSize:13, color:'rgba(255,255,255,0.4)' },
  logoutBtn: { background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 14px', color:'rgba(255,255,255,0.5)', fontSize:13, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  main: { position:'relative', zIndex:1 },
  container: { maxWidth:1080, margin:'0 auto', padding:'40px 32px 80px' },
  pageHeader: { marginBottom:32 },
  heading: { fontSize:28, fontWeight:800, letterSpacing:'-0.04em', margin:'0 0 6px' },
  sub: { fontSize:14, color:'rgba(255,255,255,0.4)', margin:0 },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:32 },
  statCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px 18px', transition:'all 0.2s' },
  statValue: { fontSize:26, fontWeight:800, letterSpacing:'-0.04em', marginBottom:6 },
  statLabel: { fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:500 },
  tableSection: { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden' },
  tableSectionHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  tableTitle: { fontSize:16, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 2px' },
  tableSub: { fontSize:12, color:'rgba(255,255,255,0.3)', margin:0 },
  searchInput: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 14px', color:'#fff', fontSize:13, outline:'none', fontFamily:"'Inter',sans-serif", transition:'all 0.2s', width:240 },
  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' },
  tr: { borderBottom:'1px solid rgba(255,255,255,0.04)' },
  td: { padding:'14px 16px', fontSize:13, color:'rgba(255,255,255,0.7)', verticalAlign:'middle', whiteSpace:'nowrap' },
  userCell: { display:'flex', alignItems:'center', gap:10 },
  userAvatar: { width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.8)', flexShrink:0 },
  userName: { fontWeight:600, fontSize:13 },
  roleBadge: { fontSize:11, fontWeight:600, border:'1px solid', borderRadius:100, padding:'3px 10px', letterSpacing:'0.04em' },
  deleteBtn: { background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:8, padding:'5px 12px', color:'#F87171', fontSize:12, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  emptyState: { padding:'40px', textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.25)' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; } body { margin:0; -webkit-font-smoothing:antialiased; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .logout-btn:hover { color: rgba(255,255,255,0.8) !important; border-color: rgba(255,255,255,0.2) !important; }
  .stat-card:hover { background: rgba(255,255,255,0.05) !important; }
  .table-row:hover { background: rgba(255,255,255,0.02); }
  .delete-btn:hover { background: rgba(239,68,68,0.15) !important; }
  .input-focus:focus { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
  input::placeholder { color: rgba(255,255,255,0.2); }
`;