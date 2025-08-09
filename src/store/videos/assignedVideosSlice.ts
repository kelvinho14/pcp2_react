import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../_metronic/helpers/axios'
import {toast} from '../../_metronic/helpers/toast'

const API_URL = import.meta.env.VITE_APP_API_URL

export interface AssignedVideo {
  id: string
  video_id: string
  video_title: string
  video_description?: string
  video_thumbnail?: string
  video_duration?: number
  video_source: 1 | 2 // 1 for YouTube, 2 for Vimeo
  video_play_url?: string
  assigned_by: string
  assigned_by_name: string
  assigned_to: string
  assigned_to_name: string
  assigned_to_email: string
  due_date?: string
  message_for_student?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  progress_percentage: number
  watched_duration?: number
  total_duration?: number
  assigned_at: string
  completed_at?: string
  last_watched_at?: string
}

export interface AssignedVideosSummary {
  total: number
  not_started: number
  in_progress: number
  completed: number
  overdue: number
}

export interface AssignedVideosFilters {
  search?: string
  status?: string
  assigned_by?: string
  assigned_to?: string
  due_date_from?: string
  due_date_to?: string
  assigned_date_from?: string
  assigned_date_to?: string
}

export interface AssignedVideosPagination {
  page: number
  items_per_page: number
  total: number
  total_pages: number
}

interface AssignedVideosState {
  videos: AssignedVideo[]
  summary: AssignedVideosSummary
  pagination: AssignedVideosPagination
  loading: boolean
  loadingFilters: boolean
  error: string | null
  filters: AssignedVideosFilters
  lastFetchTime: number | null
}

const initialState: AssignedVideosState = {
  videos: [],
  summary: {
    total: 0,
    not_started: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  },
  pagination: {
    page: 1,
    items_per_page: 10,
    total: 0,
    total_pages: 0,
  },
  loading: false,
  loadingFilters: false,
  error: null,
  filters: {},
  lastFetchTime: null,
}

export const fetchAssignedVideos = createAsyncThunk(
  'assignedVideos/fetchAssignedVideos',
  async ({ page, items_per_page, filters }: {
    page: number
    items_per_page: number
    filters?: AssignedVideosFilters
  }) => {
    try {
      const params: any = { page, items_per_page }
      
      // Add filters to params
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params[key] = value
          }
        })
      }

      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assigned`)
      const response = await axios.get(`${API_URL}/videos/assigned`, { 
        params, 
        headers,
        withCredentials: true 
      })
      
      return {
        videos: response.data.data || [],
        summary: response.data.summary || initialState.summary,
        pagination: response.data.pagination || initialState.pagination,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch assigned videos'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

const assignedVideosSlice = createSlice({
  name: 'assignedVideos',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoadingFilters: (state, action) => {
      state.loadingFilters = action.payload
    },
    clearCache: (state) => {
      state.videos = []
      state.lastFetchTime = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedVideos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAssignedVideos.fulfilled, (state, action) => {
        state.loading = false
        state.videos = action.payload.videos
        state.summary = action.payload.summary
        state.pagination = action.payload.pagination
        state.lastFetchTime = Date.now()
      })
      .addCase(fetchAssignedVideos.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch assigned videos'
      })
  },
})

export const { setPage, setFilters, setLoadingFilters, clearCache, clearError } = assignedVideosSlice.actions
export default assignedVideosSlice.reducer 