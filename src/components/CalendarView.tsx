import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { statusColor } from '@/lib/utils'

interface Session {
  id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  template?: string
  client?: { full_name: string }
}

interface Props {
  sessions: Session[]
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Mon as first day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function CalendarView({ sessions }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const navigate = useNavigate()

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const goToday = () => setWeekStart(startOfWeek(new Date()))

  const sessionsByDay = days.map(day =>
    sessions.filter(s => isSameDay(new Date(s.scheduled_at), day))
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
  )

  const weekLabel = `${days[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
        </div>
        <p className="font-medium text-sm">{weekLabel}</p>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className="min-h-[160px]">
              <div className={`text-center py-1.5 mb-2 rounded-lg text-sm font-medium ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                <div>{DAY_LABELS[i]}</div>
                <div className={`text-lg leading-tight ${isToday ? 'font-bold' : ''}`}>{day.getDate()}</div>
              </div>
              <div className="space-y-1.5">
                {sessionsByDay[i].map(session => (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                    className="cursor-pointer rounded-md p-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    <p className="text-xs font-semibold truncate">{session.client?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(session.scheduled_at)}</p>
                    <p className="text-xs text-muted-foreground">{session.duration_minutes}min</p>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium mt-0.5 ${statusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile list view */}
      <div className="md:hidden space-y-4">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          const daySessions = sessionsByDay[i]
          if (daySessions.length === 0 && !isToday) return null
          return (
            <div key={i}>
              <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {DAY_LABELS[i]}, {day.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                {isToday && <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">Today</span>}
              </div>
              {daySessions.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-2">No sessions</p>
              ) : (
                <div className="space-y-2">
                  {daySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/sessions/${session.id}`)}
                      className="cursor-pointer flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.client?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(session.scheduled_at)} · {session.duration_minutes}min</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
