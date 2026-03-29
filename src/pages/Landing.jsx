import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Check } from 'lucide-react'

const pricingPlans = [
  { id: 'free',    name: 'Free',    price: '$0',  limit: '4 transforms',  features: ['4 per month', 'All platforms', 'Basic support'], popular: false },
  { id: 'starter', name: 'Starter', price: '$9',  limit: '10 transforms', features: ['10 per month', 'All platforms', 'Email support'], popular: false },
  { id: 'pro',     name: 'Pro',     price: '$19', limit: '50 transforms', features: ['50 per month', 'All platforms', 'Priority support', 'Brand voice'], popular: true },
  { id: 'agency',  name: 'Agency',  price: '$49', limit: 'Unlimited',     features: ['Unlimited transforms', 'All platforms', 'Dedicated support', 'Team access'], popular: false },
]

export default function Landing() {
  const navigate = useNavigate()

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
            <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
            <a href="#faq" className="text-slate-300 hover:text-white transition">FAQ</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/login" className="text-slate-300 hover:text-white transition">Login</Link>
            <Link to="/signup" className="btn-gradient px-6 py-2 rounded-lg text-sm font-bold">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            Turn <span className="gradient-text">1 Piece of Content</span> Into <span className="gradient-text">2 Weeks of Posts</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            AI-powered content repurposing for Twitter, LinkedIn, Instagram, Email & TikTok. Paste your content. Get platform-ready posts instantly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup" className="btn-gradient px-8 py-4 rounded-lg text-lg font-bold inline-block">
              Start Free — No Credit Card
            </Link>
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
              <div className="text-3xl font-bold gradient-text">7</div>
              <div className="text-sm text-slate-400">Twitter Tweets</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">5</div>
              <div className="text-sm text-slate-400">LinkedIn Posts</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text">30s</div>
              <div className="text-sm text-slate-400">Seconds to Generate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Content Creation Is Broken</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '❌', text: 'Writing unique posts for each platform takes hours' },
              { icon: '❌', text: 'You have great content going completely unused' },
              { icon: '❌', text: 'Hiring a social media manager costs $1,000+/month' },
              { icon: '❌', text: 'AI tools require manual prompting and formatting' },
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
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">From Content to Posts in 30 Seconds</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', icon: '📋', title: 'Paste Your Content', desc: 'Blog post, transcript, or any long-form content. Up to 10,000 characters.' },
              { num: '2', icon: '🎯', title: 'Choose Platforms', desc: 'Select where you want to post: Twitter, LinkedIn, Instagram, Email, TikTok.' },
              { num: '3', icon: '✨', title: 'Get Instant Posts', desc: 'AI generates platform-optimized content. Copy, paste, post. Done.' },
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
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Everything You Need to Dominate Social Media</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: '📱 One Input, Five Platforms', desc: 'Get Twitter threads, LinkedIn posts, Instagram captions, email newsletters, and TikTok hooks from a single piece of content.' },
              { title: '✅ Perfect Format Every Time', desc: '280-character tweets, 350-word LinkedIn posts, emoji-rich Instagram captions. Each platform gets native-feeling content.' },
              { title: '🎨 Your Voice, Not Generic AI', desc: 'Save custom brand voice settings. Content sounds like you, not a robot.' },
              { title: '📊 Track Everything', desc: 'See your transformation history, past results, and keep your brand voice settings saved.' },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-xl">
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-slate-400 mb-12">No hidden fees. Cancel anytime.</p>

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
      <section id="faq" className="py-20 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How does the AI know my voice?', a: 'Pro users can save brand voice settings (tone, style, audience). These are applied to every transformation.' },
              { q: 'What if the content is too short?', a: 'We recommend at least 300 words for best results. The more content, the better the output.' },
              { q: 'Can I edit the generated posts?', a: "Absolutely. Copy them into your content calendar and tweak as needed. They're templates, not final." },
              { q: 'Do you store my content?', a: 'We keep transformation history for your reference. You can delete it anytime from your dashboard.' },
              { q: 'What if I hit my monthly limit?', a: 'Upgrade anytime. Your unused credits roll over to the next month.' },
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Stop Spending Hours on Social Media Content</h2>
          <p className="text-xl text-slate-300 mb-8">Start for free. No credit card required. Try it now.</p>
          <Link to="/signup" className="btn-gradient px-10 py-5 rounded-lg text-xl font-bold inline-block">
            Start Free Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="text-lg font-bold gradient-text mb-4">Content Multiplier</div>
              <p className="text-slate-400 text-sm">Repurpose content. Dominate social media.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
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
