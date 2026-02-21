import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function StudentQuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await quizzesAPI.getById(id);
      setQuiz(res.data.data || res.data.quiz || res.data);
    } catch (err) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((_, idx) => ({
        questionIndex: idx,
        selectedOption: answers[idx] !== undefined ? answers[idx] : -1
      }));
      const res = await quizzesAPI.submit(id, { answers: formattedAnswers });
      setResult(res.data);
      setSubmitted(true);
      toast.success('Quiz submitted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit quiz';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">Quiz not found</p>
        <Link to="/student/quiz" className="text-blue-600 hover:underline mt-2 inline-block">Back to Quizzes</Link>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-surface rounded-card shadow-card border border-border p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-heading">Quiz Completed!</h1>
          <p className="text-muted mt-2">{quiz.title}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-blue-700">{result.score ?? result.data?.score ?? 0}</p>
              <p className="text-sm text-blue-600">Score</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-green-700">{result.percentage ?? result.data?.percentage ?? 0}%</p>
              <p className="text-sm text-green-600">Percentage</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/student/quiz" className="btn-primary">Back to Quizzes</Link>
          </div>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/student/quiz" className="hover:text-blue-600">Quizzes</Link>
        <span>/</span>
        <span className="text-heading">{quiz.title}</span>
      </div>

      {/* Progress */}
      <div className="bg-surface rounded-card shadow-card border border-border p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-heading">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-sm text-muted">{Object.keys(answers).length} answered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      {currentQ && (
        <div className="bg-surface rounded-card shadow-card border border-border p-6">
          <h2 className="text-lg font-semibold text-heading mb-4">{currentQ.question || currentQ.text}</h2>
          <div className="space-y-3">
            {(currentQ.options || []).map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion, idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === idx
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-border hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                {typeof option === 'string' ? option : option.text || option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 border border-border rounded-btn text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(q => q + 1)}
              className="btn-primary px-4 py-2 text-sm"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-6 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="bg-surface rounded-card shadow-card border border-border p-4">
        <p className="text-sm font-medium text-heading mb-3">Question Navigator</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                currentQuestion === idx
                  ? 'bg-blue-600 text-white'
                  : answers[idx] !== undefined
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-border'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
