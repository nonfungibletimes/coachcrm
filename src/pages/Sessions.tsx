import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Plus, Search, List } from 'lucide-react'
import { CalendarView } from '@/components/CalendarView'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useSessions, useCreateSession } from '@/hooks/useSessions'
import { useClients } from '@/hooks/useClients'
import { useSessionTemplates, useEnsureDefaultTemplates } from '@/hooks/useSessionTemplates'
import { formatDateTime, getInitials, statusColor } from '@/lib/utils'
import { Session } from '@/types'

function AddSessionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: clients } = useClients()
  const { data: templates = [] } = useSessionTemplates()
  const ensureDefaults = useEnsureDefaultTemplates()
  const createSession = useCreateSession()
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [form, setForm] = useState({
    client_id: '', scheduled_at: '', duration_minutes: 60,
    template: 'accountability' as Session['template'], status: 'scheduled' as Session['status'],
  })
  const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    ensureDefaults.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const selected = templates.find(t => t.id === selectedTemplateId)
    if (!selected) return
    setForm(f => ({ ...f, duration_minutes: selected.duration_minutes, template: selected.type === 'goal-review' || selected.type === 'weekly-checkin' ? 'strategy' : (selected.type as Session['template']) }))
  }, [selectedTemplateId, templates])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createSession.mutateAsync({ ...form, homework: [], recap_sent: false })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule Session</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={form.client_id} onValueChange={v => update('client_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
              <SelectContent>
                {clients?.filter(c => c.status === 'active').map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date & Time *</Label>
            <Input type="datetime-local" value={form.scheduled_at} onChange={e => update('scheduled_at', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Session Template Library</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger><SelectValue placeholder="Choose reusable template (optional)" /></SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name} ({t.duration_minutes}m)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" value={form.duration_minutes} onChange={e => update('duration_minutes', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={form.template} onValueChange={v => update('template', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="accountability">Accountability</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={createSession.isPending || !form.client_id}>
              {createSession.isPending ? 'Scheduling...' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function Sessions() {
  const { data: sessions, isLoading } = useSessions()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const filtered = (sessions ?? []).filter(s => {
    const matchSearch = s.client?.full_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const upcoming = filtered.filter(s => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date())
  const past = filtered.filter(s => s.status !== 'scheduled' || new Date(s.scheduled_at) <= new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">{sessions?.length ?? 0} total sessions</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Schedule Session
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'list' && isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : view === 'list' && filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
          <p className="text-muted-foreground mb-6">Schedule your first session to get started.</p>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Schedule Session</Button>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map(session => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Past</h2>
              <div className="space-y-3">
                {past.map(session => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {view === 'calendar' && !isLoading && (
        <CalendarView sessions={filtered} />
      )}

      <AddSessionDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}

function SessionRow({ session }: { session: any }) {
  return (
    <Link to={`/sessions/${session.id}`}>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-sm font-semibold">
              {getInitials(session.client?.full_name ?? '?')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{session.client?.full_name}</p>
            <p className="text-sm text-muted-foreground">{formatDateTime(session.scheduled_at)} · {session.duration_minutes} min</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {session.template && (
              <Badge variant="outline" className="capitalize text-xs">{session.template}</Badge>
            )}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(session.status)}`}>
              {session.status}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
