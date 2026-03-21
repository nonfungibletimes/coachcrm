import { useParams } from 'react-router-dom'
import { CheckCircle, Circle, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useClient } from '@/hooks/useClients'
import { useSessions } from '@/hooks/useSessions'
import { formatDate, getInitials } from '@/lib/utils'
import { Goal } from '@/types'

export function ProgressReport() {
  const { id } = useParams<{ id: string }>()
  const { data: client, isLoading } = useClient(id!)
  const { data: sessions } = useSessions(id)

  if (isLoading) return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
  if (!client) return <div>Client not found</div>

  const completed = sessions?.filter(s => s.status === 'completed') ?? []
  const allHw = sessions?.flatMap(s => s.homework ?? []) ?? []
  const doneHw = allHw.filter(h => h.completed)
  const hwRate = allHw.length > 0 ? Math.round((doneHw.length / allHw.length) * 100) : 0

  const goals = (client.goals ?? []) as Goal[]
  const doneGoals = goals.filter(g => g.completed)
  const goalRate = goals.length > 0 ? Math.round((doneGoals.length / goals.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {getInitials(client.full_name)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{client.full_name}</h1>
          <p className="text-muted-foreground mt-2">Progress Report · {formatDate(new Date().toISOString())}</p>
          {client.package && (
            <p className="text-sm text-primary font-medium mt-1">{client.package}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <CheckCircle className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{hwRate}%</p>
              <p className="text-xs text-muted-foreground">Homework</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{goalRate}%</p>
              <p className="text-xs text-muted-foreground">Goals</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Goals Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Progress value={goalRate} className="h-3" />
              <p className="text-sm text-muted-foreground">{doneGoals.length} of {goals.length} goals completed</p>
              <div className="space-y-2">
                {goals.map(goal => (
                  <div key={goal.id} className="flex items-start gap-3">
                    {goal.completed
                      ? <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      : <Circle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />}
                    <span className={`text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>{goal.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Highlights */}
        {completed.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Session Highlights</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {completed.slice(0, 3).map(session => (
                <div key={session.id} className="border-l-2 border-primary/30 pl-4">
                  <p className="text-sm font-medium">{formatDate(session.scheduled_at)}</p>
                  {session.wins && (
                    <p className="text-sm text-muted-foreground mt-1">🎉 {session.wins}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pb-8">
          Generated by CoachCRM · {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
