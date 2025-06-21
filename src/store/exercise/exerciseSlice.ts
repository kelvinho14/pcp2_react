import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Topic {
  id: string
  name: string
}

export interface ExerciseType {
  id: string
  name: string
}

export interface ExerciseFormData {
  name: string
  description: string
  topicIds: string[]
  exerciseTypeId: string
}

// Async thunks
export const createExercise = createAsyncThunk(
  'exercise/createExercise',
  async (exerciseData: ExerciseFormData) => {
    try {
      const response = await axios.post(
        `${API_URL}/exercises`,
        exerciseData,
        { withCredentials: true }
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
      const response = await axios.get(`${API_URL}/exercise/topiclist`, { 
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
      const response = await axios.get(`${API_URL}/exercise/type`, { 
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
  topics: [
    { id: '1', name: 'Mathematics' },
    { id: '2', name: 'Physics' },
    { id: '3', name: 'Chemistry' },
    { id: '4', name: 'Biology' },
    { id: '5', name: 'Computer Science' },
    { id: '6', name: 'English Literature' },
    { id: '7', name: 'History' },
    { id: '8', name: 'Geography' },
    { id: '9', name: 'Economics' },
    { id: '10', name: 'Psychology' },
  ],
  exerciseTypes: [
    { id: '1', name: 'Multiple Choice' },
    { id: '2', name: 'True/False' },
    { id: '3', name: 'Short Answer' },
    { id: '4', name: 'Essay' },
    { id: '5', name: 'Problem Solving' },
    { id: '6', name: 'Fill in the Blanks' },
    { id: '7', name: 'Matching' },
    { id: '8', name: 'Coding Exercise' },
  ],
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