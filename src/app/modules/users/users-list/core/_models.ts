import {ID, Response} from '../../../../../_metronic/helpers'

export type UserSubject = {
  user_subject_id: string
  school_subject_id: string
  school_id: string
  subject_name: string
  role_id: string
  role: {
    role_id: string
    name: string
    role_type: number
  }
  status: number
  created_at: string
  updated_at: string
}

export type User = {
  user_id?: ID
  name?: string
  avatar?: string
  email?: string
  position?: string
  role?: string
  last_login?: string
  lastseen_at?: string
  two_steps?: boolean
  joined_day?: string
  online?: boolean
  status?: number
  user_subjects?: UserSubject[]
  initials?: {
    label: string
    state: string
  }
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  avatar: 'avatars/300-6.jpg',
  position: 'Art Director',
  role: 'Administrator',
  name: '',
  email: '',
}
