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
  role_type?: string
  school?: string
  subject?: string
}

type School = {
  school_id: string
  name: string
  code: string
}

type Subject = {
  id: string
  subject_id: string
  name: string
  custom_name: string | null
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, items_per_page, sort, order, search, role, role_type, school, subject }: FetchUsersParams) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search
    if (role) params.role = role
    if (role_type) params.role_type = role_type
    if (school) params.school_id = school
    if (subject) params.subject_id = subject

    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/users`)
      
      const response = await axios.get(API_URL+'/users', { 
        params, 
        headers,
        withCredentials: true 
      })
      
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
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user`)
      const response = await axios.put(`${API_URL}/user`, user, { 
        headers,
        withCredentials: true 
      })
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
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user/${user.user_id}`)
      const response = await axios.post(`${API_URL}/user/${user.user_id}`, user, { 
        headers,
        withCredentials: true 
      })
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
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user/${userId}`)
      await axios.delete(`${API_URL}/user/${userId}`, { 
        headers,
        withCredentials: true 
      })
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
      const headers = getHeadersWithSchoolSubject(`${API_URL}/users`)
      await axios.delete(`${API_URL}/users`, {
        data: { user_ids: userIds },
        headers,
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
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user/${id}`)
      const response = await axios.get(`${API_URL}/user/${id}`, { 
        headers,
        withCredentials: true 
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

export const fetchSchools = createAsyncThunk(
  'users/fetchSchools',
  async () => {
    try {
      const response = await axios.get(`${API_URL}/schools`, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

export const fetchSubjects = createAsyncThunk(
  'users/fetchSubjects',
  async (schoolId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/subjects/school-subjects/`)
      const response = await axios.get(`${API_URL}/subjects/school-subjects/?school_id=${schoolId}&all=1`, { 
        headers,
        withCredentials: true 
      })
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
    schools: [] as School[],
    subjects: [] as Subject[],
    schoolsLoading: false,
    subjectsLoading: false,
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
      .addCase(fetchSchools.pending, (state) => {
        state.schoolsLoading = true
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.schoolsLoading = false
        state.schools = action.payload
      })
      .addCase(fetchSchools.rejected, (state) => {
        state.schoolsLoading = false
      })
      .addCase(fetchSubjects.pending, (state) => {
        state.subjectsLoading = true
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.subjectsLoading = false
        state.subjects = action.payload
      })
      .addCase(fetchSubjects.rejected, (state) => {
        state.subjectsLoading = false
      })
  }
})

export const { clearSelectedUser } = userSlice.actions
export default userSlice.reducer
