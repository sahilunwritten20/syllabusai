import { useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function Learn() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'Binary Trees', 'Recursion', 'SQL Joins', 'Operating System scheduling',
    'Linked Lists', 'Dynamic Programming', 'REST APIs', 'Sorting algorithms',
  ];

  const learn = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true);
    setContent('');
    try {
      const res = await teacherAPI.teach(topic, subject);
      setContent(res.data.content || res.data.explanation || '');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load content');
    }
    setLoading(false);
  };

  return (
    <div style={s.root}>
      <style>{css}</style>
      <div style={s.grid} />

      <nav style={s.nav}>
        <Link to="/dashboard" style={s.brand}>
          <div style={s.brandIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round"/></svg></div>
          <span style={s.brandText}>SyllabusAI</span>
        </Link>
        <div style={s.navLinks}>
          {[{to:'/dashboard',l:'Dashboard'},{to:'/chat',l:'Chat'},{to:'/exam',l:'Exam'},{to:'/career',l:'Career'}].map(({to,l}) => (
            <Link key={to} to={to} style={s.navLink} className="nav-link">{l}</Link>
          ))}
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}>
          <div style={s.pageHeader}>
            <h1 style={s.heading}>Learn</h1>
            <p style={s.sub}>Deep explanations of any topic from your syllabus</p>
          </div>

          <div style={s.searchCard}>
            <div style={s.searchRow}>
              <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && learn()}
                placeholder="Topic — e.g. Binary Search Trees" style={s.searchInput} className="input-focus" />
              <input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Subject (optional)" style={{ ...s.searchInput, maxWidth:200 }} className="input-focus" />
              <button onClick={learn} disabled={loading} style={s.searchBtn} className="search-btn">
                {loading ? <span style={s.spinner} className="spin" /> : 'Explain'}
              </button>
            </div>
            <div style={s.suggestions}>
              {suggestions.map(s2 => (
                <button key={s2} onClick={() => { setTopic(s2); }} style={s.chip} className="chip">{s2}</button>
              ))}
            </div>
          </div>

          {loading && (
            <div style={s.loadingCard}>
              <div style={s.loadingDots}>
                {[0,1,2].map(i => <div key={i} style={s.dot} className={`dot dot-${i}`} />)}
              </div>
              <p style={s.loadingText}>Preparing explanation...</p>
            </div>
          )}

          {content && !loading && (
            <div style={s.contentCard} className="fade-in">
              <div style={s.contentHeader}>
                <h2 style={s.contentTitle}>{topic}</h2>
                {subject && <span style={s.contentBadge}>{subject}</span>}
              </div>
              <div style={s.divider} />
              <div style={s.contentBody}>
                <ReactMarkdown components={{
                  code: ({inline, children, ...p}) => inline
                    ? <code style={s.inlineCode} {...p}>{children}</code>
                    : <pre style={s.codeBlock}><code style={s.codeInner} {...p}>{children}</code></pre>,
                  h1: ({children}) => <h1 style={s.mdH1}>{children}</h1>,
                  h2: ({children}) => <h2 style={s.mdH2}>{children}</h2>,
                  h3: ({children}) => <h3 style={s.mdH3}>{children}</h3>,
                  p: ({children}) => <p style={s.mdP}>{children}</p>,
                  ul: ({children}) => <ul style={s.mdUl}>{children}</ul>,
                  ol: ({children}) => <ol style={s.mdOl}>{children}</ol>,
                  li: ({children}) => <li style={s.mdLi}>{children}</li>,
                  strong: ({children}) => <strong style={{color:'#fff',fontWeight:700}}>{children}</strong>,
                  blockquote: ({children}) => <blockquote style={s.mdBlockquote}>{children}</blockquote>,
                }}>
                  {content}
                </ReactMarkdown>
              </div>
              <div style={s.contentFooter}>
                <button onClick={() => { setTopic(''); setContent(''); }} style={s.clearBtn} className="clear-btn">New topic</button>
                <Link to="/chat" style={s.chatLink} className="chat-link">Ask a follow-up in chat</Link>
              </div>
            </div>
          )}

          {!content && !loading && (
            <div style={s.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              <p style={s.emptyText}>Enter a topic above to get a deep, clear explanation tailored to your syllabus.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const s = {
  root: { minHeight:'100vh', background:'#07090F', color:'#fff', fontFamily:"'Inter',-apple-system,sans-serif" },
  grid: { position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none', zIndex:0 },
  nav: { position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:60, background:'rgba(7,9,15,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  brand: { display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
  brandIcon: { width:32, height:32, borderRadius:9, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  brandText: { fontSize:16, fontWeight:700, color:'#fff', letterSpacing:'-0.03em' },
  navLinks: { display:'flex', gap:28 },
  navLink: { color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:13, fontWeight:500 },
  main: { position:'relative', zIndex:1 },
  container: { maxWidth:860, margin:'0 auto', padding:'40px 32px 80px' },
  pageHeader: { marginBottom:32 },
  heading: { fontSize:28, fontWeight:800, letterSpacing:'-0.04em', margin:'0 0 6px' },
  sub: { fontSize:14, color:'rgba(255,255,255,0.4)', margin:0 },
  searchCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'24px', marginBottom:24 },
  searchRow: { display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' },
  searchInput: { flex:1, minWidth:200, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 14px', color:'#fff', fontSize:13, outline:'none', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  searchBtn: { background:'#3B82F6', border:'none', borderRadius:12, padding:'11px 24px', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s', whiteSpace:'nowrap', minWidth:90, display:'flex', alignItems:'center', justifyContent:'center' },
  suggestions: { display:'flex', gap:8, flexWrap:'wrap' },
  chip: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:100, padding:'5px 14px', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  spinner: { display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%' },
  loadingCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'64px 0' },
  loadingDots: { display:'flex', gap:8 },
  dot: { width:8, height:8, borderRadius:'50%', background:'#3B82F6' },
  loadingText: { fontSize:13, color:'rgba(255,255,255,0.3)', margin:0 },
  contentCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'32px 36px' },
  contentHeader: { display:'flex', alignItems:'center', gap:14, marginBottom:20 },
  contentTitle: { fontSize:22, fontWeight:800, letterSpacing:'-0.04em', margin:0 },
  contentBadge: { fontSize:11, color:'rgba(59,130,246,0.8)', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:100, padding:'3px 12px', fontWeight:600, letterSpacing:'0.04em' },
  divider: { height:1, background:'rgba(255,255,255,0.07)', marginBottom:24 },
  contentBody: {},
  contentFooter: { display:'flex', gap:12, alignItems:'center', marginTop:28, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.07)' },
  clearBtn: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 18px', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  chatLink: { fontSize:12, color:'#60A5FA', textDecoration:'none', fontWeight:500 },
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'80px 0' },
  emptyText: { fontSize:14, color:'rgba(255,255,255,0.25)', textAlign:'center', maxWidth:380, margin:0, lineHeight:1.7 },
  inlineCode: { background:'rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:5, fontSize:13, color:'#93C5FD', fontFamily:'monospace' },
  codeBlock: { background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 20px', overflowX:'auto', margin:'12px 0' },
  codeInner: { fontSize:13, color:'#6EE7B7', fontFamily:'monospace', lineHeight:1.6 },
  mdH1: { fontSize:22, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 12px', color:'#fff' },
  mdH2: { fontSize:18, fontWeight:700, letterSpacing:'-0.02em', margin:'20px 0 10px', color:'#fff' },
  mdH3: { fontSize:15, fontWeight:700, margin:'16px 0 8px', color:'#fff' },
  mdP: { fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.8, margin:'0 0 12px' },
  mdUl: { margin:'8px 0 12px', paddingLeft:20 },
  mdOl: { margin:'8px 0 12px', paddingLeft:20 },
  mdLi: { fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.7, marginBottom:6 },
  mdBlockquote: { borderLeft:'3px solid #3B82F6', paddingLeft:16, margin:'12px 0', color:'rgba(255,255,255,0.5)', fontStyle:'italic' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; } body { margin:0; -webkit-font-smoothing:antialiased; }
  .fade-in { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .nav-link:hover { color: rgba(255,255,255,0.9) !important; }
  .input-focus:focus { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
  .search-btn:hover:not(:disabled) { background: #2563EB !important; }
  .chip:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; border-color: rgba(255,255,255,0.15) !important; }
  .clear-btn:hover { background: rgba(255,255,255,0.08) !important; }
  .chat-link:hover { text-decoration: underline !important; }
  .dot-0 { animation: bounce 1s infinite 0s; }
  .dot-1 { animation: bounce 1s infinite 0.15s; }
  .dot-2 { animation: bounce 1s infinite 0.3s; }
  @keyframes bounce { 0%,100% { transform:translateY(0); opacity:0.4; } 50% { transform:translateY(-6px); opacity:1; } }
  input::placeholder { color: rgba(255,255,255,0.2); }
`;