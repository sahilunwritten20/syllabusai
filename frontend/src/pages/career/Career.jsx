import { useState } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function Career() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const prompts = [
    'What careers match my IT engineering degree?',
    'How do I prepare for campus placements?',
    'What skills should I build for software development?',
    'How to crack a technical interview at a product company?',
    'What is the difference between service and product companies?',
    'How do I build a strong developer portfolio?',
  ];

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) { toast.error('Enter a question'); return; }
    setLoading(true);
    setResponse('');
    try {
      const res = await chatAPI.sendMessage(query, 'mentor');
      setResponse(res.data.message || '');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
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
          {[{to:'/dashboard',l:'Dashboard'},{to:'/chat',l:'Chat'},{to:'/learn',l:'Learn'},{to:'/exam',l:'Exam'}].map(({to,l}) => (
            <Link key={to} to={to} style={s.navLink} className="nav-link">{l}</Link>
          ))}
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}>
          <div style={s.pageHeader}>
            <h1 style={s.heading}>Career guide</h1>
            <p style={s.sub}>Your AI mentor for placements, skills, and career planning</p>
          </div>

          <div style={s.inputCard}>
            <div style={s.inputRow}>
              <input value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && ask()}
                placeholder="Ask anything about your career, placements, or skills..."
                style={s.input} className="input-focus" />
              <button onClick={() => ask()} disabled={loading} style={s.askBtn} className="ask-btn">
                {loading ? <span style={s.spinner} className="spin" /> : 'Ask'}
              </button>
            </div>
          </div>

          <div style={s.promptsSection}>
            <div style={s.promptsLabel}>Suggested questions</div>
            <div style={s.promptsGrid}>
              {prompts.map((p, i) => (
                <button key={i} onClick={() => { setQuestion(p); ask(p); }}
                  style={s.promptCard} className="prompt-card">
                  <span style={s.promptText}>{p}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div style={s.loadingCard}>
              <div style={s.loadingDots}>
                {[0,1,2].map(i => <div key={i} style={s.dot} className={`dot dot-${i}`} />)}
              </div>
              <p style={s.loadingText}>Mentor is thinking...</p>
            </div>
          )}

          {response && !loading && (
            <div style={s.responseCard} className="fade-in">
              <div style={s.responseHeader}>
                <div style={s.mentorBadge}>
                  <div style={s.mentorDot} />
                  Mentor Agent
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.responseBody}>
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
                }}>
                  {response}
                </ReactMarkdown>
              </div>
              <div style={s.responseFooter}>
                <button onClick={() => { setResponse(''); setQuestion(''); }} style={s.clearBtn} className="clear-btn">Ask another</button>
                <Link to="/chat" style={s.chatLink} className="chat-link">Continue in chat</Link>
              </div>
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
  inputCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'16px', marginBottom:24 },
  inputRow: { display:'flex', gap:10 },
  input: { flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  askBtn: { background:'#3B82F6', border:'none', borderRadius:12, padding:'12px 24px', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s', minWidth:80, display:'flex', alignItems:'center', justifyContent:'center' },
  promptsSection: { marginBottom:28 },
  promptsLabel: { fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 },
  promptsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  promptCard: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'14px 16px', cursor:'pointer', textAlign:'left', transition:'all 0.2s', width:'100%' },
  promptText: { fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.5, flex:1 },
  spinner: { display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%' },
  loadingCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'64px 0' },
  loadingDots: { display:'flex', gap:8 },
  dot: { width:8, height:8, borderRadius:'50%', background:'#F97316' },
  loadingText: { fontSize:13, color:'rgba(255,255,255,0.3)', margin:0 },
  responseCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'28px 32px' },
  responseHeader: { marginBottom:16 },
  mentorBadge: { display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:600, color:'rgba(249,115,22,0.8)', letterSpacing:'0.04em' },
  mentorDot: { width:6, height:6, borderRadius:'50%', background:'#F97316' },
  divider: { height:1, background:'rgba(255,255,255,0.07)', marginBottom:20 },
  responseBody: {},
  responseFooter: { display:'flex', gap:12, alignItems:'center', marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.07)' },
  clearBtn: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 18px', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  chatLink: { fontSize:12, color:'#60A5FA', textDecoration:'none', fontWeight:500 },
  inlineCode: { background:'rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:5, fontSize:13, color:'#93C5FD', fontFamily:'monospace' },
  codeBlock: { background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'16px 20px', overflowX:'auto', margin:'12px 0' },
  codeInner: { fontSize:13, color:'#6EE7B7', fontFamily:'monospace', lineHeight:1.6 },
  mdH1: { fontSize:20, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 10px', color:'#fff' },
  mdH2: { fontSize:17, fontWeight:700, margin:'18px 0 8px', color:'#fff' },
  mdH3: { fontSize:15, fontWeight:700, margin:'14px 0 6px', color:'#fff' },
  mdP: { fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.8, margin:'0 0 10px' },
  mdUl: { margin:'6px 0 10px', paddingLeft:20 },
  mdOl: { margin:'6px 0 10px', paddingLeft:20 },
  mdLi: { fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.7, marginBottom:5 },
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
  .ask-btn:hover { background: #2563EB !important; }
  .prompt-card:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.13) !important; }
  .clear-btn:hover { background: rgba(255,255,255,0.08) !important; }
  .chat-link:hover { text-decoration: underline !important; }
  .dot-0 { animation: bounce 1s infinite 0s; }
  .dot-1 { animation: bounce 1s infinite 0.15s; }
  .dot-2 { animation: bounce 1s infinite 0.3s; }
  @keyframes bounce { 0%,100% { transform:translateY(0); opacity:0.4; } 50% { transform:translateY(-6px); opacity:1; } }
  input::placeholder { color: rgba(255,255,255,0.2); }
`;