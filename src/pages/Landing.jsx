import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Check, Zap, Link2, Calendar, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const pricingPlans = [
  { id: 'free',    name: 'Free',    price: '$0',  limit: '4 transforms',  features: ['4 per month', 'All 12 platforms', 'Basic support'], popular: false },
  { id: 'starter', name: 'Starter', price: '$9',  limit: '10 transforms', features: ['10 per month', 'All 12 platforms', 'Email support'], popular: false },
  { id: 'pro',     name: 'Pro',     price: '$19', limit: '50 transforms', features: ['50 per month', 'All 12 platforms', 'Priority support', 'Brand voice'], popular: true },
  { id: 'agency',  name: 'Agency',  price: '$49', limit: 'Unlimited',     features: ['Unlimited transforms', 'All 12 platforms', 'Dedicated support', 'Team access'], popular: false },
]

const platforms = [
  { icon: '🐦', name: 'Twitter/X' },
  { icon: '💼', name: 'LinkedIn' },
  { icon: '📸', name: 'Instagram' },
  { icon: '👥', name: 'Facebook' },
  { icon: '🧵', name: 'Threads' },
  { icon: '🎵', name: 'TikTok' },
  { icon: '▶️', name: 'YouTube' },
  { icon: '📌', name: 'Pinterest' },
  { icon: '🤖', name: 'Reddit' },
  { icon: '💬', name: 'WhatsApp' },
  { icon: '📰', name: 'Newsletter' },
  { icon: '📧', name: 'Email' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handlePlanClick = (planId) => {
    if (planId === 'free') {
      navigate('/signup')
    } else {
      navigate('/pricing')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header/Navbar */}
      <nav className="fixed top-0 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">Content Multiplier</div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
            <a href="#platforms" className="text-slate-300 hover:text-white transition">Platforms</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
            <a href="#faq" className="text-slate-300 hover:text-white transition">FAQ</a>
          </div>
          <div className="flex gap-3 items-center">
            {user ? (
              <Link to="/dashboard" className="btn-gradient px-6 py-2 rounded-lg text-sm font-bold">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white transition">Login</Link>
                <Link to="/signup" className="btn-gradient px-6 py-2 rounded-lg text-sm font-bold">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
            <Zap size={14} />
            <span>12 platforms • 36 posts • 30 seconds</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            Turn <span className="gradient-text">1 Piece of Content</span> Into a{' '}
            <span className="gradient-text">Month of Posts</span>
          </h1>
          <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
            Paste your content — or drop a URL — and get 3 platform-ready posts for every major social network instantly. Twitter threads, TikTok scripts, LinkedIn articles, YouTube descriptions, newsletters, and more.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Works with blog posts, articles, podcasts transcripts, YouTube videos, or any link on the web.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Link to="/dashboard" className="btn-gradient px-8 py-4 rounded-lg text-lg font-bold inline-block">
                Go to Dashboard →
              </Link>
            ) : (
              <Link to="/signup" className="btn-gradient px-8 py-4 rounded-lg text-lg font-bold inline-block">
                Start Free — No Credit Card
              </Link>
            )}
            <a
              href="#how-it-works"
              className="border-2 border-slate-700 hover:border-slate-500 px-8 py-4 rounded-lg font-bold transition"
            >
              See How It Works ↓
            </a>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold gradient-text">12</div>
              <div className="text-sm text-slate-400">Platforms Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">36+</div>
              <div className="text-sm text-slate-400">Posts Per Transform</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">30s</div>
              <div className="text-sm text-slate-400">Seconds to Generate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-16 px-6 bg-gradient-to-b from-slate-950 to-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Every Platform, Covered</h2>
          <p className="text-slate-400 mb-10">One transform gives you native-feeling content for all 12 platforms — not generic copy-paste.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {platforms.map((p, i) => (
              <div key={i} className="glass-card p-4 rounded-xl text-center hover:border-indigo-500/50 border border-transparent transition">
                <div className="text-3xl mb-2">{p.icon}</div>
                <div className="text-xs text-slate-400">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Content Creation Is Broken</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '❌', text: 'Writing 12 unique platform posts takes half a day' },
              { icon: '❌', text: 'Great content sits unused because you ran out of time' },
              { icon: '❌', text: 'Hiring a social media manager costs $1,000+/month' },
              { icon: '❌', text: 'Generic AI tools don\'t know TikTok from LinkedIn' },
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 rounded-xl">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">From Content to 36 Posts in 30 Seconds</h2>
          <p className="text-center text-slate-400 mb-16">No prompting. No formatting. Just results.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                icon: '📋',
                title: 'Paste Text or Drop a URL',
                desc: 'Paste a blog post, transcript, or any long-form content. Or just drop a link — we\'ll pull the text automatically.',
              },
              {
                num: '2',
                icon: '🎯',
                title: 'Choose Your Platforms',
                desc: 'Pick any of the 12 platforms: Twitter, LinkedIn, TikTok, YouTube, Instagram, Facebook, Threads, Pinterest, Reddit, WhatsApp, Newsletter, or Email.',
              },
              {
                num: '3',
                icon: '✨',
                title: 'Get 3 Posts Per Platform',
                desc: 'AI generates platform-native content. TikTok gets a Hook, 20-30s Script, and Hashtags. Twitter gets punchy threads. LinkedIn gets professional posts. All ready to copy and post.',
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="glass-card p-8 rounded-xl text-center">
                  <div className="inline-flex w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full items-center justify-center text-white font-bold text-lg mb-4">
                    {step.num}
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 text-indigo-500 text-2xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Everything You Need to Dominate Every Platform</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Globe size={24} className="text-cyan-400" />,
                title: '12 Platforms, 3 Posts Each',
                desc: 'Get Twitter threads, LinkedIn posts, Instagram captions, TikTok scripts, YouTube descriptions, Facebook posts, Pinterest pins, Reddit posts, WhatsApp broadcasts, newsletters, and email campaigns — all from one input.',
              },
              {
                icon: <Link2 size={24} className="text-cyan-400" />,
                title: 'Works With Any URL',
                desc: 'Paste a link to any article, blog post, or web page. We\'ll automatically extract the text and turn it into posts. No copy-pasting required.',
              },
              {
                icon: <Zap size={24} className="text-cyan-400" />,
                title: 'TikTok-Ready Scripts',
                desc: 'TikTok isn\'t just hashtags. Every TikTok output includes a scroll-stopping Hook, a 20-30 second spoken Script, and 5 trending Hashtags — ready to record.',
              },
              {
                icon: <Calendar size={24} className="text-cyan-400" />,
                title: 'Schedule & Plan Ahead',
                desc: 'Pick a date and time for each post. Save your content calendar directly from the dashboard — no third-party tools needed.',
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-xl">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-slate-400 mb-12">No hidden fees. Cancel anytime. Every plan includes all 12 platforms.</p>

          <div className="grid md:grid-cols-4 gap-6">
            {pricingPlans.map(plan => (
              <div key={plan.id} className={`rounded-xl p-8 border transition ${plan.popular ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : 'glass-card'}`}>
                {plan.popular && <div className="text-indigo-400 text-xs font-bold mb-2">🔥 MOST POPULAR</div>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold gradient-text mb-1">{plan.price}</div>
                <div className="text-sm text-slate-400 mb-6">{plan.limit}/mo</div>
                <button
                  onClick={() => handlePlanClick(plan.id)}
                  className={`w-full py-2 rounded-lg font-bold mb-6 transition ${plan.popular ? 'btn-gradient' : 'border border-slate-700 hover:bg-slate-800'}`}
                >
                  {plan.id === 'free' ? 'Start Free' : 'Get Started'}
                </button>
                <ul className="space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-cyan-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What counts as one transform?', a: 'One transform = one piece of input content processed across all your selected platforms. If you select 5 platforms at once, that\'s still 1 transform.' },
              { q: 'Can I paste a URL instead of text?', a: 'Yes! Switch to "From URL" mode on the dashboard, paste any public link, and we\'ll extract the content automatically before generating posts.' },
              { q: 'What\'s special about TikTok output?', a: 'Each TikTok post includes a scroll-stopping Hook (under 15 words), a 20-30 second spoken Script (~60-80 words), and 5 relevant Hashtags — everything you need to record and post.' },
              { q: 'How does scheduling work?', a: 'Pick a date and time when generating posts. Your scheduled posts appear in the Scheduled Posts page where you can preview or cancel them.' },
              { q: 'Do unused transforms roll over?', a: 'Yes. Unused transforms from the current month carry over to the next month.' },
              { q: 'Do you store my content?', a: 'We keep transformation history for your reference. You can delete it anytime from your dashboard.' },
            ].map((item, i) => (
              <details key={i} className="glass-card p-6 rounded-xl group cursor-pointer">
                <summary className="font-bold flex justify-between items-center">
                  {item.q}
                  <ChevronDown size={20} className="group-open:rotate-180 transition" />
                </summary>
                <p className="text-slate-400 mt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Stop Writing Posts Manually</h2>
          <p className="text-xl text-slate-300 mb-4">One piece of content. 12 platforms. 36 posts. Done in 30 seconds.</p>
          <p className="text-slate-400 mb-8">Start for free. No credit card required.</p>
          {user ? (
            <Link to="/dashboard" className="btn-gradient px-10 py-5 rounded-lg text-xl font-bold inline-block">
              Go to Dashboard →
            </Link>
          ) : (
            <Link to="/signup" className="btn-gradient px-10 py-5 rounded-lg text-xl font-bold inline-block">
              Start Free Today →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="text-lg font-bold gradient-text mb-4">Content Multiplier</div>
              <p className="text-slate-400 text-sm">12 platforms. 36 posts. 30 seconds.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#platforms" className="hover:text-white transition">Platforms</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Upgrade Plan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            <p>© 2026 Content Multiplier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
