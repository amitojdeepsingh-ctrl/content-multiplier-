import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Save, Check, User, Building2, RefreshCw, AlertCircle } from 'lucide-react'

const industries = [
  { id: 'coaching',     label: 'Coaching / Consulting',  icon: '🎯' },
  { id: 'ecommerce',   label: 'E-commerce / Products',   icon: '🛒' },
  { id: 'saas',        label: 'SaaS / Tech',              icon: '💻' },
  { id: 'creator',     label: 'Content Creator',          icon: '🎬' },
  { id: 'agency',      label: 'Marketing Agency',         icon: '📣' },
  { id: 'realestate',  label: 'Real Estate',              icon: '🏠' },
  { id: 'finance',     label: 'Finance / Investing',      icon: '📈' },
  { id: 'health',      label: 'Health & Wellness',        icon: '💪' },
  { id: 'education',   label: 'Education / Courses',      icon: '📚' },
  { id: 'food',        label: 'Food & Restaurant',        icon: '🍽️' },
  { id: 'fashion',     label: 'Fashion & Beauty',         icon: '👗' },
  { id: 'travel',      label: 'Travel & Hospitality',     icon: '✈️' },
  { id: 'legal',       label: 'Legal / Professional',     icon: '⚖️' },
  { id: 'nonprofit',   label: 'Non-profit / NGO',         icon: '🤝' },
  { id: 'immigration', label: 'Immigration Services',     icon: '🌍' },
  { id: 'other',       label: 'Other',                    icon: '🌐' },
]

const ageGroups = [
  { id: 'under18', label: 'Under 18' },
  { id: '18-24',   label: '18 – 24' },
  { id: '25-34',   label: '25 – 34' },
  { id: '35-44',   label: '35 – 44' },
  { id: '45-54',   label: '45 – 54' },
  { id: '55+',     label: '55+' },
  { id: 'all',     label: 'All ages' },
]

const locationOptions = [
  { id: 'local',        label: 'Local / City-specific' },
  { id: 'national',     label: 'National' },
  { id: 'northamerica', label: 'North America' },
  { id: 'uk_europe',    label: 'UK & Europe' },
  { id: 'asia',         label: 'Asia & Pacific' },
  { id: 'global',       label: 'Global' },
]

const goalOptions = [
  { id: 'awareness',   label: 'Build brand awareness',        icon: '📢' },
  { id: 'leads',       label: 'Generate leads',               icon: '🎯' },
  { id: 'sales',       label: 'Drive sales',                  icon: '💰' },
  { id: 'community',   label: 'Grow a community',             icon: '🤝' },
  { id: 'authority',   label: 'Thought leadership',           icon: '🏆' },
  { id: 'traffic',     label: 'Drive website traffic',        icon: '🌐' },
  { id: 'engagement',  label: 'Increase engagement',          icon: '📈' },
  { id: 'recruitment', label: 'Attract talent / partners',    icon: '🤝' },
]

