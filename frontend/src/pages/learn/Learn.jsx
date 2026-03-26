import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { syllabusAPI, teacherAPI, chatAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Learn() {
  const [syllabus, setSyllabus] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSyllabus(); }, []);

  const fetchSyllabus = async () => {
    try {
      const res = await syllabusAPI.getMy();
      setSyllabus(res.data.syllabus);
      setSelectedSubject(res.data.syllabus.subjects[0]);
    } catch {}
  };

  const learnTopic = async (topic, subject) => {
    setSelectedTopic(topic);
    setLesson('');
    setLoading(true);
    try {
      const res = await teacherAPI.teach(topic, subject);
      setLesson(res.data.explanation);
    } catch {
      toast.error('Failed to load lesson');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
        <Link to="/dashboard" className="text-2xl font-black">Syllabus<span className="text-blue-500">AI</span></Link>
        <div className="flex gap-4 text-sm">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">📊 Dashboard</Link>
          <Link to="/chat" className="text-gray-400 hover:text-white">🤖 AI Chat</Link>
          <Link to="/exam" className="text-gray-400 hover:text-white">📝 Exam</Link>
        </div>
      </nav>

      <div className="flex" style={{height:'calc(100vh - 65px)'}}>
        {/* Topics Sidebar */}
        <div className="w-72 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <div className="p-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Syllabus</div>
            {syllabus?.subjects?.map((subject, i) => (
              <div key={i} className="mb-4">
                <button
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    selectedSubject?.name === subject.name ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {subject.name}
                </button>
                {selectedSubject?.name === subject.name && subject.units?.map((unit, j) => (
                  <div key={j} className="ml-2 mt-1">
                    <div className="text-xs text-gray-600 px-2 py-1">Unit {unit.unitNumber}: {unit.title}</div>
                    {unit.topics?.map((topic, k) => (
                      <button
                        key={k}
                        onClick={() => learnTopic(topic.name || topic, subject.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                          selectedTopic === (topic.name || topic)
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span>{topic.isCompleted ? '✅' : '○'}</span>
                        {topic.name || topic}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedTopic && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-2xl font-bold mb-2">Select a Topic</h2>
              <p className="text-gray-400">Choose any topic from your syllabus to start learning</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 animate-spin">🤖</div>
              <p className="text-gray-400">Teacher Agent is preparing your lesson...</p>
            </div>
          )}

          {lesson && !loading && (
            <div>
              <div className="mb-6">
                <div className="text-xs text-gray-500 mb-1">{selectedSubject?.name}</div>
                <h1 className="text-3xl font-black mb-2">{selectedTopic}</h1>
                <div className="flex gap-3">
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full">📚 In your syllabus</span>
                  <span className="text-xs bg-green-900/50 text-green-300 px-3 py-1 rounded-full">🤖 AI Generated</span>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {lesson}
                </pre>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/exam"
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold transition text-sm"
                >
                  Take Quiz on This →
                </Link>
                <Link
                  to="/chat"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition text-sm"
                >
                  Ask AI Agent 🤖
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}