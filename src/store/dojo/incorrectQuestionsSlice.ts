import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface MCOption {
  option_letter: string
  option_text: string
}

export interface IncorrectQuestionItem {
  question_id: string
  question_content: string
  question_type: 'mc' | 'lq' | 'tf'
  teacher_remark?: string | null
  answered_at: string
  generation_count: number
  mc_options?: MCOption[]
  correct_answer?: string
  student_answer?: string
}

export interface Exercise {
  exercise_id: string
  assignment_id: string
  title: string
}

export interface Tag {
  tag_id: string
  name: string
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

interface IncorrectQuestionsState {
  questions: IncorrectQuestionItem[]
  exercises: Exercise[]
  tags: Tag[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
}

const initialState: IncorrectQuestionsState = {
  questions: [],
  exercises: [],
  tags: [],
  pagination: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchIncorrectQuestions = createAsyncThunk(
  'incorrectQuestions/fetchIncorrectQuestions',
  async ({ page, sort, order, search, assignment_ids, tag_ids, logic }: { 
    page?: number; 
    sort?: string; 
    order?: 'asc' | 'desc'; 
    search?: string; 
    assignment_ids?: string[];
    tag_ids?: string[];
    logic?: 'and' | 'or';
  }) => {
    try {
      const params: any = {
        page: page || 1,
      }
      
      if (sort) params.sort = sort
      if (order) params.order = order
      if (search) params.search = search
      if (logic) params.logic = logic
      
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/student-exercises/incorrect-questions`)
      
      // Build URL with multiple assignment_ids and tag_ids
      let url = `${API_URL}/exercises/student-exercises/incorrect-questions`
      const queryParams: string[] = []
      
      if (assignment_ids && assignment_ids.length > 0) {
        queryParams.push(...assignment_ids.map(id => `assignment_ids=${id}`))
      }
      
      if (tag_ids && tag_ids.length > 0) {
        queryParams.push(...tag_ids.map(id => `tag_ids=${id}`))
      }
      
      if (queryParams.length > 0) {
        url = `${url}?${queryParams.join('&')}`
      }
      
      const response = await axios.get(url, {
        params,
        headers,
        withCredentials: true,
      })
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load incorrect questions'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Slice
const incorrectQuestionsSlice = createSlice({
  name: 'incorrectQuestions',
  initialState,
  reducers: {
    clearIncorrectQuestions: (state) => {
      state.questions = []
      state.pagination = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch incorrect questions
      .addCase(fetchIncorrectQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIncorrectQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.questions = action.payload.items
        state.exercises = action.payload.exercises || []
        state.tags = action.payload.tags || []
        state.pagination = action.payload.pagination
      })
      .addCase(fetchIncorrectQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load incorrect questions'
      })
  },
})

export const { clearIncorrectQuestions } = incorrectQuestionsSlice.actions
export default incorrectQuestionsSlice.reducer

