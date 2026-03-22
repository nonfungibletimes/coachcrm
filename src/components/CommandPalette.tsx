import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Search, Users, Calendar } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useSessions } from '@/hooks/useSessions'

interface Result {
  id: string
  label: string
  sublabel?: string
  href: string
  group: 'Clients' | 'Sessions'
}

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: clients } = useClients()
  const { data: sessions } = useSessions()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const q = query.toLowerCase().trim()

  const clientResults: Result[] = (clients ?? [])
    .filter(c => !q || c.full_name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
    .slice(0, 5)
    .map(c => ({
      id: `client-${c.id}`,
      label: c.full_name,
      sublabel: c.email || c.status,
      href: `/clients/${c.id}`,
      group: 'Clients' as const,
    }))

  const sessionResults: Result[] = (sessions ?? [])
    .filter(s => !q || s.client?.full_name.toLowerCase().includes(q))
    .slice(0, 5)
    .map(s => ({
      id: `session-${s.id}`,
      label: s.client?.full_name || 'Unknown',
      sublabel: new Date(s.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      href: `/sessions/${s.id}`,
      group: 'Sessions' as const,
    }))

  const results = [...clientResults, ...sessionResults]

  useEffect(() => {
    setSelected(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      navigate(results[selected].href)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const groups: Array<{ label: string; items: Result[]; icon: typeof Users }> = [
    { label: 'Clients', items: clientResults, icon: Users },
    { label: 'Sessions', items: sessionResults, icon: Calendar },
  ]

  let flatIndex = 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search clients, sessions..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline text-xs text-muted-foreground border rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No results found</p>
          ) : (
            groups.map(group => {
              if (group.items.length === 0) return null
              return (
                <div key={group.label}>
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <group.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{group.label}</span>
                  </div>
                  {group.items.map(item => {
                    const idx = flatIndex++
                    return (
                      <div
                        key={item.id}
                        onClick={() => { navigate(item.href); onClose() }}
                        onMouseEnter={() => setSelected(idx)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selected === idx ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          {item.sublabel && <p className="text-xs text-muted-foreground truncate">{item.sublabel}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div className="border-t px-4 py-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span><kbd className="border rounded px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="border rounded px-1">↵</kbd> Open</span>
          <span><kbd className="border rounded px-1">Esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
