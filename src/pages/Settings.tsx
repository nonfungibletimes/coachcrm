import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, CreditCard, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function Settings() {
  const [profile, setProfile] = useState({ full_name: '', coaching_niche: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('coaches').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({ full_name: data.full_name, coaching_niche: data.coaching_niche ?? '', email: data.email })
        setPlan(data.plan ?? 'free')
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('coaches').update({
        full_name: profile.full_name,
        coaching_niche: profile.coaching_niche,
      }).eq('id', user.id)
    }
    setSaving(false)
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleManageBilling = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-customer-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      const { url } = await res.json()
      if (url) window.open(url, '_blank')
      else toast.error('No billing portal URL returned')
    } catch {
      toast.error('Could not open billing portal')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><CreditCard className="w-3.5 h-3.5" />Billing</TabsTrigger>
          <TabsTrigger value="emails" className="gap-2"><Mail className="w-3.5 h-3.5" />Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your coaching profile information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                </div>
                <div className="space-y-2">
                  <Label>Coaching Niche</Label>
                  <Input placeholder="e.g. Executive, Life, Business..." value={profile.coaching_niche} onChange={e => setProfile(p => ({ ...p, coaching_niche: e.target.value }))} />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Manage your subscription and payment details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium capitalize">{plan === 'free' ? 'Free Trial' : `${plan} Plan`}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan === 'free' ? 'Upgrade to unlock all features.' : 'Your subscription is active.'}
                </p>
              </div>
              <Button variant="outline" onClick={handleManageBilling}>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing via Stripe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize the emails sent to your clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Welcome Email', 'Session Recap', 'Check-in Reminder'].map(template => (
                <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium text-sm">{template}</span>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
