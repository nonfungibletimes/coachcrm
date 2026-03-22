import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessions } from '@/hooks/useSessions'
import { useClients } from '@/hooks/useClients'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function Analytics() {
  const { data: sessions = [] } = useSessions()
  const { data: clients = [] } = useClients()

  const byMonth = useMemo(() => {
    const map = new Map<string, number>()
    sessions.forEach(s => {
      const k = new Date(s.scheduled_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const revenue = s.status === 'completed' ? (s.duration_minutes / 60) * 100 : 0
      map.set(k, (map.get(k) ?? 0) + revenue)
    })
    return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }))
  }, [sessions])

  const completed = sessions.filter(s => s.status === 'completed').length
  const completionRate = sessions.length ? Math.round((completed / sessions.length) * 100) : 0
  const retained = clients.filter(c => c.status === 'active' || c.status === 'paused').length
  const retentionRate = clients.length ? Math.round((retained / clients.length) * 100) : 0
  const avgSessions = clients.length ? Number((sessions.length / clients.length).toFixed(1)) : 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <Metric title="Client Retention" value={`${retentionRate}%`} />
        <Metric title="Session Completion" value={`${completionRate}%`} />
        <Metric title="Avg Sessions / Client" value={String(avgSessions)} />
        <Metric title="Growth (clients)" value={`${clients.length}`} />
      </div>
      <Card>
        <CardHeader><CardTitle>Revenue by Month</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Growth Trends</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
    </Card>
  )
}