const tones = [
  { id: 'professional',  label: 'Professional',   desc: 'Authoritative, business-first, polished' },
  { id: 'casual',        label: 'Casual & Warm',  desc: 'Friendly, approachable, like a real person' },
  { id: 'bold',          label: 'Bold & Direct',  desc: 'Confident, punchy, no-fluff' },
  { id: 'educational',   label: 'Educational',    desc: 'Informative, helpful, teaches something' },
  { id: 'inspirational', label: 'Inspirational',  desc: 'Motivational, story-driven, uplifting' },
  { id: 'humorous',      label: 'Humorous / Fun', desc: 'Light, witty, entertaining' },
]

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-white">{children}</h3>
      {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function BrandProfile() {
  const navigate = useNavigate()
  const { profile, accessToken } = useAuth()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [saveError, setSaveError] = useState('')
  const safetyTimer = useRef(null)

  // Form fields — populated from profile on load
  const [orgType,           setOrgType]     = useState('')
  const [brandName,         setBrandName]   = useState('')
  const [brandDescription,  setBrandDesc]   = useState('')
  const [industry,          setIndustry]    = useState('')
  const [selectedAges,      setSelectedAges] = useState([])
  const [location,          setLocation]    = useState('')
  const [goals,             setGoals]       = useState([])
  const [tone,              setTone]        = useState('')
  const [customVoice,       setCustomVoice] = useState('')

  // Load saved profile
  useEffect(() => {
    if (!profile) return
    setOrgType(profile.org_type || '')
    setBrandName(profile.brand_name || '')
    setBrandDesc(profile.brand_description || '')
    setIndustry(profile.industry || '')
    setSelectedAges(profile.target_age_groups ? profile.target_age_groups.split(',').filter(Boolean) : [])
    setLocation(profile.target_location || '')
    setGoals(profile.content_goals ? profile.content_goals.split(',').filter(Boolean) : [])
    setTone(profile.content_tone || '')
    setCustomVoice(profile.custom_voice || '')
  }, [profile])

  const toggleAge = (id) => {
    if (id === 'all') { setSelectedAges(['all']); return }
    setSelectedAges(prev => {
      const without = prev.filter(a => a !== 'all')
      return without.includes(id) ? without.filter(a => a !== id) : [...without, id]
    })
  }

  const toggleGoal = (id) => {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setSaveError('')
    setSaved(false)

    // Safety net — always reset after 12s no matter what
    clearTimeout(safetyTimer.current)
    safetyTimer.current = setTimeout(() => {
      setSaving(false)
      setSaveError('Save timed out. Please try again.')
    }, 12000)

    try {
      if (!accessToken) throw new Error('Not logged in — please refresh the page')

      const payload = {
        org_type:          orgType,
        brand_name:        brandName.trim(),
        brand_description: brandDescription.trim(),
        industry,
        target_age_groups: selectedAges.join(','),
        target_location:   location,
        content_goals:     goals.join(','),
        content_tone:      tone,
        custom_voice:      customVoice.trim(),
        onboarded:         true,
      }

      const res = await fetch('/.netlify/functions/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.error || `Server error ${res.status}`)

      clearTimeout(safetyTimer.current)
      setSaving(false)
      setSaved(true)
      setTimeout(() => navigate('/dashboard'), 1500)

    } catch (err) {
      clearTimeout(safetyTimer.current)
      setSaving(false)
      setSaveError(err.message || 'Something went wrong. Please try again.')
    }
  }

  const Chip = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${active ? 'border-indigo-500 bg-indigo-500/15 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}
    >
      {active && <Check size={11} className="inline mr-1.5 text-indigo-400" />}
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className="text-xl font-bold gradient-text">Brand Profile</div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition ${saved ? 'bg-green-500/20 border border-green-500 text-green-400' : saveError ? 'bg-red-500/20 border border-red-500 text-red-400' : 'btn-gradient'} disabled:opacity-50`}
          >
            {saving ? (
              <><RefreshCw size={14} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={14} /> Saved!</>
            ) : saveError ? (
              <><AlertCircle size={14} /> Failed — try again</>
            ) : (
              <><Save size={14} /> Save Changes</>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ── Identity ── */}
        <div className="glass-card p-8 rounded-2xl">
          <SectionTitle sub="The AI will write as if it's your social media manager.">
            🏷️ Brand Identity
          </SectionTitle>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { id: 'personal', label: 'Personal Brand', desc: 'Creator, coach, freelancer', icon: <User size={20} /> },
              { id: 'business', label: 'Business',       desc: 'Company, agency, organisation', icon: <Building2 size={20} /> },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setOrgType(opt.id)}
                className={`p-5 rounded-xl text-left border-2 transition ${orgType === opt.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
              >
                <div className="text-indigo-400 mb-3">{opt.icon}</div>
                <div className="font-bold mb-1">{opt.label}</div>
                <div className="text-xs text-slate-400">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Brand / Business name</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="e.g. Jane Smith Coaching"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Industry</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">Select industry...</option>
                {industries.map(i => <option key={i.id} value={i.id}>{i.icon} {i.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-400 mb-1.5">What do you offer? <span className="text-slate-600">(short description)</span></label>
            <textarea
              value={brandDescription}
              onChange={e => setBrandDesc(e.target.value)}
              placeholder="e.g. We help small business owners attract clients through social media without spending hours on content creation..."
              rows={3}
              maxLength={400}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition"
            />
            <div className="text-xs text-slate-600 mt-1">{brandDescription.length}/400</div>
          </div>
        </div>

        {/* ── Audience ── */}
        <div className="glass-card p-8 rounded-2xl">
          <SectionTitle sub="The AI will write content that speaks directly to these people.">
            🎯 Target Audience
          </SectionTitle>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-3">Age groups</label>
            <div className="flex flex-wrap gap-2">
              {ageGroups.map(ag => (
                <Chip
                  key={ag.id}
                  label={ag.label}
                  active={selectedAges.includes(ag.id)}
                  onClick={() => toggleAge(ag.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Geographic focus</label>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map(opt => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  active={location === opt.id}
                  onClick={() => setLocation(opt.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Goals ── */}
        <div className="glass-card p-8 rounded-2xl">
          <SectionTitle sub="The AI will write with these outcomes baked in.">
            🏆 Content Goals
          </SectionTitle>
          <div className="grid sm:grid-cols-2 gap-3">
            {goalOptions.map(goal => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-4 rounded-xl text-left border-2 flex items-center gap-3 transition ${goals.includes(goal.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
              >
                <span className="text-xl">{goal.icon}</span>
                <span className="text-sm font-semibold">{goal.label}</span>
                {goals.includes(goal.id) && (
                  <div className="ml-auto w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Voice ── */}
        <div className="glass-card p-8 rounded-2xl">
          <SectionTitle sub="Every post will sound like you — not like a generic AI.">
            🎙️ Content Voice
          </SectionTitle>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {tones.map(item => (
              <button
                key={item.id}
                onClick={() => setTone(item.id)}
                className={`p-4 rounded-xl text-left border-2 transition ${tone === item.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
              >
                <div className="font-bold mb-1">{item.label}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
                {tone === item.id && (
                  <div className="mt-2">
                    <span className="text-xs text-indigo-400 font-semibold">✓ Active</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              Additional voice instructions <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={customVoice}
              onChange={e => setCustomVoice(e.target.value)}
              placeholder="e.g. Always end posts with a question. Use 'clients' not 'customers'. Avoid buzzwords like 'leverage' or 'synergy'. Include case studies when possible..."
              rows={4}
              maxLength={600}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition"
            />
            <div className="text-xs text-slate-600 mt-1">{customVoice.length}/600</div>
          </div>
        </div>

        {/* Error banner */}
        {saveError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Could not save</p>
              <p className="text-sm opacity-80 mt-0.5">{saveError}</p>
            </div>
          </div>
        )}

        {/* Save button (bottom) */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition ${saved ? 'bg-green-500/20 border border-green-500 text-green-400' : 'btn-gradient'} disabled:opacity-50`}
          >
            {saving ? (
              <><RefreshCw size={18} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={18} /> Saved! Taking you to dashboard...</>
            ) : (
              <><Save size={18} /> Save Brand Profile</>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
