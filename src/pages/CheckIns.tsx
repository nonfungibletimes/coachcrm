import { useState } from 'react'
import { Bell, Plus, Send, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useCheckIns, useCreateCheckIn, useUpdateCheckIn, useDeleteCheckIn } from '@/hooks/useCheckIns'
import { useClients } from '@/hooks/useClients'
import { toast } from 'sonner'
import { CheckIn } from '@/types'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline'> = {
  pending: 'secondary',
  sent: 'default',
  responded: 'outline',
}

function CheckInCard({ checkIn }: { checkIn: CheckIn }) {
  const updateCheckIn = useUpdateCheckIn()
  const deleteCheckIn = useDeleteCheckIn()

  const handleSend = async () => {
    await updateCheckIn.mutateAsync({ id: checkIn.id, status: 'sent', sent_at: new Date().toISOString() })
    toast.success(`Check-in sent to ${checkIn.client?.full_name}`)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">{checkIn.client?.full_name ?? 'Unknown Client'}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(checkIn.scheduled_at), 'MMM d, yyyy')}
            </p>
          </div>
          <Badge variant={STATUS_COLORS[checkIn.status] ?? 'secondary'}>
            {checkIn.status}
          </Badge>
        </div>
        {checkIn.message && (
          <p className="text-sm text-muted-foreground border-l-2 pl-3">{checkIn.message}</p>
        )}
        {checkIn.response && (
          <div className="bg-muted rounded p-2 text-sm">
            <p className="text-xs font-medium mb-1">Client Response:</p>
            <p className="text-muted-foreground">{checkIn.response}</p>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          {checkIn.status === 'pending' && (
            <Button size="sm" onClick={handleSend} disabled={updateCheckIn.isPending}>
              <Send className="w-3.5 h-3.5 mr-1" /> Send Now
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive ml-auto"
            onClick={() => deleteCheckIn.mutate(checkIn.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Section({ title, items }: { title: string; items: CheckIn[] }) {
  if (items.length === 0) return null
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(ci => <CheckInCard key={ci.id} checkIn={ci} />)}
      </div>
    </div>
  )
}

export function CheckIns() {
  const { data: checkIns = [], isLoading } = useCheckIns()
  const { data: clients = [] } = useClients()
  const createCheckIn = useCreateCheckIn()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ client_id: '', scheduled_at: '', message: '' })

  const pending = checkIns.filter(c => c.status === 'pending')
  const sent = checkIns.filter(c => c.status === 'sent')
  const responded = checkIns.filter(c => c.status === 'responded')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id || !form.scheduled_at) return
    await createCheckIn.mutateAsync({
      client_id: form.client_id,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      message: form.message || undefined,
      status: 'pending',
    })
    setOpen(false)
    setForm({ client_id: '', scheduled_at: '', message: '' })
  }

  const activeClients = clients.filter(c => c.status === 'active')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-ins</h1>
          <p className="text-muted-foreground mt-1">Stay connected with your clients between sessions.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Schedule Check-in
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : checkIns.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No check-ins yet</h3>
          <p className="text-muted-foreground mb-4">Schedule a check-in to stay connected with your clients.</p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Schedule Check-in
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="Pending" items={pending} />
          <Section title="Sent" items={sent} />
          <Section title="Responded" items={responded} />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Check-in</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {activeClients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea
                placeholder="Hey! Just checking in. How are things going?"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCheckIn.isPending}>Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
