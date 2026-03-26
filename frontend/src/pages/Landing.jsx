import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">
          Syllabus<span className="text-blue-500">AI</span>
        </h1>
        <p className="text-gray-400 text-xl mb-8">Your Personal AI Teacher</p>
        <div className="flex gap-4 justify-center">
          <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Get Started Free →
          </Link>
          <Link to="/login" className="border border-gray-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}