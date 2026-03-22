import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingWizard } from '@/components/OnboardingWizard'

type Step = 'account' | 'onboarding'

export function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleAccountStep = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setStep('onboarding')
  }

  const handleOnboardingComplete = async (values: { coaching_niche: string; first_client_name: string; first_session_at: string }) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('coaches').upsert({
        id: user.id,
        full_name: form.full_name,
        email: form.email,
        coaching_niche: values.coaching_niche,
        onboarding_complete: true,
      })

      let clientId: string | null = null
      if (values.first_client_name) {
        const { data: client } = await supabase
          .from('clients')
          .insert({ coach_id: user.id, full_name: values.first_client_name, status: 'active', goals: [] })
          .select('id')
          .single()
        clientId = client?.id ?? null
      }

      if (clientId && values.first_session_at) {
        await supabase.from('sessions').insert({
          coach_id: user.id,
          client_id: clientId,
          scheduled_at: new Date(values.first_session_at).toISOString(),
          duration_minutes: 60,
          status: 'scheduled',
          template: 'discovery',
          homework: [],
          recap_sent: false,
        })
      }
    }
    setLoading(false)
    navigate('/dashboard')
  }

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <OnboardingWizard onComplete={handleOnboardingComplete} loading={loading} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start your 14-day free trial. No credit card required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccountStep} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input placeholder="Sarah Mitchell" value={form.full_name} onChange={e => update('full_name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="At least 8 characters" minLength={8} value={form.password} onChange={e => update('password', e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
