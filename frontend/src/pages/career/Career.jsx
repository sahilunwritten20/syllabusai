import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI, syllabusAPI } from '../../services/api';
import toast from 'react-hot-toast';

const JOBS = [
  {
    title: 'Software Developer', company: 'TCS', match: 89,
    skills: ['DSA', 'DBMS', 'Web Dev', 'OS'],
    missing: ['OS'], salary: '₹4.5 - 6 LPA', icon: '🏢'
  },
  {
    title: 'Full Stack Developer', company: 'Startup · Remote', match: 91,
    skills: ['React', 'Node.js', 'MongoDB'],
    missing: ['Docker'], salary: '₹5 - 8 LPA', icon: '🟠'
  },
  {
    title: 'Backend Engineer', company: 'Infosys', match: 74,
    skills: ['DSA', 'DBMS'],
    missing: ['Networks', 'OS'], salary: '₹3.6 - 5 LPA', icon: '🔵'
  },
  {
    title: 'Data Analyst', company: 'Wipro', match: 68,
    skills: ['DBMS', 'Python'],
    missing: ['ML', 'Statistics'], salary: '₹4 - 6 LPA', icon: '📊'
  },
  {
    title: 'DevOps Engineer', company: 'Amazon', match: 55,
    skills: ['Networks', 'OS'],
    missing: ['Docker', 'AWS', 'CI/CD'], salary: '₹6 - 10 LPA', icon: '⚙️'
  },
  {
    title: 'Cybersecurity Analyst', company: 'Deloitte', match: 62,
    skills: ['Networks', 'OS'],
    missing: ['Security+', 'Ethical Hacking'], salary: '₹5 - 9 LPA', icon: '🛡️'
  },
];

export default function Career() {
  const [syllabus, setSyllabus] = useState(null);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      const res = await syllabusAPI.getMy();
      setSyllabus(res.data.syllabus);
    } catch {}
  };

  const getCareerAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await chatAPI.sendMessage(
        `Give me career advice for a ${syllabus?.branch || 'IT'} Semester ${syllabus?.semester || 4} student. What skills should I focus on to get a good job? Keep it concise and actionable.`,
        'mentor'
      );
      setAdvice(res.data.message);
    } catch {
      toast.error('Failed to get advice');
    }
    setLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
        <Link to="/dashboard" className="text-2xl font-black">Syllabus<span className="text-blue-500">AI</span></Link>
        <div className="flex gap-4 text-sm">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">📊 Dashboard</Link>
          <Link to="/chat" className="text-gray-400 hover:text-white">🤖 AI Chat</Link>
          <Link to="/learn" className="text-gray-400 hover:text-white">📚 Learn</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-2">💼 Career Bridge</h1>
        <p className="text-gray-400 mb-6">
          Mentor Agent found job matches based on your {syllabus?.branch || 'IT'} syllabus
        </p>

        {/* Readiness Banner */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="text-4xl">🎯</div>
          <div className="flex-1">
            <div className="font-bold text-lg">You're 68% ready for Software Engineer roles</div>
            <div className="text-gray-400 text-sm mt-1">
              Master <span className="text-blue-400">Computer Networks</span> and{' '}
              <span className="text-blue-400">OS</span> to reach 85% match
            </div>
          </div>
          <button
            onClick={getCareerAdvice}
            disabled={loadingAdvice}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            {loadingAdvice ? '🤖 Thinking...' : 'Get AI Advice 🤖'}
          </button>
        </div>

        {/* AI Advice */}
        {advice && (
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-6 mb-6">
            <div className="text-xs text-blue-400 font-bold mb-2">🎯 MENTOR AGENT ADVICE</div>
            <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {advice}
            </pre>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOBS.map((job, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-2xl p-5 cursor-pointer transition"
              onClick={() => setSelectedJob(selectedJob?.title === job.title ? null : job)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-3xl">{job.icon}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  job.match >= 80 ? 'bg-green-900/50 text-green-400' :
                  job.match >= 65 ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {job.match}% match
                </span>
              </div>
              <div className="font-bold text-lg mb-1">{job.title}</div>
              <div className="text-gray-400 text-sm mb-3">{job.company}</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.skills.map(s => (
                  <span key={s} className={`text-xs px-2 py-1 rounded-md ${
                    job.missing.includes(s)
                      ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                      : 'bg-green-900/30 text-green-400 border border-green-800/50'
                  }`}>
                    {job.missing.includes(s) ? '✗ ' : '✓ '}{s}
                  </span>
                ))}
              </div>
              <div className="text-yellow-400 font-bold text-sm">{job.salary}</div>

              {selectedJob?.title === job.title && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">Skills to develop:</div>
                  {job.missing.map(s => (
                    <div key={s} className="flex items-center gap-2 mb-1">
                      <span className="text-red-400 text-xs">✗</span>
                      <span className="text-sm text-gray-300">{s}</span>
                      <Link to="/learn" className="ml-auto text-xs text-blue-400 hover:underline">
                        Learn →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}