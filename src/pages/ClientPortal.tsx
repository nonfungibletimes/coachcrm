import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'

export function ClientPortal() {
  const { token } = useParams<{ token: string }>()
  const [portal, setPortal] = useState<any>(null)
  const [response, setResponse] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('client_portal_tokens')
        .select('token, client:clients(*, sessions(*), check_ins(*))')
        .eq('token', token)
        .single()
      setPortal(data)
    }
    load()
  }, [token])

  const upcoming = useMemo(
    () => (portal?.client?.sessions ?? []).filter((s: any) => s.status === 'scheduled').slice(0, 5),
    [portal],
  )

  if (!portal) return <div className="p-8">Loading portal...</div>

  const latestSession = (portal.client.sessions ?? [])[0]

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Welcome, {portal.client.full_name}</h1>

        <Card>
          <CardHeader><CardTitle>Upcoming Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 ? <p>No upcoming sessions.</p> : upcoming.map((s: any) => <p key={s.id}>• {new Date(s.scheduled_at).toLocaleString()}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Homework</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(latestSession?.homework ?? []).map((h: any) => <p key={h.id}>• {h.task}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Submit Check-in Response</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Share your wins, blockers, and support needed" />
            <Button onClick={async () => {
              const pending = (portal.client.check_ins ?? []).find((c: any) => c.status === 'sent' || c.status === 'pending')
              if (!pending) return
              await supabase.from('check_ins').update({ response, status: 'responded' }).eq('id', pending.id)
              setResponse('')
            }}>Submit Response</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
          <CardContent>
            <p>Completed sessions: {(portal.client.sessions ?? []).filter((s: any) => s.status === 'completed').length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
