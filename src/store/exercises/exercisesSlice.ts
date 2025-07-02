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

export interface LinkedQuestion {
  question_id: string
  type: 'mc' | 'lq'
  name: string
  question_content: string
  teacher_remark: string
  created_at: string
  updated_at: string
  answer_content: string
  options?: string[]
  correct_option?: string
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
  async ({ page, items_per_page, sort, order, search, all }: {
    page: number
    items_per_page: number
    sort?: string
    order?: 'asc' | 'desc'
    search?: string
    all?: number
  }) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search
    if (all) params.all = all

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

export const linkQuestionsToExercises = createAsyncThunk(
  'exercises/linkQuestionsToExercises',
  async ({ questionIds, exerciseIds }: { questionIds: string[], exerciseIds: string[] }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/link-questions`)
      const response = await axios.post(
        `${API_URL}/exercises/link-questions`,
        {
          question_ids: questionIds,
          exercise_ids: exerciseIds
        },
        { 
          headers,
          withCredentials: true 
        }
      )
      
      if (response.data.status === 'success') {
        toast.success('Questions linked to exercises successfully!', 'Success')
      } else {
        toast.error('Failed to link questions to exercises. Please try again.', 'Error')
      }
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to link questions to exercises'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchExerciseWithQuestions = createAsyncThunk(
  'exercises/fetchExerciseWithQuestions',
  async (exerciseId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${exerciseId}`)
      const response = await axios.get(`${API_URL}/exercises/${exerciseId}`, { 
        headers,
        withCredentials: true 
      })
      return response.data.data || response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch exercise details'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateQuestionPositions = createAsyncThunk(
  'exercises/updateQuestionPositions',
  async ({ exerciseId, questionPositions }: { 
    exerciseId: string, 
    questionPositions: Array<{ question_id: string, new_position: number }> 
  }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/update-question-positions`)
      const response = await axios.put(
        `${API_URL}/exercises/update-question-positions`,
        {
          exercise_id: exerciseId,
          question_positions: questionPositions
        },
        { 
          headers,
          withCredentials: true 
        }
      )
      
      if (response.data.status === 'success') {
        toast.success('Question positions updated successfully!', 'Success')
      } else {
        toast.error('Failed to update question positions. Please try again.', 'Error')
      }
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update question positions'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const unlinkQuestions = createAsyncThunk(
  'exercises/unlinkQuestions',
  async ({ exerciseId, questionIds }: { exerciseId: string, questionIds: string[] }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/unlink-questions`)
      const response = await axios.delete(
        `${API_URL}/exercises/unlink-questions`,
        {
          data: {
            exercise_id: exerciseId,
            question_ids: questionIds
          },
          headers,
          withCredentials: true 
        }
      )
      
      if (response.data.status === 'success') {
        toast.success('Questions unlinked successfully!', 'Success')
      } else {
        toast.error('Failed to unlink questions. Please try again.', 'Error')
      }
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to unlink questions'
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
  linking: boolean
  updatingPositions: boolean
  unlinking: boolean
  currentExercise: Exercise | null
  linkedQuestions: LinkedQuestion[]
  fetchingExercise: boolean
}

const initialState: ExercisesState = {
  exercises: [],
  loading: false,
  error: null,
  total: 0,
  updating: false,
  linking: false,
  updatingPositions: false,
  unlinking: false,
  currentExercise: null,
  linkedQuestions: [],
  fetchingExercise: false,
}

// Slice
const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    removeLinkedQuestion: (state, action) => {
      const { questionId } = action.payload
      state.linkedQuestions = state.linkedQuestions.filter(q => q.question_id !== questionId)
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
      // Link questions to exercises
      .addCase(linkQuestionsToExercises.pending, (state) => {
        state.linking = true
        state.error = null
      })
      .addCase(linkQuestionsToExercises.fulfilled, (state) => {
        state.linking = false
      })
      .addCase(linkQuestionsToExercises.rejected, (state, action) => {
        state.linking = false
        state.error = action.error.message || 'Failed to link questions to exercises'
      })
      // Fetch exercise with questions
      .addCase(fetchExerciseWithQuestions.pending, (state) => {
        state.fetchingExercise = true
        state.error = null
      })
      .addCase(fetchExerciseWithQuestions.fulfilled, (state, action) => {
        state.fetchingExercise = false
        state.currentExercise = action.payload.exercise || action.payload
        state.linkedQuestions = action.payload.questions || action.payload.linked_questions || []
      })
      .addCase(fetchExerciseWithQuestions.rejected, (state, action) => {
        state.fetchingExercise = false
        state.error = action.error.message || 'Failed to fetch exercise details'
      })
      // Update question positions
      .addCase(updateQuestionPositions.pending, (state) => {
        state.updatingPositions = true
        state.error = null
      })
      .addCase(updateQuestionPositions.fulfilled, (state) => {
        state.updatingPositions = false
      })
      .addCase(updateQuestionPositions.rejected, (state, action) => {
        state.updatingPositions = false
        state.error = action.error.message || 'Failed to update question positions'
      })
      // Unlink questions
      .addCase(unlinkQuestions.pending, (state) => {
        state.unlinking = true
        state.error = null
      })
      .addCase(unlinkQuestions.fulfilled, (state) => {
        state.unlinking = false
      })
      .addCase(unlinkQuestions.rejected, (state, action) => {
        state.unlinking = false
        state.error = action.error.message || 'Failed to unlink questions'
      })
  },
})

export const { clearError, removeLinkedQuestion } = exercisesSlice.actions
export default exercisesSlice.reducer 