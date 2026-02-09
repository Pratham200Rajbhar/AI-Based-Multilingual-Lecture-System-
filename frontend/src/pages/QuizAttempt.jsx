import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiClock, HiChevronLeft, HiChevronRight, HiPaperAirplane } from 'react-icons/hi2';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizzesAPI.getById(id);
        if (res.data.attempted) { toast.error('Already attempted'); navigate(`/quizzes/${id}/results`); return; }
        setQuiz(res.data.quiz);
        setTimeLeft(res.data.quiz.timeLimit * 60);
      } catch { toast.error('Failed to load quiz'); navigate('/quizzes'); }
      finally { setLoading(false); }
    };
    fetchQuiz();
  }, [id, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const res = await quizzesAPI.submit(id, { answers: formattedAnswers });
      toast.success(`Score: ${res.data.score}`);
      navigate(`/quizzes/${id}/results`);
    } catch (error) { toast.error(error.response?.data?.message || 'Submit failed'); setSubmitting(false); }
  }, [answers, id, navigate, submitting]);

  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, timeLeft, handleSubmit]);

  const formatTime = (secs) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;
  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="card p-4 flex items-center justify-between sticky top-16 z-10">
        <div>
          <h1 className="font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500">{quiz.course?.name}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-base font-bold ${
          timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' :
          timeLeft < 300 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-700'
        }`}>
          <HiClock className="h-4 w-4" /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* Navigation */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-400">{answeredCount}/{totalQuestions} answered</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
          <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quiz.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQuestion(i)}
              className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                i === currentQuestion ? 'bg-blue-600 text-white' :
                answers[quiz.questions[i]._id] ? 'bg-green-50 text-green-600 border border-green-200' :
                'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}>{i + 1}</button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="card p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-sm text-blue-600 font-medium">Question {currentQuestion + 1} of {totalQuestions}</span>
            <span className="ml-2 badge bg-gray-100 text-gray-500 text-xs">{question.points} pt{question.points > 1 ? 's' : ''}</span>
          </div>
          <span className={`badge text-xs ${question.type === 'mcq' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
            {question.type === 'mcq' ? 'MCQ' : 'Descriptive'}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-5">{question.question}</h2>

        {question.type === 'mcq' ? (
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <label key={i} className={`flex items-center p-3.5 rounded-lg border cursor-pointer transition-all ${
                answers[question._id] === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input type="radio" name={`q-${question._id}`} value={option}
                  checked={answers[question._id] === option}
                  onChange={() => setAnswers({ ...answers, [question._id]: option })}
                  className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  answers[question._id] === option ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {answers[question._id] === option && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <span className="text-gray-700 text-sm">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea value={answers[question._id] || ''}
            onChange={(e) => setAnswers({ ...answers, [question._id]: e.target.value })}
            rows={5} className="input-field" placeholder="Type your answer..." />
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between items-center">
        <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0} className="btn-secondary">
          <HiChevronLeft className="h-4 w-4" /> Previous
        </button>
        <div className="flex gap-2">
          {currentQuestion < totalQuestions - 1 ? (
            <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="btn-primary">
              Next <HiChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => { if (window.confirm(`Submit? ${answeredCount}/${totalQuestions} answered.`)) handleSubmit(); }}
              disabled={submitting} className="btn-primary px-6">
              {submitting ? <><span className="spinner h-4 w-4"></span> Submitting...</> :
                <><HiPaperAirplane className="h-4 w-4" /> Submit</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
