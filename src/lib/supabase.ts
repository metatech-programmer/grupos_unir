import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not defined. Check your .env.local file')
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Check your .env.local file')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Types
export interface User {
  id: string
  auth_id: string
  name: string
  email: string
  phone?: string
  country: string
  timezone: string
  work_status: string
  activities: string[]
  daily_hours: number
  availability_start: number
  availability_end: number
  created_at: string
  group_id?: string
}

export interface Group {
  id: string
  name: string
  subject: string
  created_by_auth?: string
  members: string[] // user IDs
  member_count: number
  max_size: number
  preferred_work_style: string
  required_daily_hours: number
  active_hours_start: number
  active_hours_end: number
  activity_focus: string[]
  created_at: string
  timezone_coverage: string[]
  pros: string[]
  cons: string[]
}

export interface GroupMember {
  user_id: string
  group_id: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  message: string
  created_at: string
}
