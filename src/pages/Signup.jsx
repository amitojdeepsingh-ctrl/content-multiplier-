import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Mail, CheckCircle } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await signUp(email, password)

      // If Supabase returns a session immediately (email confirm disabled), go to onboarding
      if (data?.session) {
        navigate('/onboarding')
      } else {
        // Email confirmation required — show "check your inbox" screen
        setEmailSent(true)
      }
    } catch (err) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="glass-card rounded-xl p-10">
            <div className="inline-flex w-16 h-16 bg-indigo-500/20 rounded-full items-center justify-center mb-6">
              <Mail size={28} className="text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Check your inbox</h1>
            <p className="text-slate-400 mb-2">
              We sent a confirmation email to:
            </p>
            <p className="text-indigo-300 font-semibold mb-6">{email}</p>
            <p className="text-slate-400 text-sm mb-8">
              Click the link in the email to activate your account, then come back and log in.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="btn-gradient w-full py-3 rounded-lg font-bold inline-block"
              >
                Go to Login →
              </Link>
              <p className="text-slate-500 text-xs">
                Didn't get the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-indigo-400 hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold gradient-text mb-2">Content Multiplier</div>
          <p className="text-slate-400 text-sm">12 platforms. 36 posts. 30 seconds.</p>
        </div>

        <div className="glass-card rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create your free account</h1>
          <p className="text-slate-400 text-sm mb-6">No credit card required. Start with 4 free transforms.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <ul className="space-y-2">
              {[
                '4 free transforms every month',
                'All 12 platforms included',
                'No credit card needed',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle size={14} className="text-cyan-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-slate-500 text-sm mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
