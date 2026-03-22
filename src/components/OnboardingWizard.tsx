import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface OnboardingValues {
  coaching_niche: string
  first_client_name: string
  first_session_at: string
}

export function OnboardingWizard({ onComplete, loading }: { onComplete: (values: OnboardingValues) => Promise<void>, loading?: boolean }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<OnboardingValues>({ coaching_niche: '', first_client_name: '', first_session_at: '' })

  const steps = [
    { title: 'Set up your profile', key: 'coaching_niche' },
    { title: 'Add your first client', key: 'first_client_name' },
    { title: 'Schedule first session', key: 'first_session_at' },
  ] as const

  const pct = ((step + 1) / steps.length) * 100

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{steps[step].title}</CardTitle>
        <Progress value={pct} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 0 && (
          <div className="space-y-2">
            <Label>Coaching niche</Label>
            <Input value={values.coaching_niche} onChange={e => setValues(v => ({ ...v, coaching_niche: e.target.value }))} />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <Label>First client name</Label>
            <Input value={values.first_client_name} onChange={e => setValues(v => ({ ...v, first_client_name: e.target.value }))} />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <Label>First session date/time</Label>
            <Input type="datetime-local" value={values.first_session_at} onChange={e => setValues(v => ({ ...v, first_session_at: e.target.value }))} />
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
          {step < steps.length - 1 ? (
            <Button className="ml-auto" onClick={() => setStep(s => s + 1)}>Next</Button>
          ) : (
            <Button className="ml-auto" disabled={loading} onClick={() => onComplete(values)}>
              {loading ? 'Finishing...' : 'Finish setup'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
