import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { CheckIn } from '@/types'

export function useCheckIns() {
  return useQuery({
    queryKey: ['check_ins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*, client:clients(id, full_name, email, status)')
        .order('scheduled_at', { ascending: false })
      if (error) throw error
      return data as CheckIn[]
    },
  })
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (checkIn: Omit<CheckIn, 'id' | 'coach_id' | 'created_at' | 'client'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('check_ins')
        .insert({ ...checkIn, coach_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check_ins'] })
      toast.success('Check-in scheduled')
    },
    onError: () => toast.error('Failed to schedule check-in'),
  })
}

export function useUpdateCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CheckIn> & { id: string }) => {
      const { data, error } = await supabase
        .from('check_ins')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check_ins'] })
    },
    onError: () => toast.error('Failed to update check-in'),
  })
}

export function useDeleteCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('check_ins').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check_ins'] })
      toast.success('Check-in deleted')
    },
    onError: () => toast.error('Failed to delete check-in'),
  })
}
