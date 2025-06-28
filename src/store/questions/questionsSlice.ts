import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface LQQuestion {
  answer_content: string
}

export interface MCOption {
  option_letter: string
  is_correct: boolean
}

export interface MCQuestion {
  options: MCOption[]
  correct_option: string
  answer_content?: string
}

export interface QuestionFormData {
  type: 'lq' | 'mc'
  name?: string
  question_content: string
  teacher_remark?: string
  lq_question?: LQQuestion
  mc_question?: MCQuestion
  tags?: Array<{ tag_id?: string; name?: string; score?: number }>
}

export interface Question {
  q_id: string
  name: string
  type: string
  question_content: string
  teacher_remark?: string
  lq_question?: LQQuestion
  mc_question?: MCQuestion
  tag_ids?: string[]
  tags?: Array<{ tag_id?: string; name?: string; score?: number }>
  created_at?: string
  updated_at?: string
}

// Async thunks
export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData: QuestionFormData) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions`)
      const response = await axios.post(`${API_URL}/questions`, questionData, { 
        headers,
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create question'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async ({ page, items_per_page, sort, order, search, type }: {
    page: number
    items_per_page: number
    sort?: string
    order?: 'asc' | 'desc'
    search?: string
    type?: 'lq' | 'mc'
  }) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search
    if (type) params.type = type

    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions`)
      const response = await axios.get(`${API_URL}/questions`, { 
        params, 
        headers,
        withCredentials: true 
      })
      return {
        items: response.data.data,
        total: response.data.payload.pagination.total,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch questions'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (qId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions/${qId}`)
      const response = await axios.get(`${API_URL}/questions/${qId}`, { 
        headers,
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch question'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateQuestion = createAsyncThunk(
  'questions/updateQuestion',
  async ({ qId, questionData }: { qId: string; questionData: Partial<QuestionFormData> }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions/${qId}`)
      const response = await axios.put(`${API_URL}/questions/${qId}`, questionData, { 
        headers,
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update question'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (qId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions/${qId}`)
      await axios.delete(`${API_URL}/questions/${qId}`, { 
        headers,
        withCredentials: true 
      })
      return qId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete question'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const bulkDeleteQuestions = createAsyncThunk(
  'questions/bulkDeleteQuestions',
  async (questionIds: string[]) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions`)
      await axios.delete(`${API_URL}/questions`, { 
        headers,
        withCredentials: true,
        data: { question_ids: questionIds }
      })
      return questionIds
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete questions'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface QuestionsState {
  questions: Question[]
  currentQuestion: Question | null
  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  error: string | null
  success: string | null
  total: number
}

const initialState: QuestionsState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  success: null,
  total: 0,
}

// Slice
const questionsSlice = createSlice({
  name: 'questions',
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
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null
    },
  },
  extraReducers: (builder) => {
    // Create question
    builder
      .addCase(createQuestion.pending, (state) => {
        state.creating = true
        state.error = null
        state.success = null
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.creating = false
        state.questions.push(action.payload)
        state.success = 'Question created successfully'
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create question'
      })

    // Fetch questions
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.questions = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch questions'
      })

    // Fetch question by ID
    builder
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false
        state.currentQuestion = action.payload
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch question'
      })

    // Update question
    builder
      .addCase(updateQuestion.pending, (state) => {
        state.updating = true
        state.error = null
        state.success = null
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.updating = false
        state.currentQuestion = action.payload
        state.success = 'Question updated successfully'
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update question'
      })

    // Delete question
    builder
      .addCase(deleteQuestion.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.deleting = false
        state.questions = state.questions.filter((q) => q.q_id !== action.payload)
        state.success = 'Question deleted successfully'
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete question'
      })

    // Bulk delete questions
    builder
      .addCase(bulkDeleteQuestions.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(bulkDeleteQuestions.fulfilled, (state, action) => {
        state.deleting = false
        state.questions = state.questions.filter((q) => !action.payload.includes(q.q_id))
        state.success = 'Questions deleted successfully'
      })
      .addCase(bulkDeleteQuestions.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete questions'
      })
  },
})

export const { 
  clearError, 
  clearSuccess, 
  clearMessages, 
  clearCurrentQuestion 
} = questionsSlice.actions

export default questionsSlice.reducer 