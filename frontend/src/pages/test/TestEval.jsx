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
    if (!topic.trim() || !subject.trim()) {
      toast.error('Enter topic and subject!');
      return;
    }

    setLoading(true);
    setResults([]);
    setScore(null);

    try {
      const quizRes = await examinerAPI.getQuiz(
        topic.trim(),
        subject.trim(),
        'medium'
      );

      const quiz = quizRes.data.quiz;

      if (!quiz?.questions?.length) {
        toast.error('No questions were generated.');
        return;
      }

      const evalResults = [];

      for (const q of quiz.questions) {
        const res = await chatAPI.sendMessage(q.question, 'examiner');
        const aiAnswer = String(res.data.message ?? '');

        evalResults.push({
          question: q.question,
          correctAnswer: q.correctAnswer,
          aiAnswer: aiAnswer.slice(0, 100),
          score: Math.floor(Math.random() * 3) + 7
        });
      }

      setResults(evalResults);

      const avgScore =
        evalResults.reduce((total, item) => total + item.score, 0) /
        evalResults.length;

      setScore(avgScore.toFixed(1));
      toast.success('Evaluation complete!');
    } catch {
      toast.error('Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-eval min-h-screen overflow-x-hidden bg-[#080B12] text-white">
      <style>{`
        .test-eval * { box-sizing: border-box; }

        .test-eval {
          min-width: 320px;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }

        .eval-nav {
          min-height: 68px;
          padding: 14px clamp(16px, 4vw, 40px);
          background: rgba(12, 17, 28, .92);
          border-bottom: 1px solid rgba(255,255,255,.07);
          backdrop-filter: blur(18px);
        }

        .eval-content {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 42px 24px 72px;
        }

        .eval-title {
          font-size: clamp(28px, 5vw, 42px);
          line-height: 1.15;
          letter-spacing: -.045em;
          overflow-wrap: anywhere;
        }

        .eval-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .eval-input {
          width: 100%;
          min-width: 0;
          min-height: 50px;
        }

        .eval-result-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .eval-question,
        .eval-answer {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: normal;
          line-height: 1.7;
        }

        .eval-score {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .eval-action {
          min-height: 50px;
          transition: background .2s, transform .2s;
        }

        .eval-action:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .test-eval a:focus-visible,
        .test-eval button:focus-visible,
        .test-eval input:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 3px;
        }

        @media (max-width: 640px) {
          .eval-nav {
            min-height: 62px;
            padding: 12px 18px;
          }

          .eval-content {
            padding: 30px 18px 48px;
          }

          .eval-fields {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .eval-panel {
            padding: 20px !important;
            border-radius: 18px !important;
          }

          .eval-result {
            padding: 18px !important;
            border-radius: 18px !important;
          }

          .eval-result-head {
            gap: 10px;
          }

          .eval-question {
            font-size: 14px;
          }

          .eval-score {
            font-size: 15px;
          }

          .eval-score-number {
            font-size: 44px;
          }

          .eval-answer-panel {
            padding: 13px !important;
          }
        }

        @media (max-width: 380px) {
          .eval-nav {
            padding-left: 14px;
            padding-right: 14px;
          }

          .eval-content {
            padding-left: 14px;
            padding-right: 14px;
          }

          .eval-panel {
            padding: 16px !important;
          }

          .eval-result {
            padding: 14px !important;
          }

          .eval-back-label {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .test-eval *,
          .test-eval *::before,
          .test-eval *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <nav className="eval-nav sticky top-0 z-20 flex items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="text-xl font-black tracking-tight sm:text-2xl"
          aria-label="SyllabusAI dashboard"
        >
          Syllabus<span className="text-blue-400">AI</span>
        </Link>

        <Link
          to="/dashboard"
          className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          <span aria-hidden="true">← </span>
          <span className="eval-back-label">Back to </span>
          Dashboard
        </Link>
      </nav>

      <main className="eval-content">
        <header className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            AI QUALITY LAB
          </div>

          <h1 className="eval-title mb-3 font-black">
            AI Testing &amp; Evaluation
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Evaluate AI responses against questions generated from your
            subject and topic.
          </p>
        </header>

        <section className="eval-panel mb-7 rounded-2xl border border-white/[0.08] bg-[#101521] p-6 shadow-xl shadow-black/10">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Configure evaluation</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Choose the topic and subject you want to evaluate.
            </p>
          </div>

          <div className="eval-fields mb-5">
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Topic
              </span>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Binary Trees"
                className="eval-input rounded-xl border border-white/10 bg-[#090D16] px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-blue-400 focus:outline-none"
                autoComplete="off"
              />
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Subject
              </span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures"
                className="eval-input rounded-xl border border-white/10 bg-[#090D16] px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-blue-400 focus:outline-none"
                autoComplete="off"
              />
            </label>
          </div>

          <button
            onClick={runEvaluation}
            disabled={loading}
            className="eval-action flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Evaluating responses...
              </>
            ) : (
              <>
                <span aria-hidden="true">✦</span>
                Run AI evaluation
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-gray-500">
            Evaluation time depends on the number of generated questions.
          </p>
        </section>

        {score !== null && (
          <section
            className="mb-7 rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 text-center"
            aria-live="polite"
          >
            <div className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">
              Evaluation summary
            </div>

            <div className="eval-score-number text-5xl font-black tracking-tight text-emerald-300">
              {score}
              <span className="text-2xl text-emerald-400/70">/10</span>
            </div>

            <div className="mt-2 font-bold text-white">
              Average AI quality score
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-400">
              Scores currently use the existing placeholder scoring logic.
            </p>
          </section>
        )}

        {results.length > 0 && (
          <section aria-labelledby="eval-results-title" aria-live="polite">
            <div className="mb-5">
              <h2 id="eval-results-title" className="text-xl font-bold">
                Question results
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {results.length}{' '}
                {results.length === 1 ? 'question' : 'questions'} evaluated
              </p>
            </div>

            <div className="space-y-4">
              {results.map((r, i) => (
                <article
                  key={`${i}-${r.question}`}
                  className="eval-result min-w-0 rounded-2xl border border-white/[0.08] bg-[#101521] p-5"
                >
                  <div className="eval-result-head mb-4">
                    <h3 className="eval-question text-sm font-bold text-gray-100">
                      <span className="mr-1 text-blue-400">Q{i + 1}.</span>
                      {r.question}
                    </h3>

                    <span className="eval-score rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-lg font-black text-emerald-300">
                      {r.score}
                      <span className="text-xs text-emerald-400/70">/10</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="eval-answer-panel rounded-xl border border-white/[0.06] bg-[#090D16] p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Expected answer
                      </div>
                      <p className="eval-answer text-sm text-gray-300">
                        {r.correctAnswer || 'No answer provided.'}
                      </p>
                    </div>

                    <div className="eval-answer-panel rounded-xl border border-blue-400/15 bg-blue-400/[0.04] p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-300">
                        AI response
                      </div>
                      <p className="eval-answer text-sm text-gray-300">
                        {r.aiAnswer}
                        {r.aiAnswer.length >= 100 ? '…' : ''}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}