import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
import { QUESTION_VISIBILITY } from '../../app/constants/questionVisibility'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface LQQuestion {
  answer_content: string
  rubric_content?: string | { include: string; exclude: string }
}

export interface MCOption {
  option_letter: string
  option_text: string
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
  question_id?: string // ID generated from image uploads
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
  is_assigned?: number
  is_ai_generated?: boolean
  source_question_id?: string
  ai_generation_metadata?: {
    difficulty?: string
  }
  visibility?: number
  generation_count?: number
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
  async ({ page, items_per_page, sort, order, search, type, tags, tagLogic }: {
    page: number
    items_per_page: number
    sort?: string
    order?: 'asc' | 'desc'
    search?: string
    type?: 'lq' | 'mc'
    tags?: string[]
    tagLogic?: 'and' | 'or'
  }) => {
    const params: any = {}
    
    // Only include page if no tags are selected
    if (!tags || tags.length === 0) {
      params.page = page
      params.items_per_page = items_per_page
    }
    
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search
    if (type) params.type = type
    
    // Add visibility parameter for subject scope
    params.visibility = QUESTION_VISIBILITY.SUBJECT_SHARED
    
    // Build the URL with proper tag_ids format
    let url = `${API_URL}/questions`
    const queryParams = new URLSearchParams()
    
    // Add all params except tag_ids
    Object.keys(params).forEach(key => {
      queryParams.append(key, params[key])
    })
    
    // Add tag_ids as separate parameters
    if (tags && tags.length > 0) {
      tags.forEach(tagId => {
        queryParams.append('tag_ids', tagId)
      })
      
      // Add tag logic parameter
      if (tagLogic) {
        queryParams.append('logic', tagLogic)
      }
    }
    
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    try {
      const headers = getHeadersWithSchoolSubject(url)
      const response = await axios.get(url, { 
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

export const fetchQuestionsByIds = createAsyncThunk(
  'questions/fetchQuestionsByIds',
  async (questionIds: string[]) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions`)
      const params = { question_ids: questionIds.join(',') }
      const response = await axios.get(`${API_URL}/questions`, { 
        params,
        headers,
        withCredentials: true 
      })
      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch questions'
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

export const generateSimilarQuestions = createAsyncThunk(
  'questions/generateSimilarQuestions',
  async ({ questionIds, questionType, difficulty, count }: { 
    questionIds: string[], 
    questionType: 'mc' | 'lq', 
    difficulty: 'easy' | 'medium' | 'hard' | 'challenging',
    count: number 
  }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/ai/generate-similar-questions`)
      const response = await axios.post(`${API_URL}/ai/generate-similar-questions`, { 
        question_ids: questionIds,
        question_type: questionType,
        difficulty: difficulty,
        num_questions: count
      }, { 
        headers,
        withCredentials: true 
      })
      return response.data.data[0].questions // Return the questions array from the response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate similar questions'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const createMultipleQuestions = createAsyncThunk(
  'questions/createMultipleQuestions',
  async (questions: QuestionFormData[]) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions`)
      const promises = questions.map(questionData => 
        axios.post(`${API_URL}/questions`, questionData, { 
          headers,
          withCredentials: true 
        })
      )
      const responses = await Promise.all(promises)
      const createdQuestions = responses.map(response => response.data.data)
      return createdQuestions
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create questions'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const createSingleQuestion = createAsyncThunk(
  'questions/createSingleQuestion',
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

// Initial state
interface QuestionsState {
  questions: Question[]
  currentQuestion: Question | null
  generatedQuestions: any[] // Store generated questions for review
  selectedQuestions: Question[] // Store selected questions for assignment
  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  generatingSimilarQuestions: boolean
  creatingMultipleQuestions: boolean
  fetchingSelectedQuestions: boolean
  error: string | null
  success: string | null
  total: number
}

const initialState: QuestionsState = {
  questions: [],
  currentQuestion: null,
  generatedQuestions: [],
  selectedQuestions: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  generatingSimilarQuestions: false,
  creatingMultipleQuestions: false,
  fetchingSelectedQuestions: false,
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
    clearGeneratedQuestions: (state) => {
      state.generatedQuestions = []
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

    // Fetch questions by IDs
    builder
      .addCase(fetchQuestionsByIds.pending, (state) => {
        state.fetchingSelectedQuestions = true
        state.error = null
      })
      .addCase(fetchQuestionsByIds.fulfilled, (state, action) => {
        state.fetchingSelectedQuestions = false
        state.selectedQuestions = action.payload
      })
      .addCase(fetchQuestionsByIds.rejected, (state, action) => {
        state.fetchingSelectedQuestions = false
        state.error = action.error.message || 'Failed to fetch questions'
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

    // Generate similar questions
    builder
      .addCase(generateSimilarQuestions.pending, (state) => {
        state.generatingSimilarQuestions = true
        state.error = null
      })
      .addCase(generateSimilarQuestions.fulfilled, (state, action) => {
        state.generatingSimilarQuestions = false
        state.generatedQuestions = action.payload // Store generated questions for review
        state.success = 'Similar questions generated successfully'
      })
      .addCase(generateSimilarQuestions.rejected, (state, action) => {
        state.generatingSimilarQuestions = false
        state.error = action.error.message || 'Failed to generate similar questions'
      })

    // Create multiple questions
    builder
      .addCase(createMultipleQuestions.pending, (state) => {
        state.creatingMultipleQuestions = true
        state.error = null
        state.success = null
      })
      .addCase(createMultipleQuestions.fulfilled, (state, action) => {
        state.creatingMultipleQuestions = false
        state.questions.push(...action.payload) // Add created questions to the list
        state.generatedQuestions = [] // Clear generated questions
        state.success = 'Questions created successfully'
      })
      .addCase(createMultipleQuestions.rejected, (state, action) => {
        state.creatingMultipleQuestions = false
        state.error = action.error.message || 'Failed to create questions'
      })

    // Create single question
    builder
      .addCase(createSingleQuestion.pending, (state) => {
        state.creating = true
        state.error = null
        state.success = null
      })
      .addCase(createSingleQuestion.fulfilled, (state, action) => {
        state.creating = false
        state.questions.push(action.payload) // Add created question to the list
        state.success = 'Question created successfully'
      })
      .addCase(createSingleQuestion.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create question'
      })
  },
})

export const { 
  clearError, 
  clearSuccess, 
  clearMessages, 
  clearCurrentQuestion,
  clearGeneratedQuestions
} = questionsSlice.actions

export default questionsSlice.reducer 