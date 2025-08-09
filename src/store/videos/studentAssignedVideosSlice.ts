import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface StudentAssignedVideo {
  assignment_id: string
  package_id: string
  video_id: string
  video_title: string
  video_description?: string
  video_thumbnail?: string
  video_duration?: number
  source: 1 | 2 // 1 for YouTube, 2 for Vimeo
  video_id_external: string
  play_url?: string
  assigned_by: string
  assigned_at: string
  due_date?: string
  message_for_student?: string
  status: number
}

export interface StudentVideoPackage {
  package_id: string
  package_name?: string
  videos: StudentAssignedVideo[]
  total_videos: number
  assigned_at: string
  due_date?: string
  message_for_student?: string
}

interface StudentAssignedVideosState {
  packages: StudentVideoPackage[]
  loading: boolean
  error: string | null
  total: number
}

const initialState: StudentAssignedVideosState = {
  packages: [],
  loading: false,
  error: null,
  total: 0,
}

// Async thunk to fetch student's assigned video packages
export const fetchStudentAssignedVideos = createAsyncThunk(
  'studentAssignedVideos/fetchStudentAssignedVideos',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assigned`)
      const response = await axios.get(`${API_URL}/videos/assigned`, {
        headers,
        withCredentials: true
      })

      return {
        packages: response.data.data?.packages || [],
        total: response.data.data?.total || 0,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch assigned videos'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

const studentAssignedVideosSlice = createSlice({
  name: 'studentAssignedVideos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessages: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentAssignedVideos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStudentAssignedVideos.fulfilled, (state, action) => {
        state.loading = false
        state.packages = action.payload.packages
        state.total = action.payload.total
      })
      .addCase(fetchStudentAssignedVideos.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch assigned videos'
      })
  },
})

export const { clearError, clearMessages } = studentAssignedVideosSlice.actions
export default studentAssignedVideosSlice.reducer 