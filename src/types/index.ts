export interface Coach {
  id: string
  full_name: string
  email: string
  coaching_niche?: string
  avatar_url?: string
  stripe_customer_id?: string
  plan: 'free' | 'starter' | 'pro' | 'agency'
  onboarding_complete: boolean
  created_at: string
}

export interface Client {
  id: string
  coach_id: string
  full_name: string
  email?: string
  phone?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  package?: string
  goals: Goal[]
  notes?: string
  started_at: string
  created_at: string
}

export interface Goal {
  id: string
  text: string
  completed: boolean
}

export interface HomeworkItem {
  id: string
  task: string
  due_date?: string
  completed: boolean
}

export interface Session {
  id: string
  coach_id: string
  client_id: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  template?: 'discovery' | 'strategy' | 'accountability' | 'custom'
  notes?: string
  wins?: string
  blocks?: string
  homework: HomeworkItem[]
  recap_sent: boolean
  created_at: string
  client?: Client
}

export interface CheckIn {
  id: string
  coach_id: string
  client_id: string
  scheduled_at: string
  sent_at?: string
  status: 'pending' | 'sent' | 'responded'
  message?: string
  response?: string
  created_at: string
  client?: Client
}

export interface ProgressSnapshot {
  id: string
  client_id: string
  week_of: string
  sessions_completed: number
  homework_completion_pct: number
  coach_notes?: string
  client_mood?: string
  created_at: string
}
