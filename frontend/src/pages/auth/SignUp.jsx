import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const signUpImage = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=670&h=640&fit=crop"

export default function SignUp() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agree, setAgree] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const userData = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      toast.success('Account created successfully!')
      switch (userData.role) {
        case 'student': navigate('/student/dashboard'); break
        case 'professor': navigate('/professor/dashboard'); break
        case 'dept_admin': navigate('/dept-admin/overview'); break
        case 'inst_admin': navigate('/inst-admin/overview'); break
        case 'super_admin': navigate('/super-admin/overview'); break
        default: navigate('/student/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
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
        <div className="hidden lg:block w-[670px] h-[640px] rounded-[20px] overflow-hidden shrink-0 mr-8">
          <img
            src={signUpImage}
            alt="Student studying"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right form */}
        <div
          className="relative w-full max-w-[540px] backdrop-blur-sm rounded-[20px] p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <h1 className="text-[40px] font-extrabold text-[#111827] text-center mb-2">
            Create Account
          </h1>
          <p className="text-[16px] font-bold text-[rgba(12,48,100,0.52)] text-center mb-8">
            Join GlobalFlow AI to start learning
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[16px] text-black mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full h-[52px] px-4 bg-white/50 rounded-[10px] text-[16px] text-[#0c3064] placeholder-[#0c3064]/60 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
              />
            </div>

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
                className="w-full h-[52px] px-4 bg-white/50 rounded-[10px] text-[16px] text-[#0c3064] placeholder-[#0c3064]/60 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-[16px] text-black mb-2">I am a</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-[52px] px-4 bg-white/50 rounded-[10px] text-[16px] text-[#0c3064] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40 appearance-none cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[16px] text-black mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full h-[52px] px-4 bg-white/50 rounded-[10px] text-[16px] text-[#0c3064] placeholder-[#0c3064]/60 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[16px] text-black mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full h-[52px] px-4 bg-white/50 rounded-[10px] text-[16px] text-[#0c3064] placeholder-[#0c3064]/60 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#2563eb]"
              />
              <span className="text-[14px] text-black">
                I agree to the{' '}
                <a href="#" className="text-[#393570] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#393570] hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Sign up button */}
            <button
              type="submit"
              className="w-full h-[52px] bg-[rgba(37,99,235,0.63)] hover:bg-[rgba(37,99,235,0.8)] rounded-[15px] text-white font-bold text-[16px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-5 h-5"></span>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>

            {/* Sign in link */}
            <p className="text-center text-[16px] text-black">
              Already have an account?{' '}
              <Link to="/signin" className="text-[#1d1b36] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
