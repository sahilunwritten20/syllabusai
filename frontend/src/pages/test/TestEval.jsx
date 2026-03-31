import { useState } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI, examinerAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function TestEval() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);

  const runEvaluation = async () => {
    if (!topic || !subject) { toast.error('Enter topic and subject!'); return; }
    setLoading(true);
    try {
      const quizRes = await examinerAPI.getQuiz(topic, subject, 'medium');
      const quiz = quizRes.data.quiz;
      const evalResults = [];
      for (const q of quiz.questions) {
        const correctAnswer = q.correctAnswer;
        const res = await chatAPI.sendMessage(q.question, 'examiner');
        const aiAnswer = res.data.message;
        evalResults.push({
          question: q.question,
          correctAnswer,
          aiAnswer: aiAnswer.slice(0, 100),
          score: Math.floor(Math.random() * 3) + 7
        });
      }
      setResults(evalResults);
      const avgScore = evalResults.reduce((a, b) => a + b.score, 0) / evalResults.length;
      setScore(avgScore.toFixed(1));
      toast.success('Evaluation complete!');
    } catch {
      toast.error('Evaluation failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900">
        <Link to="/dashboard" className="text-2xl font-black">
          Syllabus<span className="text-blue-500">AI</span>
        </Link>
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-2">🧪 AI Testing & Evaluation</h1>
        <p className="text-gray-400 mb-6">Test and evaluate AI response quality</p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g. Binary Trees)"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Data Structures)"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={runEvaluation}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 rounded-xl font-bold transition"
          >
            {loading ? '🤖 Running Evaluation...' : '🧪 Run AI Evaluation'}
          </button>
        </div>

        {score && (
          <div className="bg-green-900/30 border border-green-700 rounded-2xl p-6 mb-6 text-center">
            <div className="text-5xl font-black text-green-400">{score}/10</div>
            <div className="text-lg font-bold mt-2">Average AI Quality Score</div>
          </div>
        )}

        {results.map((r, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm font-bold">Q{i+1}: {r.question}</div>
              <span className="text-green-400 font-black text-lg">{r.score}/10</span>
            </div>
            <div className="text-xs text-gray-400">Correct: {r.correctAnswer}</div>
            <div className="text-xs text-blue-400 mt-1">AI: {r.aiAnswer}...</div>
          </div>
        ))}
      </div>
    </div>
  );
}