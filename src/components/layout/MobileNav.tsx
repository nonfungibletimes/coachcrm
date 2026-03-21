import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Bell, Settings, Menu, X, Zap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/sessions', icon: Calendar, label: 'Sessions' },
  { to: '/check-ins', icon: Bell, label: 'Check-ins' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-bold">CoachCRM</span>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {open && (
        <div className="absolute top-14 left-0 right-0 z-50 bg-card border-b shadow-lg p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3 mt-2" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />Sign out
          </Button>
        </div>
      )}
    </header>
  )
}
