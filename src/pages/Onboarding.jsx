import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Check, ChevronRight, User, Building2, Target, Mic, MapPin, Flag } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

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
  { id: 'under18',  label: 'Under 18',   sub: 'Gen Z / teens' },
  { id: '18-24',    label: '18 – 24',    sub: 'Young adults' },
  { id: '25-34',    label: '25 – 34',    sub: 'Millennials' },
  { id: '35-44',    label: '35 – 44',    sub: 'Established professionals' },
  { id: '45-54',    label: '45 – 54',    sub: 'Experienced adults' },
  { id: '55+',      label: '55+',        sub: 'Seniors / retirees' },
  { id: 'all',      label: 'All ages',   sub: 'Broad audience' },
]

const locationOptions = [
  { id: 'local',        label: 'Local / City-specific' },
  { id: 'national',     label: 'National (one country)' },
  { id: 'northamerica', label: 'North America' },
  { id: 'uk_europe',    label: 'UK & Europe' },
  { id: 'asia',         label: 'Asia & Pacific' },
  { id: 'global',       label: 'Global / Worldwide' },
]

const goalOptions = [
  { id: 'awareness',   label: 'Build brand awareness',         icon: '📢' },
  { id: 'leads',       label: 'Generate leads & inquiries',    icon: '🎯' },
  { id: 'sales',       label: 'Drive product / service sales', icon: '💰' },
  { id: 'community',   label: 'Grow a community',              icon: '🤝' },
  { id: 'authority',   label: 'Establish thought leadership',  icon: '🏆' },
  { id: 'traffic',     label: 'Drive website / blog traffic',  icon: '🌐' },
  { id: 'engagement',  label: 'Increase engagement & reach',   icon: '📈' },
  { id: 'recruitment', label: 'Attract talent / partners',     icon: '🤝' },
]

const tones = [
  { id: 'professional',  label: 'Professional',    desc: 'Authoritative, business-first, polished' },
  { id: 'casual',        label: 'Casual & Warm',   desc: 'Friendly, approachable, like a real person' },
  { id: 'bold',          label: 'Bold & Direct',   desc: 'Confident, punchy, no-fluff' },
  { id: 'educational',   label: 'Educational',     desc: 'Informative, helpful, teaches something' },
  { id: 'inspirational', label: 'Inspirational',   desc: 'Motivational, story-driven, uplifting' },
  { id: 'humorous',      label: 'Humorous / Fun',  desc: 'Light, witty, entertaining' },
]

