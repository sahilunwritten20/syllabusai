import { useState } from 'react';
import { Link } from 'react-router-dom';
import { examinerAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Exam() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true);
    setQuiz(null); setAnswers({}); setSubmitted(false);
    try {
      const res = await examinerAPI.getQuiz(topic, subject, difficulty);
      setQuiz(res.data.quiz);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quiz');
    }
    setLoading(false);
  };

  const selectAnswer = (qIndex, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < (quiz?.questions?.length || 0)) {
      toast.error('Answer all questions first'); return;
    }
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const reset = () => { setQuiz(null); setAnswers({}); setSubmitted(false); setTopic(''); setSubject(''); };

  const pct = quiz ? Math.round((score / quiz.questions.length) * 100) : 0;

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
          {[{to:'/dashboard',l:'Dashboard'},{to:'/chat',l:'Chat'},{to:'/learn',l:'Learn'},{to:'/career',l:'Career'}].map(({to,l}) => (
            <Link key={to} to={to} style={s.navLink} className="nav-link">{l}</Link>
          ))}
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}>
          <div style={s.pageHeader}>
            <h1 style={s.heading}>Practice exam</h1>
            <p style={s.sub}>AI-generated questions from your syllabus topics</p>
          </div>

          {!quiz && !loading && (
            <div style={s.setupCard} className="fade-in">
              <div style={s.setupGrid}>
                <div style={s.field}>
                  <label style={s.label}>Topic</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Binary Trees" style={s.input} className="input-focus" onKeyDown={e => e.key === 'Enter' && generateQuiz()} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Subject (optional)</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Data Structures" style={s.input} className="input-focus" />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Difficulty</label>
                <div style={s.diffRow}>
                  {['easy','medium','hard'].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      style={{ ...s.diffBtn, ...(difficulty === d ? s.diffBtnActive : {}) }}
                      className="diff-btn">
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={generateQuiz} disabled={loading} style={s.generateBtn} className="generate-btn">
                Generate quiz
              </button>
            </div>
          )}

          {loading && (
            <div style={s.loadingCard}>
              <div style={s.loadingDots}>
                {[0,1,2].map(i => <div key={i} style={s.dot} className={`dot dot-${i}`} />)}
              </div>
              <p style={s.loadingText}>Generating questions...</p>
            </div>
          )}

          {quiz && !submitted && (
            <div className="fade-in">
              <div style={s.quizHeader}>
                <div>
                  <h2 style={s.quizTitle}>{topic}</h2>
                  <p style={s.quizMeta}>{quiz.questions?.length} questions · {difficulty}</p>
                </div>
                <div style={s.quizProgress}>
                  {Object.keys(answers).length} / {quiz.questions?.length} answered
                </div>
              </div>

              <div style={s.questionsList}>
                {quiz.questions?.map((q, i) => (
                  <div key={i} style={s.questionCard} className="fade-in">
                    <div style={s.questionNum}>Question {i + 1}</div>
                    <p style={s.questionText}>{q.question}</p>
                    <div style={s.optionsList}>
                      {q.options?.map((opt, j) => (
                        <button key={j} onClick={() => selectAnswer(i, opt)}
                          style={{ ...s.option, ...(answers[i] === opt ? s.optionSelected : {}) }}
                          className="option-btn">
                          <span style={s.optionLetter}>{String.fromCharCode(65 + j)}</span>
                          <span style={s.optionText}>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.submitRow}>
                <button onClick={reset} style={s.resetBtn} className="reset-btn">Start over</button>
                <button onClick={submitQuiz} style={s.submitBtn} className="submit-btn">
                  Submit answers
                </button>
              </div>
            </div>
          )}

          {submitted && quiz && (
            <div className="fade-in">
              <div style={{ ...s.scoreCard, background: pct >= 70 ? 'rgba(16,185,129,0.08)' : pct >= 40 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', borderColor: pct >= 70 ? 'rgba(16,185,129,0.25)' : pct >= 40 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)' }}>
                <div style={{ ...s.scorePct, color: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444' }}>{pct}%</div>
                <div style={s.scoreLabel}>{score} of {quiz.questions.length} correct</div>
                <div style={s.scoreMsg}>
                  {pct >= 80 ? 'Excellent! You have a strong grasp of this topic.' : pct >= 60 ? 'Good effort. Review the incorrect answers to strengthen your understanding.' : 'Keep practicing. Go through the explanations below.'}
                </div>
              </div>

              <div style={s.questionsList}>
                {quiz.questions?.map((q, i) => {
                  const isCorrect = answers[i] === q.correctAnswer;
                  return (
                    <div key={i} style={{ ...s.questionCard, borderColor: isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                        <div style={s.questionNum}>Question {i + 1}</div>
                        <span style={{ fontSize:12, fontWeight:600, color: isCorrect ? '#10B981' : '#EF4444' }}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p style={s.questionText}>{q.question}</p>
                      <div style={s.optionsList}>
                        {q.options?.map((opt, j) => {
                          const isSelected = answers[i] === opt;
                          const isCorrectOpt = opt === q.correctAnswer;
                          return (
                            <div key={j} style={{ ...s.option, cursor:'default',
                              background: isCorrectOpt ? 'rgba(16,185,129,0.12)' : isSelected && !isCorrect ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                              borderColor: isCorrectOpt ? 'rgba(16,185,129,0.3)' : isSelected && !isCorrect ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
                            }}>
                              <span style={s.optionLetter}>{String.fromCharCode(65 + j)}</span>
                              <span style={s.optionText}>{opt}</span>
                              {isCorrectOpt && <svg style={{marginLeft:'auto',flexShrink:0}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                              {isSelected && !isCorrectOpt && <svg style={{marginLeft:'auto',flexShrink:0}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && <p style={s.explanation}>{q.explanation}</p>}
                    </div>
                  );
                })}
              </div>

              <div style={s.submitRow}>
                <button onClick={reset} style={s.resetBtn} className="reset-btn">New quiz</button>
                <Link to="/learn" style={s.learnLink} className="learn-link">Study this topic</Link>
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
  container: { maxWidth:760, margin:'0 auto', padding:'40px 32px 80px' },
  pageHeader: { marginBottom:32 },
  heading: { fontSize:28, fontWeight:800, letterSpacing:'-0.04em', margin:'0 0 6px' },
  sub: { fontSize:14, color:'rgba(255,255,255,0.4)', margin:0 },
  setupCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'28px 24px', display:'flex', flexDirection:'column', gap:20 },
  setupGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  field: { display:'flex', flexDirection:'column', gap:8 },
  label: { fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.5)' },
  input: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 14px', color:'#fff', fontSize:13, outline:'none', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  diffRow: { display:'flex', gap:8 },
  diffBtn: { flex:1, padding:'9px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  diffBtnActive: { background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)', color:'#60A5FA' },
  generateBtn: { background:'#3B82F6', border:'none', borderRadius:12, padding:'13px', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  loadingCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'64px 0' },
  loadingDots: { display:'flex', gap:8 },
  dot: { width:8, height:8, borderRadius:'50%', background:'#3B82F6' },
  loadingText: { fontSize:13, color:'rgba(255,255,255,0.3)', margin:0 },
  quizHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 },
  quizTitle: { fontSize:22, fontWeight:800, letterSpacing:'-0.04em', margin:'0 0 4px' },
  quizMeta: { fontSize:13, color:'rgba(255,255,255,0.4)', margin:0 },
  quizProgress: { fontSize:13, color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:100, padding:'6px 16px' },
  questionsList: { display:'flex', flexDirection:'column', gap:16, marginBottom:24 },
  questionCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'24px' },
  questionNum: { fontSize:11, fontWeight:600, color:'rgba(59,130,246,0.7)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 },
  questionText: { fontSize:15, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 16px', lineHeight:1.6 },
  optionsList: { display:'flex', flexDirection:'column', gap:8 },
  option: { display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', cursor:'pointer', transition:'all 0.15s', textAlign:'left', width:'100%' },
  optionSelected: { background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)' },
  optionLetter: { width:24, height:24, borderRadius:6, background:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', flexShrink:0 },
  optionText: { fontSize:13.5, color:'rgba(255,255,255,0.75)', flex:1 },
  submitRow: { display:'flex', gap:12, justifyContent:'flex-end', alignItems:'center' },
  resetBtn: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'11px 20px', color:'rgba(255,255,255,0.5)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  submitBtn: { background:'#3B82F6', border:'none', borderRadius:12, padding:'11px 24px', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  scoreCard: { border:'1px solid', borderRadius:20, padding:'40px', textAlign:'center', marginBottom:24 },
  scorePct: { fontSize:56, fontWeight:800, letterSpacing:'-0.05em', lineHeight:1 },
  scoreLabel: { fontSize:16, fontWeight:600, margin:'8px 0 12px', color:'rgba(255,255,255,0.7)' },
  scoreMsg: { fontSize:13.5, color:'rgba(255,255,255,0.4)', maxWidth:400, margin:'0 auto', lineHeight:1.7 },
  explanation: { fontSize:13, color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'12px 14px', margin:'12px 0 0', lineHeight:1.7, borderLeft:'2px solid rgba(59,130,246,0.3)' },
  learnLink: { fontSize:13, color:'#60A5FA', textDecoration:'none', fontWeight:600, padding:'11px 20px' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; } body { margin:0; -webkit-font-smoothing:antialiased; }
  .fade-in { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  .nav-link:hover { color: rgba(255,255,255,0.9) !important; }
  .input-focus:focus { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
  .diff-btn:hover { border-color: rgba(255,255,255,0.2) !important; color: rgba(255,255,255,0.8) !important; }
  .generate-btn:hover { background: #2563EB !important; transform: translateY(-1px); }
  .option-btn:hover { background: rgba(59,130,246,0.08) !important; border-color: rgba(59,130,246,0.2) !important; }
  .submit-btn:hover { background: #2563EB !important; transform: translateY(-1px); }
  .reset-btn:hover { background: rgba(255,255,255,0.08) !important; }
  .learn-link:hover { text-decoration: underline !important; }
  .dot-0 { animation: bounce 1s infinite 0s; }
  .dot-1 { animation: bounce 1s infinite 0.15s; }
  .dot-2 { animation: bounce 1s infinite 0.3s; }
  @keyframes bounce { 0%,100% { transform:translateY(0); opacity:0.4; } 50% { transform:translateY(-6px); opacity:1; } }
  input::placeholder { color: rgba(255,255,255,0.2); }
`;