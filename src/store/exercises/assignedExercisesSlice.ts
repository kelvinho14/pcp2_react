import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API_URL

export interface Assignment {
  assignment_id: string
  student: {
    id: string
    name: string
    email: string
  }
  due_date: string
  message_for_student: string
  status: string
  assigned_at: string
  assigned_by: {
    id: string
    name: string
    email: string
  }
}

export interface AssignedExercise {
  id: string
  title: string
  question_no: number
  status: string
  progress: number
  student_stats: {
    total: number
    completed: number
    in_progress: number
    not_started: number
    overdue: number
  }
  assignments: Assignment[]
  created_at: string
  updated_at: string
}

export interface AssignedExercisesFilters {
  due_from?: string
  due_to?: string
  assigned_from?: string
  assigned_to?: string
  student_ids?: string
  search?: string
  status?: string
  order_by?: 'due_date' | 'assigned_date' | 'title' | 'progress'
  order?: 'asc' | 'desc'
}

export interface AssignedExercisesResponse {
  success: boolean
  data: {
    summary: {
      total: number
      completed: number
      in_progress: number
      not_started: number
      overdue: number
    }
    exercises: AssignedExercise[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      total_pages: number
    }
  }
}

interface AssignedExercisesState {
  exercises: AssignedExercise[]
  summary: {
    total: number
    completed: number
    in_progress: number
    not_started: number
    overdue: number
  }
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  filters: AssignedExercisesFilters
  filtersCollapsed: boolean
  loading: boolean
  loadingFilters: boolean // Separate loading state for filter changes
  error: string | null
  lastFetchTime: number | null
  cache: {
    [key: string]: {
      data: any
      timestamp: number
    }
  }
}

const initialState: AssignedExercisesState = {
  exercises: [],
  summary: {
    total: 0,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    overdue: 0
  },
  pagination: {
    current_page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0
  },
  filters: {
    order_by: 'due_date',
    order: 'asc'
  },
  filtersCollapsed: true,
  loading: false,
  loadingFilters: false,
  error: null,
  lastFetchTime: null,
  cache: {}
}

// Helper function to generate cache key
const generateCacheKey = (filters: AssignedExercisesFilters, page: number, limit: number) => {
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      if (filters[key as keyof AssignedExercisesFilters] !== undefined) {
        acc[key] = filters[key as keyof AssignedExercisesFilters]
      }
      return acc
    }, {} as any)
  
  return JSON.stringify({ filters: sortedFilters, page, limit })
}

// Helper function to check if cache is valid (5 minutes)
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < 5 * 60 * 1000 // 5 minutes
}

export const fetchAssignedExercises = createAsyncThunk(
  'assignedExercises/fetch',
  async (filters: AssignedExercisesFilters, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any
      const { current_page, per_page } = state.assignedExercises.pagination
      
      // Check cache first
      const cacheKey = generateCacheKey(filters, current_page, per_page)
      const cachedData = state.assignedExercises.cache[cacheKey]
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        console.log('📦 Using cached data for assigned exercises')
        return cachedData.data
      }
      
      const headers = getHeadersWithSchoolSubject(`${API_URL}/student-exercises/exercises/assigned`)
      
      // Build query parameters - combine filters and pagination
      const params = new URLSearchParams()
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      // Add pagination parameters
      params.append('page', current_page.toString())
      params.append('limit', per_page.toString())

      const response = await axios.get(`${API_URL}/student-exercises/exercises/assigned?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })

      const responseData = response.data.data
      
      // Cache the response
      return {
        ...responseData,
        _cacheKey: cacheKey
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned exercises')
    }
  }
)

const assignedExercisesSlice = createSlice({
  name: 'assignedExercises',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AssignedExercisesFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      // Reset to first page when filters change
      state.pagination.current_page = 1
    },
    clearFilters: (state) => {
      state.filters = {
        order_by: 'due_date',
        order: 'asc'
      }
      state.pagination.current_page = 1
      // Clear cache when filters are reset
      state.cache = {}
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.current_page = action.payload
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload
      state.pagination.current_page = 1 // Reset to first page when searching
    },
    toggleFiltersCollapsed: (state) => {
      state.filtersCollapsed = !state.filtersCollapsed
    },
    clearCache: (state) => {
      state.cache = {}
    },
    setLoadingFilters: (state, action: PayloadAction<boolean>) => {
      state.loadingFilters = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedExercises.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAssignedExercises.fulfilled, (state, action) => {
        state.loading = false
        state.loadingFilters = false
        state.exercises = action.payload.exercises
        state.summary = action.payload.summary
        state.pagination = action.payload.pagination
        state.lastFetchTime = Date.now()
        
        // Cache the response
        if (action.payload._cacheKey) {
          state.cache[action.payload._cacheKey] = {
            data: {
              exercises: action.payload.exercises,
              summary: action.payload.summary,
              pagination: action.payload.pagination
            },
            timestamp: Date.now()
          }
        }
      })
      .addCase(fetchAssignedExercises.rejected, (state, action) => {
        state.loading = false
        state.loadingFilters = false
        state.error = action.payload as string
      })
  }
})

export const { 
  setFilters, 
  clearFilters, 
  setPage, 
  setSearch, 
  toggleFiltersCollapsed, 
  clearCache,
  setLoadingFilters 
} = assignedExercisesSlice.actions
export default assignedExercisesSlice.reducer 