const STEPS = [
  { id: 'identity',   title: 'Who are you?',          icon: User,      desc: 'Tell us about your brand' },
  { id: 'industry',   title: 'Your industry',          icon: Building2, desc: 'What space do you operate in?' },
  { id: 'audience',   title: 'Your audience',          icon: Target,    desc: 'Who are you trying to reach?' },
  { id: 'goals',      title: 'Your goals',             icon: Flag,      desc: 'What do you want from social media?' },
  { id: 'voice',      title: 'Your voice',             icon: Mic,       desc: 'How should your content sound?' },
  { id: 'done',       title: 'All set!',               icon: Check,     desc: '' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Form state
  const [orgType, setOrgType]           = useState('') // personal | business
  const [brandName, setBrandName]       = useState('')
  const [brandDescription, setBrandDesc] = useState('')
  const [industry, setIndustry]         = useState('')
  const [selectedAges, setSelectedAges] = useState([])
  const [location, setLocation]         = useState('')
  const [goals, setGoals]               = useState([])
  const [tone, setTone]                 = useState('')
  const [customVoice, setCustomVoice]   = useState('')

  const current = STEPS[step]

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

  const canProceed = () => {
    switch (current.id) {
      case 'identity': return orgType && brandName.trim().length > 0
      case 'industry': return !!industry
      case 'audience': return selectedAges.length > 0 && location
      case 'goals':    return goals.length > 0
      case 'voice':    return !!tone
      default:         return true
    }
  }

  const handleNext = async () => {
    if (current.id === 'done') {
      setSaving(true)
      try {
        await updateProfile({
          org_type:         orgType,
          brand_name:       brandName.trim(),
          brand_description: brandDescription.trim(),
          industry,
          target_age_groups: selectedAges.join(','),
          target_location:  location,
          content_goals:    goals.join(','),
          content_tone:     tone,
          custom_voice:     customVoice.trim(),
          onboarded:        true,
        })
      } catch (err) {
        console.error('Profile save error:', err)
      } finally {
        setSaving(false)
        navigate('/dashboard')
      }
    } else {
      setStep(s => s + 1)
    }
  }

  const progressPercent = Math.round((step / (STEPS.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-xl font-bold gradient-text">Content Multiplier</div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.filter(s => s.id !== 'done').map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.id} className={`flex flex-col items-center gap-1 ${i <= step - 1 ? 'opacity-100' : i === step ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${i < step ? 'bg-indigo-500 text-white' : i === step ? 'bg-gradient-to-br from-indigo-500 to-cyan-400 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                    {i < step ? <Check size={12} /> : <Icon size={12} />}
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:block">{s.title.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">

          {/* ── Step 1: Identity ── */}
          {current.id === 'identity' && (
            <div>
              <h1 className="text-3xl font-black mb-2">Who are you?</h1>
              <p className="text-slate-400 mb-8">This helps the AI write in the right voice and context.</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { id: 'personal', label: 'Personal Brand', desc: 'You are the brand — creator, coach, freelancer', icon: '👤' },
                  { id: 'business', label: 'Business',        desc: 'A company, agency, or organisation',           icon: '🏢' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOrgType(opt.id)}
                    className={`p-5 rounded-xl text-left border-2 transition ${orgType === opt.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <div className="text-3xl mb-3">{opt.icon}</div>
                    <div className="font-bold mb-1">{opt.label}</div>
                    <div className="text-xs text-slate-400">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    {orgType === 'personal' ? 'Your name or brand name' : 'Business / Brand name'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder={orgType === 'personal' ? 'e.g. Jane Smith Coaching' : 'e.g. Acme Inc.'}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    What do you do? <span className="text-slate-500">(optional — helps the AI understand your offer)</span>
                  </label>
                  <textarea
                    value={brandDescription}
                    onChange={e => setBrandDesc(e.target.value)}
                    placeholder="e.g. We help small businesses get more clients through social media. We sell handmade candles for mindfulness..."
                    rows={3}
                    maxLength={300}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition"
                  />
                  <div className="text-xs text-slate-600 mt-1">{brandDescription.length}/300</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Industry ── */}
          {current.id === 'industry' && (
            <div>
              <h1 className="text-3xl font-black mb-2">Your industry</h1>
              <p className="text-slate-400 mb-6">The AI will use industry-specific language and references.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                {industries.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setIndustry(item.id)}
                    className={`p-4 rounded-xl text-left border-2 transition relative ${industry === item.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-sm font-semibold leading-tight">{item.label}</div>
                    {industry === item.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Audience ── */}
          {current.id === 'audience' && (
            <div>
              <h1 className="text-3xl font-black mb-2">Your audience</h1>
              <p className="text-slate-400 mb-6">Every post will speak directly to these people.</p>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <Target size={16} className="text-indigo-400" /> Age groups targeted
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ageGroups.map(ag => (
                    <button
                      key={ag.id}
                      onClick={() => toggleAge(ag.id)}
                      className={`p-3 rounded-xl text-left border-2 transition ${selectedAges.includes(ag.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                    >
                      <div className="font-bold text-sm">{ag.label}</div>
                      <div className="text-xs text-slate-400">{ag.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <MapPin size={16} className="text-indigo-400" /> Geographic focus
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {locationOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setLocation(opt.id)}
                      className={`p-3 rounded-xl text-left border-2 transition text-sm font-medium ${location === opt.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 hover:border-slate-500 text-slate-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Goals ── */}
          {current.id === 'goals' && (
            <div>
              <h1 className="text-3xl font-black mb-2">What are your goals?</h1>
              <p className="text-slate-400 mb-6">The AI will write with these outcomes in mind. Pick all that apply.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalOptions.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded-xl text-left border-2 transition flex items-center gap-3 ${goals.includes(goal.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
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
          )}

          {/* ── Step 5: Voice ── */}
          {current.id === 'voice' && (
            <div>
              <h1 className="text-3xl font-black mb-2">Your content voice</h1>
              <p className="text-slate-400 mb-6">Every post will sound like you — not like a generic AI.</p>

              <div className="space-y-3 mb-6">
                {tones.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTone(item.id)}
                    className={`w-full p-4 rounded-xl text-left border-2 flex items-center justify-between transition ${tone === item.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                  >
                    <div>
                      <div className="font-bold">{item.label}</div>
                      <div className="text-sm text-slate-400">{item.desc}</div>
                    </div>
                    {tone === item.id && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Any specific words, phrases, or style notes? <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={customVoice}
                  onChange={e => setCustomVoice(e.target.value)}
                  placeholder="e.g. Always end posts with a question. Never use buzzwords like 'leverage' or 'synergy'. Use 'clients' not 'customers'..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition"
                />
              </div>
            </div>
          )}

          {/* ── Step 6: Done ── */}
          {current.id === 'done' && (
            <div className="text-center py-4">
              <div className="text-6xl mb-6">🚀</div>
              <h1 className="text-3xl font-black mb-4">Your brand profile is ready</h1>
              <p className="text-slate-400 mb-8">Every post you generate will now be tailored specifically for:</p>

              <div className="glass-card bg-slate-900/60 rounded-xl p-6 text-left space-y-3 mb-6">
                {[
                  { label: 'Brand',     value: brandName },
                  { label: 'Type',      value: orgType === 'personal' ? 'Personal Brand' : 'Business' },
                  { label: 'Industry',  value: industries.find(i => i.id === industry)?.label },
                  { label: 'Audience',  value: selectedAges.map(a => ageGroups.find(g => g.id === a)?.label).join(', ') },
                  { label: 'Location',  value: locationOptions.find(l => l.id === location)?.label },
                  { label: 'Goals',     value: goals.map(g => goalOptions.find(o => o.id === g)?.label).join(', ') },
                  { label: 'Voice',     value: tones.find(t => t.id === tone)?.label },
                ].filter(r => r.value).map((row, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-slate-500 text-sm w-20 flex-shrink-0">{row.label}</span>
                    <span className="text-slate-200 text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-slate-500 text-sm">You can update this anytime from the Brand Profile page in your dashboard.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <div>
              {step > 0 && current.id !== 'done' && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-slate-400 hover:text-white transition text-sm"
                >
                  ← Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {current.id !== 'done' && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-slate-500 hover:text-slate-400 text-sm transition"
                >
                  Skip for now
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed() || saving}
                className="btn-gradient px-8 py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition"
              >
                {saving ? 'Saving...' : current.id === 'done' ? 'Go to Dashboard' : 'Continue'}
                {!saving && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
