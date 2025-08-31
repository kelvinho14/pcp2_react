import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Migration {
  log_id: string
  revision_id: string
  migration_file: string
  description: string
  execution_type: string
  execution_trigger: string
  started_at: string
  completed_at: string
  execution_time_ms: number
  success: boolean
  error_message: string
  executed_by: string
  application_version: string
  environment: string
  created_at: string
  duration_seconds: number
  status: string
  is_completed: boolean
}

export interface PaginationLink {
  url: string
  label: string
  active: boolean
}

export interface MigrationsPagination {
  page: number
  first_page_url: string
  from_: number
  last_page: number
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface MigrationsResponse {
  status: string
  data: Migration[]
  payload: {
    pagination: MigrationsPagination
  }
}

// Async thunk for fetching migrations
export const fetchMigrations = createAsyncThunk(
  'migrations/fetchMigrations',
  async ({ page, items_per_page, sort, order, search }: {
    page: number
    items_per_page: number
    sort?: string
    order?: 'asc' | 'desc'
    search?: string
  }) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search

    try {
      const response = await axios.get(`${API_URL}/admin/migrations/history`, { 
        params, 
        withCredentials: true 
      })
      return {
        items: response.data.data,
        total: response.data.payload.pagination.total,
        pagination: response.data.payload.pagination,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch migrations'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface MigrationsState {
  migrations: Migration[]
  loading: boolean
  error: string | null
  migrationsTotal: number
  pagination: MigrationsPagination | null
}

const initialState: MigrationsState = {
  migrations: [],
  loading: false,
  error: null,
  migrationsTotal: 0,
  pagination: null,
}

// Slice
const migrationsSlice = createSlice({
  name: 'migrations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch migrations
    builder
      .addCase(fetchMigrations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMigrations.fulfilled, (state, action) => {
        state.loading = false
        state.migrations = action.payload.items
        state.migrationsTotal = action.payload.total
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMigrations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch migrations'
      })
  },
})

export const { clearError } = migrationsSlice.actions

export default migrationsSlice.reducer

