import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to EduPlatform</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your credentials to continue</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required className="input-field" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="input-field pr-10" placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><span className="spinner h-4 w-4"></span> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">Create one</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 card p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Demo Accounts</p>
          <div className="space-y-1">
            {[
              { label: 'Admin', email: 'admin@demo.com', pw: 'admin123' },
              { label: 'Professor', email: 'professor@demo.com', pw: 'prof123' },
              { label: 'Student', email: 'student@demo.com', pw: 'student123' },
            ].map((demo) => (
              <button key={demo.label} type="button"
                onClick={() => { setEmail(demo.email); setPassword(demo.pw); }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-gray-50 text-xs text-gray-600 flex justify-between">
                <span><span className="font-medium text-gray-700">{demo.label}:</span> {demo.email}</span>
                <span className="text-gray-400">Use →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
