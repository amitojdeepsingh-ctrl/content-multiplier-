import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Trash2, RefreshCw } from 'lucide-react'

const platformMeta = {
  twitter:   { name: 'Twitter',   icon: '🐦', color: 'text-sky-400',    border: 'border-sky-800',    bg: 'bg-sky-900/20' },
  linkedin:  { name: 'LinkedIn',  icon: '💼', color: 'text-blue-400',   border: 'border-blue-800',   bg: 'bg-blue-900/20' },
  instagram: { name: 'Instagram', icon: '📸', color: 'text-pink-400',   border: 'border-pink-800',   bg: 'bg-pink-900/20' },
  email:     { name: 'Email',     icon: '📧', color: 'text-amber-400',  border: 'border-amber-800',  bg: 'bg-amber-900/20' },
  tiktok:    { name: 'TikTok',    icon: '🎵', color: 'text-purple-400', border: 'border-purple-800', bg: 'bg-purple-900/20' },
}

const statusMeta = {
  scheduled: { label: 'Scheduled', icon: Clock,         color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500' },
  ready:     { label: 'Ready',     icon: CheckCircle,   color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500' },
  sent:      { label: 'Sent',      icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500' },
  failed:    { label: 'Failed',    icon: AlertCircle,   color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function ScheduledPosts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchPosts = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true })

    if (!error) setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [user])

  const handleDelete = async (id) => {
    setDeleting(id)
    const { error } = await supabase.from('scheduled_posts').delete().eq('id', id)
    if (!error) setPosts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  const counts = posts.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className="text-xl font-bold gradient-text">Scheduled Posts</div>
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all',       label: 'Total',     count: posts.length,         color: 'text-white' },
            { key: 'scheduled', label: 'Upcoming',  count: counts.scheduled || 0, color: 'text-indigo-400' },
            { key: 'ready',     label: 'Ready',     count: counts.ready || 0,     color: 'text-cyan-400' },
            { key: 'sent',      label: 'Sent',      count: counts.sent || 0,      color: 'text-green-400' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`glass-card p-4 rounded-xl text-center transition border-2 ${
                filter === s.key ? 'border-indigo-500' : 'border-transparent hover:border-slate-600'
              }`}
            >
              <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'scheduled', 'ready', 'sent', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f} {f !== 'all' && counts[f] ? `(${counts[f]})` : ''}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="text-center py-24 text-slate-400">Loading your scheduled posts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-400 text-lg">No {filter !== 'all' ? filter : ''} posts yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 btn-gradient px-8 py-3 rounded-lg font-bold inline-block"
            >
              Generate & Schedule Content →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(post => {
              const pm = platformMeta[post.platform] || { name: post.platform, icon: '📱', color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-800/30' }
              const sm = statusMeta[post.status] || statusMeta.scheduled
              const StatusIcon = sm.icon
              const isExpanded = expandedId === post.id

              return (
                <div
                  key={post.id}
                  className={`rounded-xl border p-5 transition ${pm.bg} ${pm.border}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{pm.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold ${pm.color}`}>{pm.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${sm.bg} ${sm.color}`}>
                            <StatusIcon size={11} />
                            {sm.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(post.scheduled_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : post.id)}
                        className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition"
                      >
                        {isExpanded ? 'Hide' : 'Preview'}
                      </button>
                      {post.status === 'scheduled' && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          className="text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 p-1.5 rounded-lg transition disabled:opacity-50"
                          title="Cancel scheduled post"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 bg-slate-900/60 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap border border-slate-700 max-h-60 overflow-y-auto">
                      {post.content}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
