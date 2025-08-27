import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
const API_URL = import.meta.env.VITE_APP_API_URL

interface Group {
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

interface CreateGroupData {
  name: string
  description?: string
  user_ids?: string[]
}

interface UpdateGroupData extends CreateGroupData {
  group_id: string
}

// Create group
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: CreateGroupData) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user-groups`)
      const response = await axios.post(`${API_URL}/user-groups`, groupData, {
        headers,
        withCredentials: true
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

// Update group
export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async (groupData: UpdateGroupData) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user-groups/${groupData.group_id}`)
      const response = await axios.put(`${API_URL}/user-groups/${groupData.group_id}`, groupData, {
        headers,
        withCredentials: true
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

// Delete group
export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user-groups/${groupId}`)
      await axios.delete(`${API_URL}/user-groups/${groupId}`, {
        headers,
        withCredentials: true
      })
      return groupId
    } catch (error) {
      throw error
    }
  }
)

// Delete selected groups
export const deleteSelectedGroups = createAsyncThunk(
  'groups/deleteSelectedGroups',
  async (groupIds: Array<string>) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user-groups`)
      await axios.delete(`${API_URL}/user-groups`, {
        data: { group_ids: groupIds },
        headers,
        withCredentials: true
      })
      return groupIds
    } catch (error) {
      throw error
    }
  }
)

// Fetch groups
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (params?: {
    page?: number
    items_per_page?: number
    sort?: string
    order?: string
    search?: string
  }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.items_per_page) queryParams.append('items_per_page', params.items_per_page.toString())
      if (params?.sort) queryParams.append('sort', params.sort)
      if (params?.order) queryParams.append('order', params.order)
      if (params?.search) queryParams.append('search', params.search)

      const headers = getHeadersWithSchoolSubject(`${API_URL}/user-groups`)
      const response = await axios.get(`${API_URL}/user-groups?${queryParams}`, {
        headers,
        withCredentials: true
      })
      return {
        items: response.data.data,
        total: response.data.payload?.pagination?.total || response.data.data?.length || 0,
      }
    } catch (error) {
      throw error
    }
  }
)

// Fetch single group
export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/user-groups/${groupId}`)
      const response = await axios.get(`${API_URL}/user-groups/${groupId}`, {
        headers,
        withCredentials: true
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }
)

const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [] as Group[],
    selectedGroup: null as Group | null,
    loading: false,
    error: null as string | null,
    creating: false,
    updating: false,
    deleting: false,
    total: 0,
  },
  reducers: {
    clearSelectedGroup: (state) => {
      state.selectedGroup = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.creating = false
        state.groups.push(action.payload)
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create group'
      })
      // Update group
      .addCase(updateGroup.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.updating = false
        const index = state.groups.findIndex(group => group.group_id === action.payload.group_id)
        if (index !== -1) {
          state.groups[index] = action.payload
        }
        if (state.selectedGroup?.group_id === action.payload.group_id) {
          state.selectedGroup = action.payload
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update group'
      })
      // Delete group
      .addCase(deleteGroup.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.deleting = false
        state.groups = state.groups.filter(group => group.group_id !== action.payload)
        if (state.selectedGroup?.group_id === action.payload) {
          state.selectedGroup = null
        }
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete group'
      })
      // Delete selected groups
      .addCase(deleteSelectedGroups.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteSelectedGroups.fulfilled, (state, action) => {
        state.deleting = false
        state.groups = state.groups.filter(group => !action.payload.includes(group.group_id))
        if (state.selectedGroup && action.payload.includes(state.selectedGroup.group_id)) {
          state.selectedGroup = null
        }
      })
      .addCase(deleteSelectedGroups.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete selected groups'
      })
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false
        state.groups = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch groups'
      })
      // Fetch single group
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedGroup = action.payload
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch group'
      })
  }
})

export const { clearSelectedGroup, clearError } = groupsSlice.actions
export default groupsSlice.reducer 