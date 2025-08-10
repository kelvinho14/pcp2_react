import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../_metronic/helpers/axios'
import {toast} from '../../_metronic/helpers/toast'

const API_URL = import.meta.env.VITE_APP_API_URL

export interface AssignedVideo {
  assignment_id: string
  package_id: string
  student_id: string
  student_name: string
  video_id: string
  video_title: string
  video_thumbnail?: string
  assigned_by: string
  assigned_at: string
  due_date?: string
  message_for_student?: string
}

export interface VideoPackage {
  package_id: string
  assignments: AssignedVideo[]
  total_assignments: number
  unique_students: number
  unique_videos: number
  assigned_at: string
  due_date?: string
  message_for_student?: string
}

export interface AssignedVideosSummary {
  total: number
  total_packages: number
  total_assignments: number
  unique_students: number
  unique_videos: number
}

export interface AssignedVideosFilters {
  search?: string
  student_ids?: string  // Changed from assigned_to to student_ids for multi-select
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
  packages: VideoPackage[]
  summary: AssignedVideosSummary
  pagination: AssignedVideosPagination
  loading: boolean
  loadingFilters: boolean
  error: string | null
  filters: AssignedVideosFilters
  lastFetchTime: number | null
}

const initialState: AssignedVideosState = {
  packages: [],
  summary: {
    total: 0,
    total_packages: 0,
    total_assignments: 0,
    unique_students: 0,
    unique_videos: 0,
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

      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assignments`)
      const response = await axios.get(`${API_URL}/videos/assignments`, { 
        params, 
        headers,
        withCredentials: true 
      })
      
      return {
        packages: response.data.data?.assignments || [],
        summary: {
          total: response.data.payload?.pagination?.total || 0,
          total_packages: response.data.data?.assignments?.length || 0,
          total_assignments: response.data.summary?.total_assignment || 0,
          unique_students: response.data.summary?.unique_students || 0,
          unique_videos: response.data.summary?.unique_videos || 0,
        },
        pagination: {
          page: response.data.payload?.pagination?.page || 1,
          items_per_page: parseInt(response.data.payload?.pagination?.items_per_page) || 10,
          total: response.data.payload?.pagination?.total || 0,
          total_pages: response.data.payload?.pagination?.last_page || 1,
        },
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
      state.filters = action.payload
    },
    setLoadingFilters: (state, action) => {
      state.loadingFilters = action.payload
    },
    clearCache: (state) => {
      state.packages = []
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
        state.loadingFilters = false
        state.packages = action.payload.packages
        state.summary = action.payload.summary
        state.pagination = action.payload.pagination
        state.lastFetchTime = Date.now()
      })
      .addCase(fetchAssignedVideos.rejected, (state, action) => {
        state.loading = false
        state.loadingFilters = false
        state.error = action.error.message || 'Failed to fetch assigned videos'
      })
  },
})

export const { setPage, setFilters, setLoadingFilters, clearCache, clearError } = assignedVideosSlice.actions
export default assignedVideosSlice.reducer 