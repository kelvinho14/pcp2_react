import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Topic {
  id?: string
  topic_id?: string
  name: string
}

export interface ExerciseType {
  type_id: string
  name: string
  created_at?: string
}

export interface ExerciseFormData {
  title: string
  description: string
  selectedTags: Array<{
    id: string
    name: string
  }>
  type: string
  status?: number
  tags?: Array<{
    tag_id?: string
    name?: string
  }>
}

// Async thunks
export const createExercise = createAsyncThunk(
  'exercise/createExercise',
  async (exerciseData: ExerciseFormData) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises`)
      
      // Transform the data to match the required API format
      const payload = {
        title: exerciseData.title,
        description: exerciseData.description || '',
        tags: exerciseData.tags || [],
        type_id: exerciseData.type,
        status: exerciseData.status !== undefined ? exerciseData.status : 0
      }
      
      const response = await axios.post(
        `${API_URL}/exercises`,
        payload,
        { 
          headers,
          withCredentials: true 
        }
      )
      
      if (response.data.status === 'success') {
        toast.success('Exercise created successfully!', 'Success')
      } else {
        toast.error('Failed to create exercise. Please try again.', 'Error')
      }
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create exercise'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchTopics = createAsyncThunk(
  'exercise/fetchTopics',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercise/topiclist`)
      const response = await axios.get(`${API_URL}/exercise/topiclist`, { 
        headers,
        withCredentials: true 
      })
      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch topics'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchExerciseTypes = createAsyncThunk(
  'exercise/fetchExerciseTypes',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercise-types`)
      const response = await axios.get(`${API_URL}/exercise-types`, { 
        headers,
        withCredentials: true 
      })
      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch exercise types'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface ExerciseState {
  topics: Topic[]
  exerciseTypes: ExerciseType[]
  loading: boolean
  creating: boolean
  error: string | null
  success: string | null
}

const initialState: ExerciseState = {
  topics: [],
  exerciseTypes: [],
  loading: false,
  creating: false,
  error: null,
  success: null,
}

// Slice
const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = null
    },
    clearMessages: (state) => {
      state.error = null
      state.success = null
    },
  },
  extraReducers: (builder) => {
    // Create exercise
    builder
      .addCase(createExercise.pending, (state) => {
        state.creating = true
        state.error = null
        state.success = null
      })
      .addCase(createExercise.fulfilled, (state) => {
        state.creating = false
        state.success = 'Exercise created successfully'
      })
      .addCase(createExercise.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create exercise'
      })

    // Fetch topics
    builder
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false
        state.topics = action.payload
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch topics'
      })

    // Fetch exercise types
    builder
      .addCase(fetchExerciseTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExerciseTypes.fulfilled, (state, action) => {
        state.loading = false
        state.exerciseTypes = action.payload
      })
      .addCase(fetchExerciseTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch exercise types'
      })
  },
})

export const { clearError, clearSuccess, clearMessages } = exerciseSlice.actions
export default exerciseSlice.reducer 