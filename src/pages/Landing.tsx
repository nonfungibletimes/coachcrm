import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Users, Calendar, BarChart3, CheckCircle, ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const features = [
  { icon: Users, title: 'Client Management', description: "Track every client's goals, progress, and journey." },
  { icon: Calendar, title: 'Session Tracking', description: 'Log notes, wins, blockers, and homework.' },
  { icon: CheckCircle, title: 'Homework Tracker', description: 'Assign tasks, track completion, and follow up automatically.' },
  { icon: BarChart3, title: 'Progress Reports', description: 'Beautiful shareable reports for client momentum.' },
]

const plans = {
  monthly: [
    { name: 'Starter', price: 29, features: ['Up to 10 clients', 'Session tracking', 'Email reminders'], popular: false },
    { name: 'Pro', price: 59, features: ['Up to 30 clients', 'Check-ins', 'Progress sharing'], popular: true },
    { name: 'Agency', price: 99, features: ['Unlimited clients', 'Team seats', 'Priority support'], popular: false },
  ],
  annual: [
    { name: 'Starter', price: 290, features: ['Up to 10 clients', 'Session tracking', 'Email reminders'], popular: false },
    { name: 'Pro', price: 590, features: ['Up to 30 clients', 'Check-ins', 'Progress sharing'], popular: true },
    { name: 'Agency', price: 990, features: ['Unlimited clients', 'Team seats', 'Priority support'], popular: false },
  ],
}

export function Landing() {
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const [demoOpen, setDemoOpen] = useState(false)
  const testimonials = ['[Client quote slot #1]', '[Client quote slot #2]', '[Client quote slot #3]']

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Zap className="w-4 h-4 text-primary-foreground" /></div><span className="font-bold text-lg">CoachCRM</span></div>
          <div className="flex items-center gap-3"><Link to="/login"><Button variant="ghost">Sign in</Button></Link><Link to="/signup"><Button>Get started free</Button></Link></div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <Badge variant="secondary" className="mb-6">✨ Built for coaches, not salespeople</Badge>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">The CRM that actually <span className="text-primary">understands coaching</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Manage clients, track sessions, automate check-ins, and share beautiful progress reports.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup"><Button size="lg" className="gap-2">Start free 14-day trial <ArrowRight className="w-4 h-4" /></Button></Link>
          <Button size="lg" variant="outline" onClick={() => setDemoOpen(true)} className="gap-2"><PlayCircle className="w-4 h-4" /> Watch 2-min demo</Button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20"><div className="grid sm:grid-cols-2 gap-8">{features.map((f) => <div key={f.title} className="flex gap-4 p-6 rounded-xl border bg-card"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><f.icon className="w-5 h-5 text-primary" /></div><div><h3 className="font-semibold mb-1">{f.title}</h3><p className="text-muted-foreground text-sm">{f.description}</p></div></div>)}</div></section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20" id="pricing">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <div className="inline-flex border rounded-lg p-1">
            <button className={`px-4 py-1.5 rounded ${interval === 'monthly' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setInterval('monthly')}>Monthly</button>
            <button className={`px-4 py-1.5 rounded ${interval === 'annual' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setInterval('annual')}>Annual (2 months free)</button>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {plans[interval].map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg relative' : ''}>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="mb-6"><span className="text-4xl font-bold">${plan.price}</span><span className="text-muted-foreground">/{interval === 'monthly' ? 'month' : 'year'}</span></div>
                <ul className="space-y-2 mb-6">{plan.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-primary shrink-0" />{f}</li>)}</ul>
                <Link to={`/checkout?plan=${plan.name.toLowerCase()}&interval=${interval}`}><Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>Start free trial</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Testimonials</h2>
        <div className="grid sm:grid-cols-3 gap-4">{testimonials.map((slot, i) => <Card key={i}><CardContent className="p-6 text-sm text-muted-foreground">{slot}</CardContent></Card>)}</div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Social Proof</h2>
        <div className="grid sm:grid-cols-4 gap-4 text-center">
          <Card><CardContent className="p-6"><p className="text-3xl font-bold">500+</p><p className="text-sm text-muted-foreground">Coaches on waitlist</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-3xl font-bold">25k+</p><p className="text-sm text-muted-foreground">Sessions tracked</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-3xl font-bold">92%</p><p className="text-sm text-muted-foreground">Client retention</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-3xl font-bold">4.9/5</p><p className="text-sm text-muted-foreground">Coach satisfaction</p></CardContent></Card>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold mb-6 text-center">FAQ</h2>
        <div className="space-y-3">
          {[
            ['Do I need a credit card for trial?', 'No, trial starts without a card.'],
            ['Can clients access their own portal?', 'Yes, token-based portal links are supported.'],
            ['Can I export data?', 'Yes, reporting and exports are available.'],
          ].map(([q, a]) => <Card key={q}><CardContent className="p-4"><p className="font-semibold">{q}</p><p className="text-sm text-muted-foreground mt-1">{a}</p></CardContent></Card>)}
        </div>
      </section>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>2-minute product demo</DialogTitle></DialogHeader>
          <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">Demo video placeholder</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
