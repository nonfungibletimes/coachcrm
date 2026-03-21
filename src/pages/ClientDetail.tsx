import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, CheckCircle, Circle, Plus, Pencil, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { useClient, useUpdateClient } from '@/hooks/useClients'
import { useSessions } from '@/hooks/useSessions'
import { formatDate, formatDateTime, getInitials, statusColor } from '@/lib/utils'
import { Goal } from '@/types'
import { Input } from '@/components/ui/input'
import { nanoid } from '@/lib/utils'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: client, isLoading } = useClient(id!)
  const { data: sessions } = useSessions(id)
  const updateClient = useUpdateClient()
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [newGoal, setNewGoal] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!client) return <div>Client not found</div>

  const completedSessions = sessions?.filter(s => s.status === 'completed') ?? []
  const upcomingSessions = sessions?.filter(s => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date()) ?? []
  const goals = (client.goals ?? []) as Goal[]
  const completedGoals = goals.filter(g => g.completed)

  const handleSaveNotes = async () => {
    await updateClient.mutateAsync({ id: client.id, notes })
    setEditingNotes(false)
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.trim()) return
    const updated = [...goals, { id: nanoid(), text: newGoal.trim(), completed: false }]
    await updateClient.mutateAsync({ id: client.id, goals: updated })
    setNewGoal('')
  }

  const handleToggleGoal = async (goalId: string) => {
    const updated = goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g)
    await updateClient.mutateAsync({ id: client.id, goals: updated })
  }

  const handleDeleteGoal = async (goalId: string) => {
    const updated = goals.filter(g => g.id !== goalId)
    await updateClient.mutateAsync({ id: client.id, goals: updated })
  }

  const handleStartEditNotes = () => {
    setNotes(client.notes ?? '')
    setEditingNotes(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/clients">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{client.full_name}</h1>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(client.status)}`}>
            {client.status}
          </span>
        </div>
        <Link to={`/clients/${id}/progress`}>
          <Button variant="outline" size="sm">View Progress Report</Button>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarFallback className="text-2xl font-bold">{getInitials(client.full_name)}</AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-lg">{client.full_name}</h2>
            {client.package && <p className="text-sm text-muted-foreground mt-1">{client.package}</p>}
            <div className="mt-4 space-y-2 text-sm text-left">
              {client.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${client.email}`} className="hover:text-foreground">{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Started {formatDate(client.started_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{completedSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Sessions Done</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">Goals Done</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.length > 0 && (
                <Progress value={(completedGoals.length / goals.length) * 100} className="h-2" />
              )}
              {goals.map(goal => (
                <div key={goal.id} className="flex items-start gap-2 text-sm group">
                  <button onClick={() => handleToggleGoal(goal.id)} className="mt-0.5 shrink-0">
                    {goal.completed
                      ? <CheckCircle className="w-4 h-4 text-primary" />
                      : <Circle className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <span className={`flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>{goal.text}</span>
                  <button onClick={() => handleDeleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <form onSubmit={handleAddGoal} className="flex gap-2 pt-1">
                <Input
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="Add a goal..."
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" variant="outline" disabled={!newGoal.trim()}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions ({sessions?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-3 mt-4">
          {sessions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>No sessions yet</p>
            </div>
          ) : (
            sessions?.map(session => (
              <Link key={session.id} to={`/sessions/${session.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{formatDateTime(session.scheduled_at)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{session.template || 'Session'} · {session.duration_minutes} min</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {editingNotes ? (
                <div className="space-y-3">
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8} placeholder="Add notes about this client..." />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNotes} disabled={updateClient.isPending}>
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  {client.notes ? (
                    <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No notes yet</p>
                  )}
                  <Button size="sm" variant="ghost" className="mt-3 gap-1" onClick={handleStartEditNotes}>
                    <Pencil className="w-3 h-3" /> {client.notes ? 'Edit notes' : 'Add notes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homework" className="mt-4">
          <div className="space-y-3">
            {sessions?.flatMap(s => (s.homework ?? []).map(hw => ({ ...hw, sessionDate: s.scheduled_at }))).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No homework assigned yet</p>
              </div>
            ) : (
              sessions?.flatMap(s => (s.homework ?? []).map(hw => ({ ...hw, sessionDate: s.scheduled_at }))).map((hw, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-3">
                    {hw.completed
                      ? <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{hw.task}</p>
                      <p className="text-xs text-muted-foreground">From session {formatDate(hw.sessionDate)}</p>
                    </div>
                    {hw.due_date && (
                      <span className="text-xs text-muted-foreground">Due {formatDate(hw.due_date)}</span>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
