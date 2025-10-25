import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
import { QUESTION_VISIBILITY } from '../../app/constants/questionVisibility'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface PracticeQuestionItem {
  q_id: string
  question_content: string
  type: 'mc' | 'lq' | 'tf'
  teacher_remark: string | null
  is_ai_generated: boolean
  source_question_id?: string
  teacher_verification_status?: number
  ai_generation_metadata?: {
    difficulty?: string
  }
  created_at: string
  mc_question?: {
    options: Array<{
      option_letter: string
      option_text: string
    }>
    correct_option: string
    answer_content?: string
  }
  lq_question?: {
    answer_content: string
  }
}

export interface Pagination {
  page: number
  first_page_url: string
  from: number
  last_page: number
  links: Array<{
    url: string
    label: string
    active: boolean
    page: number
  }>
  next_page_url: string | null
  items_per_page: string
  prev_page_url: string | null
  to: number
  total: number
}

interface PracticeQuestionsState {
  questions: PracticeQuestionItem[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
}

const initialState: PracticeQuestionsState = {
  questions: [],
  pagination: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchPracticeQuestions = createAsyncThunk(
  'practiceQuestions/fetchPracticeQuestions',
  async ({ page, sort, order, search, sourceQuestionId }: { 
    page?: number; 
    sort?: string; 
    order?: 'asc' | 'desc'; 
    search?: string;
    sourceQuestionId?: string;
  }) => {
    try {
      const params: any = {
        page: page || 1,
        items_per_page: 10,
        is_ai_generated: 1,
        visibility: QUESTION_VISIBILITY.PRIVATE,
      }
      
      if (sort) params.sort = sort
      if (order) params.order = order
      if (search) params.search = search
      if (sourceQuestionId) params.source_question_id = sourceQuestionId
      
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions`)
      const response = await axios.get(
        `${API_URL}/questions`,
        {
          params,
          headers,
          withCredentials: true,
        }
      )
      
      // Transform response to match expected format
      return {
        items: response.data.data,
        pagination: response.data.payload.pagination,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load practice questions'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Slice
const practiceQuestionsSlice = createSlice({
  name: 'practiceQuestions',
  initialState,
  reducers: {
    clearPracticeQuestions: (state) => {
      state.questions = []
      state.pagination = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch practice questions
      .addCase(fetchPracticeQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPracticeQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.questions = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchPracticeQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load practice questions'
      })
  },
})

export const { clearPracticeQuestions } = practiceQuestionsSlice.actions
export default practiceQuestionsSlice.reducer

