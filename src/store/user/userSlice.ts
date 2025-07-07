import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
const API_URL = import.meta.env.VITE_APP_API_URL;

type FetchUsersParams = {
  page: number
  items_per_page: number
  sort?: string
  order?: string
  search?: string
  role?: string
  school?: string
  subject?: string
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, items_per_page, sort, order, search, role, school, subject }: FetchUsersParams) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search
    if (role) params.role = role
    if (school) params.school_id = school
    if (subject) params.subject_id = subject

    try {
      // For admin users, don't send school subject header
      const headers: Record<string, string> = {}
      const schoolSubjectId = sessionStorage.getItem('school_subject_id')
      const currentUserRole = sessionStorage.getItem('user_role')
      
      // Only add school subject header for non-admin users
      if (schoolSubjectId && currentUserRole !== '1') {
        headers['X-School-Subject-ID'] = schoolSubjectId
      }
      
      const response = await axios.get(API_URL+'/users', { 
        params, 
        headers,
        withCredentials: true 
      })
      
      console.log('🔍 fetchUsers response:', response.data)
      
      return {
        items: response.data.data,
        total: response.data.payload.pagination.total,
        roles: response.data.payload.roles || [],
      }
    } catch (error) {
      throw error
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (user: any) => {
    try {
      const response = await axios.put(`${API_URL}/user`, user, { withCredentials: true })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (user: any) => {
    try {
      const response = await axios.post(`${API_URL}/user/${user.user_id}`, user, { withCredentials: true })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string | number) => {
    try {
      await axios.delete(`${API_URL}/user/${userId}`, { withCredentials: true })
      return userId
    } catch (error) {
      throw error
    }
  }
)

export const deleteSelectedUsers = createAsyncThunk(
  'users/deleteSelectedUsers',
  async (userIds: Array<string | number>) => {
    try {
      await axios.delete(`${API_URL}/users`, {
        data: { user_ids: userIds },
        withCredentials: true
      })
      return userIds
    } catch (error) {
      throw error
    }
  }
)

export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (id: string | number) => {
    try {
      const response = await axios.get(`${API_URL}/user/${id}`, { withCredentials: true })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [] as any[],
    total: 0,
    loading: false,
    error: null as string | null,
    selectedUser: null as any,
    roles: [] as any[],
  },
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.items
        state.total = action.payload.total
        state.roles = action.payload.roles
        console.log('🔍 UserSlice - fetchUsers fulfilled, roles:', action.payload.roles)
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || null
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.user_id === action.payload.user_id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.user_id !== action.payload)
      })
      .addCase(deleteSelectedUsers.fulfilled, (state, action) => {
        state.users = state.users.filter(user => !action.payload.includes(user.user_id))
      })
  }
})

export const { clearSelectedUser } = userSlice.actions
export default userSlice.reducer
