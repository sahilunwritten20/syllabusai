import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { syllabusAPI, coachAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) return;

  // ✅ Redirect admin
  if (user.role === 'admin') {
    navigate('/admin');
    return;
  }

  // ✅ Load dashboard data for normal users
  fetchSyllabus();
  fetchMotivation();

}, [user]);

  const fetchSyllabus = async () => {
    try {
      const res = await syllabusAPI.getMy();
      setSyllabus(res.data.syllabus);
    } catch {}
    setLoading(false);
  };

  const fetchMotivation = async () => {
    try {
      const res = await coachAPI.getMotivation();
      setMotivation(res.data.message);
    } catch {}
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('syllabus', file);
      const res = await syllabusAPI.upload(formData);
      toast.success('🎯 Syllabus analyzed!');
      setSyllabus(res.data.syllabus);
    } catch (err) {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
        <h1 className="text-2xl font-black">Syllabus<span className="text-blue-500">AI</span></h1>
        <div className="flex items-center gap-4">
          <Link to="/chat" className="text-gray-400 hover:text-white transition text-sm">🤖 AI Chat</Link>
          <Link to="/learn" className="text-gray-400 hover:text-white transition text-sm">📚 Learn</Link>
          <Link to="/exam" className="text-gray-400 hover:text-white transition text-sm">📝 Exam</Link>
          <Link to="/career" className="text-gray-400 hover:text-white transition text-sm">💼 Career</Link>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-medium transition">Logout</button>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-black">Good day, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-gray-400 mt-1">Here's your learning overview</p>
        </div>

        {motivation && (
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/50 rounded-2xl p-4 mb-6 flex gap-3">
            <span className="text-2xl">🔥</span>
            <p className="text-gray-300 text-sm leading-relaxed">{motivation.slice(0, 200)}...</p>
          </div>
        )}

        {!loading && !syllabus && (
          <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center mb-6">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Upload Your Syllabus</h3>
            <p className="text-gray-400 mb-6">AI will read your syllabus and build your personalized learning path</p>
            <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold cursor-pointer transition">
              {uploading ? '🤖 AI Analyzing...' : '📤 Upload PDF'}
              <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading}/>
            </label>
          </div>
        )}

        {syllabus && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="text-gray-400 text-xs font-medium mb-1">SYLLABUS COVERED</div>
                <div className="text-3xl font-black text-blue-400">{syllabus.overallProgress || 0}%</div>
                <div className="text-green-400 text-xs mt-1">Keep going! 🚀</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="text-gray-400 text-xs font-medium mb-1">TOPICS DONE</div>
                <div className="text-3xl font-black text-cyan-400">{syllabus.completedTopics || 0}</div>
                <div className="text-gray-500 text-xs mt-1">of {syllabus.totalTopics} topics</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="text-gray-400 text-xs font-medium mb-1">SUBJECTS</div>
                <div className="text-3xl font-black text-purple-400">{syllabus.subjects?.length || 0}</div>
                <div className="text-gray-500 text-xs mt-1">{syllabus.branch}</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="text-gray-400 text-xs font-medium mb-1">STREAK</div>
                <div className="text-3xl font-black text-yellow-400">{user?.streak || 0}🔥</div>
                <div className="text-gray-500 text-xs mt-1">days</div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">📋 Syllabus Coverage — {syllabus.branch} Sem {syllabus.semester}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {syllabus.subjects?.map((subject, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4">
                    <div className="font-medium text-sm mb-2">{subject.name}</div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${subject.progress || 0}%` }}/>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{subject.progress || 0}% complete</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/chat" className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-6 text-center transition">
                <div className="text-3xl mb-2">🤖</div>
                <div className="font-bold">AI Agents</div>
                <div className="text-blue-200 text-xs mt-1">Chat with AI</div>
              </Link>
              <Link to="/learn" className="bg-purple-600 hover:bg-purple-700 rounded-2xl p-6 text-center transition">
                <div className="text-3xl mb-2">📚</div>
                <div className="font-bold">Learn</div>
                <div className="text-purple-200 text-xs mt-1">Study topics</div>
              </Link>
              <Link to="/exam" className="bg-green-600 hover:bg-green-700 rounded-2xl p-6 text-center transition">
                <div className="text-3xl mb-2">📝</div>
                <div className="font-bold">Take Quiz</div>
                <div className="text-green-200 text-xs mt-1">Test yourself</div>
              </Link>
              <Link to="/career" className="bg-yellow-600 hover:bg-yellow-700 rounded-2xl p-6 text-center transition">
                <div className="text-3xl mb-2">💼</div>
                <div className="font-bold">Career</div>
                <div className="text-yellow-200 text-xs mt-1">Job matches</div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}