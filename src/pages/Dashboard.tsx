import { Link } from 'react-router-dom'
import { Users, Calendar, Bell, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useClients } from '@/hooks/useClients'
import { useSessions } from '@/hooks/useSessions'
import { formatDateTime, getInitials, statusColor } from '@/lib/utils'

export function Dashboard() {
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: sessions, isLoading: sessionsLoading } = useSessions()

  const activeClients = clients?.filter(c => c.status === 'active') ?? []
  const upcomingSessions = sessions?.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduled_at) > new Date()
  ).slice(0, 5) ?? []
  const recentSessions = sessions?.filter(s => s.status === 'completed').slice(0, 5) ?? []
  const thisWeekSessions = sessions?.filter(s => {
    const d = new Date(s.scheduled_at)
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    return d >= weekStart
  }) ?? []

  const stats = [
    { label: 'Active Clients', value: activeClients.length, icon: Users, href: '/clients' },
    { label: 'Sessions This Week', value: thisWeekSessions.length, icon: Calendar, href: '/sessions' },
    { label: 'Upcoming Sessions', value: upcomingSessions.length, icon: Clock, href: '/sessions' },
    { label: 'Check-ins Pending', value: 0, icon: Bell, href: '/check-ins' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your practice.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                {clientsLoading || sessionsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-3xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Sessions</CardTitle>
            <Link to="/sessions">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No upcoming sessions</p>
                <Link to="/sessions">
                  <Button size="sm" variant="outline" className="mt-3">Schedule a session</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(session.client?.full_name ?? '?')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{session.client?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(session.scheduled_at)}</p>
                    </div>
                    <Badge className={statusColor(session.status)} variant="outline">
                      {session.template || 'Session'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Sessions</CardTitle>
            <Link to="/sessions">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No sessions completed yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map(session => (
                  <Link key={session.id} to={`/sessions/${session.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(session.client?.full_name ?? '?')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.client?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(session.scheduled_at)}</p>
                      </div>
                      <Badge className={statusColor('completed')} variant="outline">Done</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Active Clients</CardTitle>
          <Link to="/clients">
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : activeClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No active clients yet</p>
              <Link to="/clients">
                <Button size="sm" variant="outline" className="mt-3">Add your first client</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeClients.slice(0, 6).map(client => (
                <Link key={client.id} to={`/clients/${client.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(client.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{client.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.package || 'No package'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
