import { Link } from 'react-router-dom'
import { Zap, Users, Calendar, BarChart3, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Users,
    title: 'Client Management',
    description: "Track every client's goals, progress, and journey. Know exactly where each person stands at a glance.",
  },
  {
    icon: Calendar,
    title: 'Session Tracking',
    description: 'Log session notes, wins, blockers, and homework. One-click recap emails that clients actually love.',
  },
  {
    icon: CheckCircle,
    title: 'Homework Tracker',
    description: 'Assign tasks, track completion, and follow up automatically. No more lost homework.',
  },
  {
    icon: BarChart3,
    title: 'Progress Reports',
    description: "Beautiful shareable reports that show clients how far they've come. PDF export included.",
  },
]

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for new coaches',
    features: ['Up to 10 clients', 'Session notes & tracking', 'Basic reporting', 'Email reminders'],
    cta: 'Start free trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: 59,
    description: 'For established coaches',
    features: ['Up to 30 clients', 'Everything in Starter', 'Progress reports & sharing', 'Check-in automation', 'Email templates'],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Agency',
    price: 99,
    description: 'For coaching businesses',
    features: ['Unlimited clients', 'Everything in Pro', 'Team members', 'Custom branding', 'Priority support'],
    cta: 'Start free trial',
    popular: false,
  },
]

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Executive Coach',
    text: 'CoachCRM replaced three spreadsheets and a Notion doc. My clients love the progress reports.',
    rating: 5,
  },
  {
    name: 'James Okonkwo',
    role: 'Business Coach',
    text: 'Finally a CRM that gets coaching. I spend less time admin-ing and more time coaching.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Life Coach',
    text: 'The check-in automation alone is worth the price. My clients feel cared for between sessions.',
    rating: 5,
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">CoachCRM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button>Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <Badge variant="secondary" className="mb-6">
          ✨ Built for coaches, not salespeople
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
          The CRM that actually<br />
          <span className="text-primary">understands coaching</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Manage clients, track sessions, automate check-ins, and share beautiful progress reports — 
          all in one place. Stop juggling spreadsheets.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Start free 14-day trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Watch 2-min demo
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">No credit card required · Cancel anytime</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything a coach needs</h2>
          <p className="text-muted-foreground text-lg">Designed for solo coaches with 5–50 clients who've outgrown spreadsheets.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 p-6 rounded-xl border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg">All plans include a 14-day free trial. No credit card required.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg relative' : ''}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most popular</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Coaches love it</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to stop juggling spreadsheets?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join hundreds of coaches who manage their practice with CoachCRM.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Start your free trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">CoachCRM</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 CoachCRM. Built for coaches.</p>
        </div>
      </footer>
    </div>
  )
}
