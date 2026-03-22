import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export function PublicProgressReport() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase
        .from('progress_report_shares')
        .select('token, client:clients(full_name, package, goals), sessions:sessions(status, wins, homework, scheduled_at)')
        .eq('token', token)
        .single()
      setData(data)
    }
    run()
  }, [token])

  if (!data) return <div className="p-8">Loading report...</div>
  const completed = (data.sessions ?? []).filter((s: any) => s.status === 'completed')

  return (
    <div className="min-h-screen p-6 bg-muted/30">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">{data.client?.full_name} Progress Report</h1>
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent>
            <p>Completed sessions: {completed.length}</p>
            <p>Program: {data.client?.package || 'Coaching Program'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Wins</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {completed.slice(0, 5).map((s: any) => <p key={s.scheduled_at}>• {s.wins || 'Session completed'}</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
