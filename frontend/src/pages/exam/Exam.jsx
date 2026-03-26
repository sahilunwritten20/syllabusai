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
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    if (!topic || !subject) {
      toast.error('Enter topic and subject!');
      return;
    }
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await examinerAPI.getQuiz(topic, subject, difficulty);
      setQuiz(res.data.quiz);
    } catch {
      toast.error('Failed to generate quiz');
    }
    setLoading(false);
  };

  const selectAnswer = (qId, answer) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Answer all questions first!');
      return;
    }
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase()) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    toast.success(`You scored ${correct}/${quiz.questions.length}! 🎯`);
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

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-2">📝 Exam Mode</h1>
        <p className="text-gray-400 mb-6">Examiner Agent generates personalized quizzes from your syllabus</p>

        {/* Quiz Generator */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g. Binary Trees)"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Data Structures)"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button
            onClick={generateQuiz}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 rounded-xl font-bold transition"
          >
            {loading ? '🤖 Generating Quiz...' : '🎯 Generate Quiz'}
          </button>
        </div>

        {/* Quiz */}
        {quiz && (
          <div>
            {/* Score Banner */}
            {submitted && (
              <div className={`rounded-2xl p-6 mb-6 text-center ${
                score >= quiz.questions.length * 0.7
                  ? 'bg-green-900/40 border border-green-700'
                  : 'bg-red-900/40 border border-red-700'
              }`}>
                <div className="text-4xl font-black mb-2">
                  {score}/{quiz.questions.length}
                </div>
                <div className="text-lg font-bold">
                  {score >= quiz.questions.length * 0.7 ? '🎉 Great job!' : '💪 Keep practicing!'}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {Math.round((score / quiz.questions.length) * 100)}% score
                </div>
              </div>
            )}

            {/* Questions */}
            {quiz.questions?.map((q, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
                <div className="text-xs text-purple-400 font-bold mb-2">Question {i + 1}</div>
                <div className="font-bold text-lg mb-4">{q.question}</div>
                <div className="space-y-2">
                  {q.options?.map((opt, j) => {
                    const letter = ['A', 'B', 'C', 'D'][j];
                    const isSelected = answers[q.id] === letter;
                    const isCorrect = submitted && letter === q.correctAnswer?.toUpperCase();
                    const isWrong = submitted && isSelected && letter !== q.correctAnswer?.toUpperCase();

                    return (
                      <button
                        key={j}
                        onClick={() => selectAnswer(q.id, letter)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-center gap-3 text-sm ${
                          isCorrect ? 'border-green-500 bg-green-900/30 text-green-300' :
                          isWrong ? 'border-red-500 bg-red-900/30 text-red-300' :
                          isSelected ? 'border-blue-500 bg-blue-900/30 text-blue-300' :
                          'border-gray-700 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {letter}
                        </span>
                        {opt}
                        {isCorrect && <span className="ml-auto">✅</span>}
                        {isWrong && <span className="ml-auto">❌</span>}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800/50 rounded-xl text-xs text-blue-300">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ))}

            {!submitted && (
              <button
                onClick={submitQuiz}
                className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold text-lg transition"
              >
                Submit Quiz 🎯
              </button>
            )}

            {submitted && (
              <button
                onClick={() => { setQuiz(null); setSubmitted(false); }}
                className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-lg transition"
              >
                Try Another Quiz →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}