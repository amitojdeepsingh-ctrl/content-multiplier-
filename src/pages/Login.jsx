import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold gradient-text mb-2">Content Multiplier</div>
          <p className="text-slate-400">Transform content in seconds</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-xl p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-700">
            <button
              onClick={() => setIsSignUp(false)}
              className={`pb-3 font-bold transition ${!isSignUp ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`pb-3 font-bold transition ${isSignUp ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder:text-slate-500 input-glow focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder:text-slate-500 input-glow focus:outline-none"
                required
              />
            </div>

            {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-400 hover:text-indigo-300 ml-1 font-bold"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <a href="/" className="text-slate-400 hover:text-white text-sm">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
