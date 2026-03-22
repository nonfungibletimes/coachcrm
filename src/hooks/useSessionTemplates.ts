import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface SessionTemplate {
  id: string
  coach_id: string
  name: string
  type: 'discovery' | 'strategy' | 'accountability' | 'goal-review' | 'weekly-checkin' | 'custom'
  duration_minutes: number
  notes_template?: string
  homework_template?: { id: string; task: string; completed: boolean }[]
  created_at: string
}

const defaultTemplates: Omit<SessionTemplate, 'id' | 'coach_id' | 'created_at'>[] = [
  { name: 'Discovery Call', type: 'discovery', duration_minutes: 60, notes_template: 'Discuss goals, current state, and fit.' },
  { name: 'Weekly Check-In', type: 'weekly-checkin', duration_minutes: 45, notes_template: 'Review wins, blockers, and weekly commitments.' },
  { name: 'Goal Review', type: 'goal-review', duration_minutes: 60, notes_template: 'Assess progress and adjust action plan.' },
]

export function useSessionTemplates() {
  return useQuery({
    queryKey: ['session_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_templates')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as SessionTemplate[]
    },
  })
}

export function useEnsureDefaultTemplates() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('session_templates').select('id').eq('coach_id', user.id).limit(1)
      if (data && data.length > 0) return
      await supabase.from('session_templates').insert(defaultTemplates.map(t => ({ ...t, coach_id: user.id })))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session_templates'] }),
  })
}
