import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { ArrowLeft, BarChart2, Calendar, TrendingUp, Zap } from 'lucide-react'

const platformMeta = {
  twitter:    { name: 'Twitter/X',  icon: '🐦' },
  linkedin:   { name: 'LinkedIn',   icon: '💼' },
  instagram:  { name: 'Instagram',  icon: '📸' },
  facebook:   { name: 'Facebook',   icon: '👥' },
  threads:    { name: 'Threads',    icon: '🧵' },
  tiktok:     { name: 'TikTok',     icon: '🎵' },
  youtube:    { name: 'YouTube',    icon: '▶️' },
  pinterest:  { name: 'Pinterest',  icon: '📌' },
  reddit:     { name: 'Reddit',     icon: '🤖' },
  whatsapp:   { name: 'WhatsApp',   icon: '💬' },
  newsletter: { name: 'Newsletter', icon: '📰' },
  email:      { name: 'Email',      icon: '📧' },
}

function StatCard({ icon, label, value, sub, color = 'text-cyan-400' }) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-slate-400">{icon}</div>
        <div className="text-sm text-slate-400">{label}</div>
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

export default function Analytics() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [scheduledPosts, setScheduledPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)

      const { data: posts } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setScheduledPosts(posts || [])
      setLoading(false)
    }

    fetchData()
  }, [user])

  // --- Derived stats from scheduled_posts ---

  // Platform usage counts from scheduled posts
  const platformCounts = scheduledPosts.reduce((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1
    return acc
  }, {})

  const sortedPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])

  const topPlatform = sortedPlatforms[0]

  // Posts by status
  const statusCounts = scheduledPosts.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  // Posts by day (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })

  const postsByDay = scheduledPosts.reduce((acc, p) => {
    const day = p.created_at?.split('T')[0]
    if (day) acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})

  const maxDayCount = Math.max(...last14Days.map(d => postsByDay[d] || 0), 1)

  // Transforms used / limit
  const transformsUsed = profile?.transforms_used || 0
  const transformsLimit = profile?.transforms_limit ?? null
  const transformsLeft = transformsLimit != null ? transformsLimit - transformsUsed : '∞'
  const usagePercent = transformsLimit ? Math.min(100, Math.round((transformsUsed / transformsLimit) * 100)) : 0

  const planName = profile?.plan || 'free'

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className="text-xl font-bold gradient-text">Analytics</div>
          <div className="w-32" />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-24 text-slate-400">Loading your stats...</div>
        ) : (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <StatCard
                icon={<Zap size={18} />}
                label="Transforms Used"
                value={transformsUsed}
                sub={transformsLimit ? `of ${transformsLimit} this month` : 'Unlimited plan'}
                color="text-cyan-400"
              />
              <StatCard
                icon={<BarChart2 size={18} />}
                label="Transforms Left"
                value={transformsLeft}
                sub={planName.charAt(0).toUpperCase() + planName.slice(1) + ' plan'}
                color="text-indigo-400"
              />
              <StatCard
                icon={<Calendar size={18} />}
                label="Posts Scheduled"
                value={scheduledPosts.length}
                sub={`${statusCounts.sent || 0} sent · ${statusCounts.scheduled || 0} upcoming`}
                color="text-green-400"
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="Top Platform"
                value={topPlatform ? `${platformMeta[topPlatform[0]]?.icon || '📱'} ${platformMeta[topPlatform[0]]?.name || topPlatform[0]}` : '—'}
                sub={topPlatform ? `${topPlatform[1]} posts scheduled` : 'No posts yet'}
                color="text-yellow-400"
              />
            </div>

            {/* Usage bar */}
            {transformsLimit != null && (
              <div className="glass-card p-6 rounded-xl mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">Monthly Usage</h3>
                  <span className="text-sm text-slate-400">{transformsUsed} / {transformsLimit} transforms</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>0</span>
                  <span>{usagePercent}% used</span>
                  <span>{transformsLimit}</span>
                </div>
                {usagePercent >= 80 && (
                  <div className="mt-4 flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
                    <p className="text-yellow-300 text-sm">Running low on transforms this month</p>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="btn-gradient px-4 py-1.5 rounded-lg text-sm font-bold flex-shrink-0"
                    >
                      Upgrade
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Activity chart (last 14 days) */}
            <div className="glass-card p-6 rounded-xl mb-8">
              <h3 className="font-bold mb-6">Posts Created (Last 14 Days)</h3>
              <div className="flex items-end gap-1 h-28">
                {last14Days.map((day, i) => {
                  const count = postsByDay[day] || 0
                  const height = maxDayCount > 0 ? Math.max(4, Math.round((count / maxDayCount) * 100)) : 4
                  const isToday = day === new Date().toISOString().split('T')[0]
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className={`w-full rounded-t transition-all ${count > 0 ? 'bg-gradient-to-t from-indigo-600 to-cyan-400' : 'bg-slate-800'} ${isToday ? 'ring-1 ring-indigo-400' : ''}`}
                        style={{ height: `${height}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                        {count} post{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>{new Date(last14Days[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span>Today</span>
              </div>
            </div>

            {/* Platform breakdown */}
            {sortedPlatforms.length > 0 ? (
              <div className="glass-card p-6 rounded-xl mb-8">
                <h3 className="font-bold mb-6">Platform Breakdown</h3>
                <div className="space-y-4">
                  {sortedPlatforms.map(([platform, count]) => {
                    const pm = platformMeta[platform] || { name: platform, icon: '📱' }
                    const pct = Math.round((count / scheduledPosts.length) * 100)
                    return (
                      <div key={platform} className="flex items-center gap-4">
                        <div className="w-8 text-xl text-center">{pm.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{pm.name}</span>
                            <span className="text-slate-400">{count} posts ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 rounded-xl mb-8 text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-slate-400">No posts scheduled yet</p>
                <p className="text-slate-500 text-sm mt-1">Generate and schedule some content to see your analytics</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-6 btn-gradient px-8 py-3 rounded-lg font-bold inline-block"
                >
                  Start Creating →
                </button>
              </div>
            )}

            {/* Status breakdown */}
            {scheduledPosts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Scheduled', key: 'scheduled', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Ready',     key: 'ready',     color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
                  { label: 'Sent',      key: 'sent',      color: 'text-green-400',  bg: 'bg-green-500/10' },
                  { label: 'Failed',    key: 'failed',    color: 'text-red-400',    bg: 'bg-red-500/10' },
                ].map(s => (
                  <div key={s.key} className={`glass-card p-4 rounded-xl text-center ${s.bg}`}>
                    <div className={`text-2xl font-bold ${s.color}`}>{statusCounts[s.key] || 0}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
