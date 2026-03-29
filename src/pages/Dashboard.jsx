import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Copy, LogOut, Home, Calendar, Clock, CheckCircle, XCircle, Link, Loader } from 'lucide-react'

const platforms = [
  { id: 'twitter',    name: 'Twitter/X',  icon: '🐦', count: '7 posts' },
  { id: 'linkedin',   name: 'LinkedIn',   icon: '💼', count: '3 posts' },
  { id: 'instagram',  name: 'Instagram',  icon: '📸', count: '3 captions' },
  { id: 'facebook',   name: 'Facebook',   icon: '👥', count: '3 posts' },
  { id: 'threads',    name: 'Threads',    icon: '🧵', count: '5 posts' },
  { id: 'tiktok',     name: 'TikTok',     icon: '🎵', count: '5 hooks' },
  { id: 'youtube',    name: 'YouTube',    icon: '▶️', count: '1 description' },
  { id: 'pinterest',  name: 'Pinterest',  icon: '📌', count: '5 pins' },
  { id: 'reddit',     name: 'Reddit',     icon: '🤖', count: '1 post' },
  { id: 'whatsapp',   name: 'WhatsApp',   icon: '💬', count: '3 messages' },
  { id: 'newsletter', name: 'Newsletter', icon: '📰', count: '1 article' },
  { id: 'email',      name: 'Email',      icon: '📧', count: '1 newsletter' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const [content, setContent] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [inputMode, setInputMode] = useState('text') // 'text' or 'url'
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin', 'instagram'])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('twitter')
  const [copied, setCopied] = useState(false)

  // Scheduling state
  const [scheduleMode, setScheduleMode] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [scheduleSuccess, setScheduleSuccess] = useState(null) // platform name or 'all'
  const [scheduleError, setScheduleError] = useState('')

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError('')
    setContent('')

    try {
      const response = await fetch('/.netlify/functions/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch URL')
      setContent(data.text)
      setInputMode('text') // switch to text view so they can see what was extracted
    } catch (err) {
      setUrlError(err.message)
    } finally {
      setUrlLoading(false)
    }
  }

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleTransform = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return
    setLoading(true)
    setResults(null)
    setScheduleMode(false)
    setScheduleSuccess(null)

    try {
      const response = await fetch('/.netlify/functions/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms: selectedPlatforms }),
      })

      if (!response.ok) throw new Error('Transform failed')
      const data = await response.json()
      setResults(data.results)
      setActiveTab(selectedPlatforms[0])
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(results[activeTab] || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get tomorrow's date as the minimum schedulable date
  const minDate = () => {
    const d = new Date()
    d.setDate(d.getDate())
    return d.toISOString().split('T')[0]
  }

  const saveSchedule = async (posts) => {
    if (!user) { navigate('/login'); return false }

    const rows = posts.map(p => ({ ...p, user_id: user.id, status: 'scheduled' }))

    // Race against a 10s timeout so it never hangs forever
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timed out — check your internet and try again')), 10000)
    )
    const insert = supabase.from('scheduled_posts').insert(rows)
    const { error } = await Promise.race([insert, timeout])

    if (error) throw new Error(error.message)
    return true
  }

  const handleScheduleAll = async () => {
    if (!scheduleDate || !scheduleTime) {
      setScheduleError('Please pick a date and time.')
      return
    }
    setScheduling(true)
    setScheduleError('')
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      const posts = selectedPlatforms
        .filter(p => results[p])
        .map(p => ({ platform: p, content: results[p], scheduled_at: scheduledAt }))

      await saveSchedule(posts)
      setScheduleSuccess('all')
      setScheduleMode(false)
      setTimeout(() => setScheduleSuccess(null), 4000)
    } catch (err) {
      setScheduleError('Error: ' + err.message)
    } finally {
      setScheduling(false)
    }
  }

  const handleScheduleSingle = async () => {
    if (!scheduleDate || !scheduleTime) {
      setScheduleError('Please pick a date and time.')
      return
    }
    setScheduling(true)
    setScheduleError('')
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      await saveSchedule([{ platform: activeTab, content: results[activeTab], scheduled_at: scheduledAt }])
      setScheduleSuccess(activeTab)
      setScheduleMode(false)
      setTimeout(() => setScheduleSuccess(null), 4000)
    } catch (err) {
      setScheduleError('Error: ' + err.message)
    } finally {
      setScheduling(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">Content Multiplier</div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Transforms left</div>
              <div className="text-base font-bold text-cyan-400">
                {(profile?.transforms_limit ?? '∞') - (profile?.transforms_used || 0)} / {profile?.transforms_limit ?? '∞'}
              </div>
            </div>
            <button
              onClick={() => navigate('/scheduled')}
              className="flex items-center gap-2 border border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-slate-300 px-3 py-2 rounded-lg transition text-sm"
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">Scheduled</span>
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 border border-cyan-700 hover:border-cyan-500 text-cyan-400 px-3 py-2 rounded-lg transition text-sm font-medium"
            >
              Upgrade
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 px-3 py-2 rounded-lg transition text-sm"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button onClick={signOut} className="text-slate-400 hover:text-white transition">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Input Panel */}
          <div className="lg:col-span-1 space-y-5">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Your Content</h2>
                {/* Toggle */}
                <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                  <button
                    onClick={() => { setInputMode('text'); setUrlError('') }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${inputMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    ✏️ Paste Text
                  </button>
                  <button
                    onClick={() => { setInputMode('url'); setUrlError('') }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${inputMode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    🔗 From URL
                  </button>
                </div>
              </div>

              {inputMode === 'url' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Paste a link to any blog post, article, or webpage — we'll extract the content automatically.</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                      placeholder="https://yourblog.com/article..."
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
                    />
                    <button
                      onClick={handleFetchUrl}
                      disabled={urlLoading || !urlInput.trim()}
                      className="btn-gradient px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-40 flex items-center gap-2 flex-shrink-0"
                    >
                      {urlLoading ? <Loader size={15} className="animate-spin" /> : <Link size={15} />}
                      {urlLoading ? 'Fetching...' : 'Fetch'}
                    </button>
                  </div>
                  {urlError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
                      <XCircle size={14} /> {urlError}
                    </div>
                  )}
                  {content && (
                    <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 px-3 py-2 rounded-lg">
                      <CheckCircle size={14} /> Content extracted ({content.length} chars) — click Transform to generate posts
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your blog post, transcript, or any content here..."
                    maxLength={10000}
                    className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition"
                  />
                  <div className="text-xs text-slate-500 mt-1">{content.length} / 10,000 characters</div>
                </>
              )}
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-3">Select Platforms</h3>
              <div className="space-y-2">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`w-full text-left p-3 rounded-lg font-semibold transition flex items-center justify-between ${
                      selectedPlatforms.includes(platform.id)
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950'
                        : 'border border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span><span className="mr-2">{platform.icon}</span>{platform.name}</span>
                    <span className="text-xs opacity-70">{platform.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTransform}
              disabled={loading || !content.trim() || selectedPlatforms.length === 0}
              className="w-full btn-gradient py-4 rounded-lg font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? '✨ Generating...' : '✨ Transform Content'}
            </button>
          </div>

          {/* Right — Results Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-xl min-h-[500px]">
              {results ? (
                <>
                  {/* Success toast */}
                  {scheduleSuccess && (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4">
                      <CheckCircle size={18} />
                      {scheduleSuccess === 'all'
                        ? `All ${selectedPlatforms.length} platforms scheduled!`
                        : `${platforms.find(p => p.id === scheduleSuccess)?.name} post scheduled!`}
                    </div>
                  )}

                  {/* Platform tabs */}
                  <div className="flex gap-2 mb-5 border-b border-slate-700 flex-wrap">
                    {selectedPlatforms.map(pid => {
                      const p = platforms.find(pl => pl.id === pid)
                      return (
                        <button
                          key={pid}
                          onClick={() => { setActiveTab(pid); setScheduleMode(false); setScheduleError('') }}
                          className={`pb-3 px-1 font-bold transition text-sm ${
                            activeTab === pid
                              ? 'text-indigo-400 border-b-2 border-indigo-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {p.icon} {p.name}
                        </button>
                      )
                    })}
                  </div>

                  {/* Content for active tab */}
                  <textarea
                    value={results[activeTab] || ''}
                    readOnly
                    className="w-full h-72 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-100 focus:outline-none resize-none"
                  />

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 btn-gradient px-5 py-2 rounded-lg text-sm font-bold"
                    >
                      <Copy size={15} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={() => { setScheduleMode(!scheduleMode); setScheduleError('') }}
                      className="flex items-center gap-2 border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 px-5 py-2 rounded-lg text-sm font-bold transition"
                    >
                      <Clock size={15} />
                      Schedule This Post
                    </button>

                    <button
                      onClick={() => { setScheduleMode(!scheduleMode); setScheduleError('') }}
                      className="flex items-center gap-2 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-5 py-2 rounded-lg text-sm font-bold transition"
                    >
                      <Calendar size={15} />
                      Schedule All Platforms
                    </button>
                  </div>

                  {/* Schedule picker */}
                  {scheduleMode && (
                    <div className="mt-5 bg-slate-800/60 border border-slate-600 rounded-xl p-5 space-y-4">
                      <h4 className="font-bold text-slate-200">Pick a Date & Time</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Date</label>
                          <input
                            type="date"
                            min={minDate()}
                            value={scheduleDate}
                            onChange={e => setScheduleDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Time</label>
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={e => setScheduleTime(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>
                      </div>

                      {scheduleError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <XCircle size={15} /> {scheduleError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handleScheduleSingle}
                          disabled={scheduling}
                          className="flex-1 py-2 rounded-lg border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 font-semibold text-sm transition disabled:opacity-50"
                        >
                          {scheduling ? 'Saving...' : `Schedule ${platforms.find(p => p.id === activeTab)?.name} Only`}
                        </button>
                        <button
                          onClick={handleScheduleAll}
                          disabled={scheduling}
                          className="flex-1 py-2 rounded-lg btn-gradient font-semibold text-sm disabled:opacity-50"
                        >
                          {scheduling ? 'Saving...' : `Schedule All ${selectedPlatforms.length} Platforms`}
                        </button>
                      </div>

                      <button
                        onClick={() => navigate('/scheduled')}
                        className="text-xs text-slate-400 hover:text-slate-200 transition underline"
                      >
                        View all scheduled posts →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-center py-24">
                  <div>
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-slate-400 text-lg">Paste your content and click Transform</p>
                    <p className="text-slate-500 text-sm mt-2">Your platform-ready posts will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
