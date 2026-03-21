import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, CheckCircle, Circle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSession, useUpdateSession } from '@/hooks/useSessions'
import { formatDateTime, statusColor } from '@/lib/utils'
import { HomeworkItem } from '@/types'

export function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: session, isLoading } = useSession(id!)
  const updateSession = useUpdateSession()
  const [saving, setSaving] = useState(false)
  const [newHw, setNewHw] = useState('')
  const [form, setForm] = useState<Record<string, unknown>>({})

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
  if (!session) return <div>Session not found</div>

  const handleSave = async () => {
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateSession.mutateAsync({ id: session.id, ...(form as any) })
    setSaving(false)
    setForm({})
  }

  const handleStatusChange = async (status: string) => {
    await updateSession.mutateAsync({ id: session.id, status: status as any })
  }

  const addHomework = async () => {
    if (!newHw.trim()) return
    const hw: HomeworkItem = { id: crypto.randomUUID(), task: newHw, completed: false }
    const homework = [...(session.homework ?? []), hw]
    await updateSession.mutateAsync({ id: session.id, homework })
    setNewHw('')
  }

  const toggleHomework = async (hwId: string) => {
    const homework = (session.homework ?? []).map(h =>
      h.id === hwId ? { ...h, completed: !h.completed } : h
    )
    await updateSession.mutateAsync({ id: session.id, homework })
  }

  const removeHomework = async (hwId: string) => {
    const homework = (session.homework ?? []).filter(h => h.id !== hwId)
    await updateSession.mutateAsync({ id: session.id, homework })
  }

  const hasChanges = Object.keys(form as object).length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sessions">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {session.client?.full_name} — {formatDateTime(session.scheduled_at)}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground text-sm capitalize">{session.template || 'Session'} · {session.duration_minutes} min</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={session.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No-show</SelectItem>
            </SelectContent>
          </Select>
          {hasChanges && (
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Session Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              placeholder="What was discussed..."
              rows={6}
              value={(form.notes as string) ?? session.notes ?? ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Wins 🎉</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="What went well?"
                rows={3}
                value={form.wins ?? session.wins ?? ''}
                onChange={e => setForm(f => ({ ...f, wins: e.target.value }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Blockers 🧱</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="What's in the way?"
                rows={3}
                value={form.blocks ?? session.blocks ?? ''}
                onChange={e => setForm(f => ({ ...f, blocks: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Homework Assigned</CardTitle>
          <Badge variant="outline">{session.homework?.filter(h => h.completed).length ?? 0}/{session.homework?.length ?? 0} done</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {(session.homework ?? []).map(hw => (
            <div key={hw.id} className="flex items-center gap-3">
              <button onClick={() => toggleHomework(hw.id)} className="shrink-0">
                {hw.completed
                  ? <CheckCircle className="w-5 h-5 text-primary" />
                  : <Circle className="w-5 h-5 text-muted-foreground" />}
              </button>
              <span className={`flex-1 text-sm ${hw.completed ? 'line-through text-muted-foreground' : ''}`}>{hw.task}</span>
              <button onClick={() => removeHomework(hw.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Add homework task..."
              value={newHw}
              onChange={e => setNewHw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHomework()}
            />
            <Button onClick={addHomework} size="sm" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {session.status === 'completed' && !session.recap_sent && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Send session recap</p>
              <p className="text-sm text-muted-foreground">Email a summary to {session.client?.full_name}</p>
            </div>
            <Button
              onClick={async () => {
                await updateSession.mutateAsync({ id: session.id, recap_sent: true })
                toast.success(`Recap sent to ${session.client?.full_name}`)
              }}
              className="gap-2"
            >
              <Send className="w-4 h-4" /> Send Recap
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
