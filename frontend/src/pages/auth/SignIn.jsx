import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const MOCK_CREDENTIALS = [
  { role: 'Super Admin', email: 'admin@demo.com', password: 'admin123' },
  { role: 'Professor', email: 'professor@demo.com', password: 'prof123' },
  { role: 'Student', email: 'student@demo.com', password: 'student123' }
]

const signInImage = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=670&h=590&fit=crop"

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userData = await login(formData.email, formData.password)
      toast.success('Welcome back!')
      switch (userData.role) {
        case 'student': navigate('/student/dashboard'); break
        case 'professor': navigate('/professor/dashboard'); break
        case 'dept_admin': navigate('/dept-admin/overview'); break
        case 'inst_admin': navigate('/inst-admin/overview'); break
        case 'super_admin': navigate('/super-admin/overview'); break
        default: navigate('/student/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: 'linear-gradient(113deg, rgba(212,227,249,0.95) 40%, rgb(124,166,227) 52%)',
      }}
    >
      <div className="flex w-[1440px] max-w-full min-h-screen items-center justify-center px-8">
        {/* Left image */}
        <div className="hidden lg:block w-[670px] h-[590px] rounded-[20px] overflow-hidden shrink-0 mr-8">
          <img
            src={signInImage}
            alt="Learning illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right form */}
        <div
          className="relative w-full max-w-[540px] backdrop-blur-sm rounded-[20px] p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <h1 className="text-[44px] font-extrabold text-[#111827] text-center mb-2">
            Welcome Back!
          </h1>
          <p className="text-[16px] font-bold text-[rgba(12,48,100,0.52)] text-center mb-12">
            Sign in to access your learning portal
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-[16px] text-black mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-[57px] px-4 bg-white/50 rounded-[10px] text-[16px] text-[#0c3064] placeholder-[#0c3064]/60 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[16px] text-black mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full h-[57px] px-4 bg-white/50 rounded-[10px] text-[16px] text-[#0c3064] placeholder-[#0c3064]/60 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-[#2563eb]"
                />
                <span className="text-[16px] text-black">Remember me</span>
              </label>
              <a href="#" className="text-[16px] text-[#393570] hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              className="w-full h-[52px] bg-[rgba(37,99,235,0.63)] hover:bg-[rgba(37,99,235,0.8)] rounded-[15px] text-white font-bold text-[16px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-5 h-5"></span>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

            {/* Sign up link */}
            <p className="text-center text-[16px] text-black">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#1d1b36] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-white/30">
            <h3 className="text-xs font-semibold text-[#0c3064]/70 uppercase tracking-wider mb-3">Demo Credentials</h3>
            <ul className="space-y-2">
              {MOCK_CREDENTIALS.map((account) => (
                <li key={account.role} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111827]">{account.role}</span>
                  <span className="text-[#0c3064]/60">{account.email} / {account.password}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
