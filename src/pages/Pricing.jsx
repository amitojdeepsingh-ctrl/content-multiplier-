export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">Content Multiplier</div>
          <button className="text-slate-300 hover:text-white">Dashboard</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Free', price: '$0', limit: '4 transforms/month' },
            { name: 'Starter', price: '$9', limit: '10 transforms/month' },
            { name: 'Pro', price: '$19', limit: '50 transforms/month', popular: true },
            { name: 'Agency', price: '$49', limit: 'Unlimited transforms' },
          ].map(plan => (
            <div key={plan.name} className={`glass-card p-8 rounded-xl text-center ${plan.popular ? 'ring-2 ring-indigo-500' : ''}`}>
              {plan.popular && <div className="text-indigo-400 text-sm font-bold mb-2">MOST POPULAR</div>}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold gradient-text mb-2">{plan.price}</div>
              <p className="text-slate-400 mb-6">{plan.limit}</p>
              <button className={`w-full py-2 rounded-lg font-bold ${plan.popular ? 'btn-gradient' : 'border border-slate-700 hover:bg-slate-800'}`}>
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
