import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Tag {
  id: string
  name: string
}

// Async thunks
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/tags`)
      const response = await axios.get(`${API_URL}/tags`, { 
        params: { all: 1 },
        headers,
        withCredentials: true 
      })
      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tags'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface TagsState {
  tags: Tag[]
  loading: boolean
  error: string | null
}

const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
}

// Slice
const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch tags
    builder
      .addCase(fetchTags.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false
        state.tags = action.payload
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tags'
      })
  },
})

export const { clearError } = tagsSlice.actions
export default tagsSlice.reducer 