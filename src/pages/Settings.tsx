import { useState, useEffect } from 'react'
import { User, CreditCard, Mail } from 'lucide-react'
import { EmailTemplateEditor } from '@/components/EmailTemplateEditor'
import { getEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useSubscription, useUpdateSubscription } from '@/hooks/useSubscription'

export function Settings() {
  const [profile, setProfile] = useState({ full_name: '', coaching_niche: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => getEmailTemplates())
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const { data: sub } = useSubscription()
  const updateSub = useUpdateSubscription()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('coaches').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({ full_name: data.full_name, coaching_niche: data.coaching_niche ?? '', email: data.email })
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
                <div className="space-y-2"><Label>Full Name</Label><Input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled className="opacity-60" /></div>
                <div className="space-y-2"><Label>Coaching Niche</Label><Input placeholder="e.g. Executive, Life, Business..." value={profile.coaching_niche} onChange={e => setProfile(p => ({ ...p, coaching_niche: e.target.value }))} /></div>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Billing</CardTitle><CardDescription>Manage plan and subscription.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium capitalize">Current plan: {sub?.plan ?? 'free'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['starter', 'pro', 'agency'] as const).map(plan => (
                  <Button key={plan} variant={sub?.plan === plan ? 'default' : 'outline'} onClick={() => updateSub.mutate(plan)}>
                    {sub?.plan === plan ? 'Current' : `Switch to ${plan}`}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Use checkout flow for Stripe payment and then sync plan.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Email Templates</CardTitle><CardDescription>Customize the emails sent to your clients.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div><span className="font-medium text-sm">{template.name}</span><p className="text-xs text-muted-foreground truncate max-w-xs">{template.subject}</p></div>
                  <Button size="sm" variant="outline" onClick={() => setEditingTemplate(template)}>Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingTemplate && (
        <EmailTemplateEditor
          template={editingTemplate}
          open={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSaved={updated => {
            setTemplates(ts => ts.map(t => t.id === updated.id ? updated : t))
            setEditingTemplate(null)
          }}
        />
      )}
    </div>
  )
}
