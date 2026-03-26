import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Syllabus<span className="text-blue-500">AI</span></h1>
        <div className="flex gap-3">
          <Link to="/login" className="text-gray-400 hover:text-white px-4 py-2 text-sm transition">Login</Link>
          <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-bold transition">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-blue-900/30 border border-blue-800/50 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
          🚀 AI-Powered Learning Platform
        </div>
        <h1 className="text-6xl font-black leading-tight mb-6">
          Your Personal<br/>
          <span className="text-blue-500">AI Teacher</span>
        </h1>
        <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
          Upload your college syllabus and get a personalized AI teacher, exam predictor, doubt solver, and career guide — all in one place, completely free.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-lg transition">
            Start Learning Free →
          </Link>
          <Link to="/login" className="border border-gray-700 hover:bg-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition">
            Login
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: '📄', title: 'Upload Syllabus', desc: 'AI reads and understands your exact syllabus' },
            { icon: '📚', title: 'AI Teacher', desc: 'Personalized lessons for every topic' },
            { icon: '❓', title: 'Smart Quizzes', desc: 'Auto-generated quizzes from your syllabus' },
            { icon: '🐛', title: 'Code Debugger', desc: 'AI fixes and reviews your code' },
            { icon: '📈', title: 'Progress Coach', desc: 'Daily plans and motivation' },
            { icon: '💼', title: 'Career Bridge', desc: 'Match your skills to real jobs' },
          ].map((f, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold mb-1">{f.title}</div>
              <div className="text-gray-400 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}