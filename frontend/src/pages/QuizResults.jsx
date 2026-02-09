import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizzesAPI } from '../services/api';
import {
  HiArrowLeft, HiCheckCircle, HiXCircle, HiTrophy,
  HiAcademicCap, HiClipboardDocumentList
} from 'react-icons/hi2';

export default function QuizResults() {
  const { id } = useParams();
  const { user, canManageContent } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try { const res = await quizzesAPI.getResults(id); setQuiz(res.data.quiz); setResults(res.data.results); }
      catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  const myResult = results.find(r => r.student?._id === user?.id || r.student === user?.id);
  const isClassView = canManageContent() && results.length > 0;
  const getPct = (s, m) => m > 0 ? Math.round((s / m) * 100) : 0;
  const gradeColor = (pct) => pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="animate-fade-in max-w-4xl space-y-5">
      <Link to="/quizzes" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 text-sm">
        <HiArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      {/* Title */}
      <div className="card overflow-hidden">
        <div className="bg-blue-600 px-6 py-5 flex items-center gap-3">
          <HiClipboardDocumentList className="h-7 w-7 text-white" />
          <div>
            <h1 className="text-xl font-bold text-white">{quiz?.title}</h1>
            <p className="text-blue-200 text-sm">{quiz?.course?.name}</p>
          </div>
        </div>
      </div>

      {/* My Result */}
      {myResult && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <HiTrophy className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Your Result</h2>
          </div>

          <div className="flex items-center gap-6 mb-6 p-5 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{myResult.totalScore}</p>
              <p className="text-xs text-gray-400 mt-1">Score</p>
            </div>
            <span className="text-2xl font-bold text-gray-200">/</span>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{myResult.maxScore}</p>
              <p className="text-xs text-gray-400 mt-1">Total</p>
            </div>
            <div className="ml-auto text-center">
              <p className={`text-4xl font-bold ${gradeColor(getPct(myResult.totalScore, myResult.maxScore))}`}>
                {getPct(myResult.totalScore, myResult.maxScore)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">Percentage</p>
            </div>
          </div>

          <div className="space-y-2">
            {myResult.answers.map((answer, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Question {i + 1}</p>
                    <p className="text-sm text-gray-600 mt-0.5">Answer: <span className="font-medium">{answer.answer || 'Not answered'}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {answer.isCorrect ? <HiCheckCircle className="h-5 w-5 text-green-500" /> : <HiXCircle className="h-5 w-5 text-red-500" />}
                    <span className="text-sm font-medium text-gray-600">{answer.pointsEarned} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Submitted: {new Date(myResult.submittedAt).toLocaleString()}</p>
        </div>
      )}

      {/* Class Results */}
      {isClassView && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <HiAcademicCap className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">All Results <span className="text-sm font-normal text-gray-400">({results.length})</span></h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead><tr><th>Rank</th><th>Student</th><th>Email</th><th>Score</th><th>%</th><th>Submitted</th></tr></thead>
              <tbody>
                {results.map((r, i) => {
                  const pct = getPct(r.totalScore, r.maxScore);
                  return (
                    <tr key={r._id}>
                      <td><span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-500' :
                        i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                      }`}>{i + 1}</span></td>
                      <td className="font-medium text-gray-900">{r.student?.name || 'Unknown'}</td>
                      <td className="text-gray-400">{r.student?.email || '-'}</td>
                      <td className="font-medium">{r.totalScore}/{r.maxScore}</td>
                      <td><span className={`badge text-xs ${pct >= 70 ? 'bg-green-50 text-green-600' : pct >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>{pct}%</span></td>
                      <td className="text-gray-400">{new Date(r.submittedAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!myResult && !isClassView && (
        <div className="text-center py-12">
          <HiClipboardDocumentList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No results found</p>
          <Link to={`/quizzes/${id}/attempt`} className="text-blue-600 text-sm font-medium mt-2 inline-block">Take this quiz →</Link>
        </div>
      )}
    </div>
  );
}
