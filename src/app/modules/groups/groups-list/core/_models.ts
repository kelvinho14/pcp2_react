export interface Group {
  group_id: string
  name: string
  description?: string
  user_ids?: string[]
  students?: Array<{
    user_id: string
    name: string
    email: string
  }>
  member_count?: number
  created_at: string
  updated_at: string
} 