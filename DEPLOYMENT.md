# Content Multiplier — Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Supabase Setup (15 min)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In **SQL Editor**, run these queries to create tables and functions:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  transforms_used INTEGER NOT NULL DEFAULT 0,
  transforms_limit INTEGER NOT NULL DEFAULT 4,
  credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transformations table
CREATE TABLE transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  input_content TEXT NOT NULL,
  input_length INTEGER NOT NULL,
  platforms TEXT[] NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transformations_user ON transformations(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users read own transforms" ON transformations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transforms" ON transformations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, plan, transforms_limit, credits_reset_at)
  VALUES (NEW.id, NEW.email, 'free', 4, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

3. Get your **Supabase URL** and **Anon Key** from Settings > API

### 2. Stripe Setup (10 min)

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your **Secret Key** from Settings > API Keys
3. Create 3 products:
   - **Starter**: $9/month (10 transforms)
   - **Pro**: $19/month (50 transforms)
   - **Agency**: $49/month (unlimited)
4. Get the **Price IDs** for each product
5. Create a webhook endpoint pointing to: `https://yourdomain.com/api/stripe-webhook`
6. Get your **Webhook Signing Secret**

### 3. Vercel Deployment (5 min)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and connect your GitHub account
3. Import the `content-multiplier` repository
4. Add environment variables in Vercel settings:

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
VERCEL_URL=https://yourdomain.com
```

5. Deploy! Vercel will automatically build and deploy

### 4. Custom Domain (Optional)

In Vercel Settings > Domains, add your custom domain (e.g., contentmultiplier.com)

---

## 📋 Production Checklist Before Launch

- [ ] Supabase database created and schema deployed
- [ ] Stripe products created with price IDs
- [ ] All env variables added to Vercel
- [ ] Test signup → dashboard → transform flow
- [ ] Test Stripe checkout with test card: `4242 4242 4242 4242`
- [ ] Verify webhook is working (Stripe dashboard)
- [ ] Verify emails are configured in Supabase
- [ ] Set up Supabase email templates (optional)

---

## 🧪 Testing the Live Site

1. Go to `https://yourdomain.com`
2. Click "Get Started Free"
3. Sign up with test email
4. Paste some content and transform
5. Go to Pricing and upgrade to Pro with test card
6. Verify credit limit increased from 4 to 50

---

## 🔧 Local Development

```bash
# Set up .env.local with your Supabase keys
cp .env.local.example .env.local
# Edit .env.local with your actual keys

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 📊 Success Metrics

After launch, track:
- **Signups**: Goal 50+ in first week
- **Transformations**: Goal 100+ in first week
- **Upgrades**: Goal 5+ paid users in first week
- **Retention**: 70%+ users returning after 3 days

---

## 🆘 Troubleshooting

### "Invalid API Key" error
- Verify ANTHROPIC_API_KEY is set in Vercel env vars
- Check API key hasn't been revoked in Anthropic console

### Stripe webhook not firing
- Verify webhook endpoint is publicly accessible
- Check Stripe dashboard > Webhooks > Events
- Resend test event to debug

### Supabase auth not working
- Verify SUPABASE_ANON_KEY is correct (not SERVICE_KEY)
- Check email confirmation is not required (Settings > Auth)
- Clear browser cookies and retry

---

## 🎉 You're Live!

Share the link with early users and start collecting feedback!

Post-launch tasks:
- Week 2: Add Google OAuth
- Week 3: Add Settings/History pages
- Week 4: Add watermarks to free tier
- Month 2: Add team seats (Agency plan)
