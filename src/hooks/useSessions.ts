import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types'

export function useSessions(clientId?: string) {
  return useQuery({
    queryKey: ['sessions', clientId],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select('*, client:clients(id, full_name, email, status)')
        .order('scheduled_at', { ascending: false })
      if (clientId) query = query.eq('client_id', clientId)
      const { data, error } = await query
      if (error) throw error
      return data as Session[]
    },
  })
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['sessions', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, client:clients(id, full_name, email, status)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Session
    },
    enabled: !!id,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (session: Omit<Session, 'id' | 'coach_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('sessions')
        .insert({ ...session, coach_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Session> & { id: string }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}
