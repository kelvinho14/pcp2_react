import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface ExerciseType {
  type_id: string
  name: string
  created_at: string
}

export interface Exercise {
  exercise_id: string
  title: string
  description: string
  type_id: string
  exercise_type: ExerciseType
  status: number
  school_subject_id: string
  created_at: string
  updated_at: string
  question_count: number
}

export interface ExerciseFormData {
  title: string
  description: string
  topic_ids: string[]
  type: string
  status?: number
}

// Async thunks
export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
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
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises`)
      const response = await axios.get(`${API_URL}/exercises`, { 
        params, 
        headers,
        withCredentials: true 
      })
      return {
        items: response.data.data,
        total: response.data.payload?.pagination?.total || response.data.total || 0,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch exercises'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateExercise = createAsyncThunk(
  'exercises/updateExercise',
  async ({ exerciseId, data }: { exerciseId: string; data: ExerciseFormData }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${exerciseId}`)
      
      // Transform the data to match the required API format
      const payload = {
        title: data.title,
        description: data.description || '',
        topic_ids: data.topic_ids || [],
        type_id: data.type,
        status: data.status || 0
      }
      
      const response = await axios.put(
        `${API_URL}/exercises/${exerciseId}`,
        payload,
        { 
          headers,
          withCredentials: true 
        }
      )
      
      if (response.data.status === 'success') {
        toast.success('Exercise updated successfully!', 'Success')
      } else {
        toast.error('Failed to update exercise. Please try again.', 'Error')
      }
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update exercise'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const deleteExercise = createAsyncThunk(
  'exercises/deleteExercise',
  async (exerciseId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${exerciseId}`)
      await axios.delete(`${API_URL}/exercises/${exerciseId}`, { 
        headers,
        withCredentials: true 
      })
      return exerciseId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete exercise'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface ExercisesState {
  exercises: Exercise[]
  loading: boolean
  error: string | null
  total: number
  updating: boolean
}

const initialState: ExercisesState = {
  exercises: [],
  loading: false,
  error: null,
  total: 0,
  updating: false,
}

// Slice
const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch exercises
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.loading = false
        state.exercises = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch exercises'
      })
      // Update exercise
      .addCase(updateExercise.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateExercise.fulfilled, (state) => {
        state.updating = false
      })
      .addCase(updateExercise.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update exercise'
      })
      // Delete exercise
      .addCase(deleteExercise.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExercise.fulfilled, (state, action) => {
        state.loading = false
        state.exercises = state.exercises.filter(exercise => exercise.exercise_id !== action.payload)
      })
      .addCase(deleteExercise.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete exercise'
      })
  },
})

export const { clearError } = exercisesSlice.actions
export default exercisesSlice.reducer 