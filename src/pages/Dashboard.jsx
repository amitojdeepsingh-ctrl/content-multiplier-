import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Copy, LogOut, Home } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin', 'email'])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('twitter')
  const [copied, setCopied] = useState(false)

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '🐦', count: '7 posts' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', count: '5 posts' },
    { id: 'instagram', name: 'Instagram', icon: '📸', count: '3 posts' },
    { id: 'email', name: 'Email', icon: '📧', count: '1 newsletter' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', count: '5 hooks' },
  ]

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleTransform = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) return

    setLoading(true)
    try {
      const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();

const response = await fetch('/.netlify/functions/transform', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          brandVoice: null,
        }),
      })

      if (!response.ok) {
        throw new Error('Transform failed')
      }

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
    const text = results[activeTab] || ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">Content Multiplier</div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-slate-400">Transforms remaining</div>
              <div className="text-lg font-bold text-cyan-400">
                {profile?.transforms_limit - (profile?.transforms_used || 0)} / {profile?.transforms_limit}
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white flex items-center gap-2 border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-lg transition"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 border border-cyan-700 hover:border-cyan-500 px-3 py-2 rounded-lg transition text-sm font-medium"
            >
              Upgrade
            </button>
            <button
              onClick={signOut}
              className="text-slate-300 hover:text-white flex items-center gap-2"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Content Input */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-lg font-bold mb-4">Your Content</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your blog post, transcript, or any content here..."
                maxLength={10000}
                className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder:text-slate-500 input-glow focus:outline-none resize-none"
              />
              <div className="text-xs text-slate-400 mt-2">
                {content.length} / 10,000 characters
              </div>
            </div>

            {/* Platform Selector */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-4">Select Platforms</h3>
              <div className="space-y-2">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`w-full text-left p-3 rounded-lg font-bold transition ${
                      selectedPlatforms.includes(platform.id)
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950'
                        : 'border border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-lg">{platform.icon}</span> {platform.name}
                    <span className="text-xs float-right">{platform.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Transform Button */}
            <button
              onClick={handleTransform}
              disabled={loading || !content.trim() || selectedPlatforms.length === 0}
              className="w-full btn-gradient py-4 rounded-lg font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Generating...' : '✨ Transform Content'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-xl">
              {results ? (
                <>
                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-slate-700 flex-wrap">
                    {selectedPlatforms.map(platform => {
                      const p = platforms.find(pl => pl.id === platform)
                      return (
                        <button
                          key={platform}
                          onClick={() => setActiveTab(platform)}
                          className={`pb-3 font-bold transition ${
                            activeTab === platform
                              ? 'text-indigo-400 border-b-2 border-indigo-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {p.icon} {p.name}
                        </button>
                      )
                    })}
                  </div>

                  {/* Content */}
                  <div>
                    <textarea
                      value={results[activeTab] || ''}
                      readOnly
                      className="w-full h-96 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-100 focus:outline-none resize-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="mt-4 flex items-center gap-2 btn-gradient px-6 py-2 rounded-lg text-sm font-bold"
                    >
                      <Copy size={16} />
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-96 flex items-center justify-center text-center">
                  <div>
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-slate-400">Paste your content and click Transform to see the magic happen</p>
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
