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

      // Transform the API response to match our expected structure
      const assignments = response.data.data?.assignments || []
      const pagination = response.data.payload?.pagination || {}
      
      // Helper function to generate user-friendly package names
      const generatePackageName = (pkg: any) => {
        const assignedDate = new Date(pkg.assigned_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        const videoCount = pkg.total_assignments || 1
        const firstVideoTitle = pkg.assignments?.[0]?.video_title
        
        if (firstVideoTitle && videoCount === 1) {
          return firstVideoTitle
        } else if (firstVideoTitle && videoCount > 1) {
          return `${firstVideoTitle} + ${videoCount - 1} more`
        } else {
          return `Video Assignment - ${assignedDate}`
        }
      }

      // Transform each assignment package
      const packages = assignments.map((pkg: any) => ({
        package_id: pkg.package_id,
        package_name: generatePackageName(pkg), // Generate a user-friendly name
        videos: pkg.assignments.map((assignment: any) => ({
          assignment_id: assignment.assignment_id,
          package_id: assignment.package_id,
          video_id: assignment.video_id,
          video_title: assignment.video_title,
          video_description: undefined, // API doesn't provide description
          video_thumbnail: assignment.video_thumbnail,
          video_duration: assignment.video_duration,
          source: assignment.play_url?.includes('youtube') ? 1 : 2, // Determine source from play_url
          video_id_external: assignment.video_id, // Using video_id as external ID
          play_url: assignment.play_url,
          assigned_by: assignment.assigned_by,
          assigned_at: assignment.assigned_at,
          due_date: assignment.due_date,
          message_for_student: assignment.message_for_student,
          status: 1 // Default status since API doesn't provide it
        })),
        total_videos: pkg.total_assignments,
        assigned_at: pkg.assigned_at,
        due_date: pkg.due_date,
        message_for_student: pkg.message_for_student
      }))

      return {
        packages,
        total: pagination.total || assignments.length,
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