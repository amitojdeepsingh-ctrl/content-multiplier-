import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Check } from 'lucide-react'

const industries = [
  { id: 'coaching',    label: 'Coaching / Consulting',  icon: '🎯' },
  { id: 'ecommerce',  label: 'E-commerce / Products',   icon: '🛒' },
  { id: 'saas',       label: 'SaaS / Tech',              icon: '💻' },
  { id: 'creator',    label: 'Content Creator',          icon: '🎬' },
  { id: 'agency',     label: 'Marketing Agency',         icon: '📣' },
  { id: 'realestate', label: 'Real Estate',              icon: '🏠' },
  { id: 'finance',    label: 'Finance / Investing',      icon: '📈' },
  { id: 'health',     label: 'Health / Wellness',        icon: '💪' },
  { id: 'education',  label: 'Education / Courses',      icon: '📚' },
  { id: 'other',      label: 'Other',                    icon: '🌐' },
]

const tones = [
  { id: 'professional', label: 'Professional',   desc: 'Formal, authoritative, business-focused' },
  { id: 'casual',       label: 'Casual',         desc: 'Friendly, conversational, approachable' },
  { id: 'bold',         label: 'Bold & Direct',  desc: 'Confident, punchy, no fluff' },
  { id: 'educational',  label: 'Educational',    desc: 'Informative, helpful, teaches something' },
  { id: 'inspirational',label: 'Inspirational',  desc: 'Motivational, uplifting, story-driven' },
]

const STEPS = ['industry', 'tone', 'done']

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()

  const [step, setStep] = useState(0)
  const [industry, setIndustry] = useState('')
  const [tone, setTone] = useState('')
  const [saving, setSaving] = useState(false)

  const currentStep = STEPS[step]

  const handleNext = async () => {
    if (currentStep === 'done') {
      setSaving(true)
      try {
        await updateProfile({
          industry,
          content_tone: tone,
          onboarded: true,
        })
        navigate('/dashboard')
      } catch (err) {
        console.error('Onboarding save error:', err)
        navigate('/dashboard') // proceed anyway
      } finally {
        setSaving(false)
      }
    } else {
      setStep(s => s + 1)
    }
  }

  const canProceed =
    (currentStep === 'industry' && industry) ||
    (currentStep === 'tone' && tone) ||
    currentStep === 'done'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.filter(s => s !== 'done').map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-slate-800'}`}
            />
          ))}
        </div>

        {/* Step: Industry */}
        {currentStep === 'industry' && (
          <div>
            <div className="text-center mb-8">
              <div className="text-2xl font-bold gradient-text mb-2">Content Multiplier</div>
              <h1 className="text-3xl font-black mb-2">What's your industry?</h1>
              <p className="text-slate-400">We'll tailor the AI output to fit your niche.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {industries.map(item => (
                <button
                  key={item.id}
                  onClick={() => setIndustry(item.id)}
                  className={`p-4 rounded-xl text-left transition border-2 ${
                    industry === item.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 glass-card hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  {industry === item.id && (
                    <div className="absolute top-2 right-2">
                      <Check size={14} className="text-indigo-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Tone */}
        {currentStep === 'tone' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2">What's your content style?</h1>
              <p className="text-slate-400">The AI will match this tone in every post it generates for you.</p>
            </div>
            <div className="space-y-3">
              {tones.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTone(item.id)}
                  className={`w-full p-5 rounded-xl text-left transition border-2 flex items-center justify-between ${
                    tone === item.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 glass-card hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="font-bold mb-0.5">{item.label}</div>
                    <div className="text-sm text-slate-400">{item.desc}</div>
                  </div>
                  {tone === item.id && (
                    <Check size={18} className="text-indigo-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Done */}
        {currentStep === 'done' && (
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-black mb-4">You're all set!</h1>
            <p className="text-slate-400 mb-4">
              Your account is configured for{' '}
              <span className="text-indigo-300 font-semibold">
                {industries.find(i => i.id === industry)?.label}
              </span>{' '}
              with a{' '}
              <span className="text-indigo-300 font-semibold">
                {tones.find(t => t.id === tone)?.label.toLowerCase()}
              </span>{' '}
              tone.
            </p>
            <div className="glass-card p-6 rounded-xl mb-8 text-left space-y-3">
              <h3 className="font-bold text-slate-300">Here's what you can do:</h3>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <span className="text-2xl">📋</span>
                <p>Paste any content (or a URL) and transform it into posts for all 12 platforms at once</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <span className="text-2xl">🎵</span>
                <p>TikTok posts include a Hook, a 20-30s Script, and Hashtags — ready to film</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <span className="text-2xl">📅</span>
                <p>Schedule posts with a date and time from the dashboard</p>
              </div>
            </div>
          </div>
        )}

        {/* Next button */}
        <div className="mt-8 flex justify-between items-center">
          {step > 0 && currentStep !== 'done' ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-slate-400 hover:text-white transition text-sm"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed || saving}
            className="btn-gradient px-8 py-3 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : currentStep === 'done' ? 'Go to Dashboard →' : 'Next →'}
          </button>
        </div>

        {/* Skip */}
        {currentStep !== 'done' && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-400 text-xs transition"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
