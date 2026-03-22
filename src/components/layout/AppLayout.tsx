import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { CommandPalette } from '@/components/CommandPalette'

export function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}
