import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface AIContentToTextRequest {
  content: string
  content_type: 'mc_question' | 'mc_answer' | 'lq_question' | 'lq_answer'
}

export interface AIContentToTextResponse {
  processed_content: string
  processing_time: number
}

// State interface
export interface AIState {
  processing: boolean
  error: string | null
  success: string | null
  processedContent: string | { include: string; exclude: string } | null
  showModal: boolean
  targetField: 'question' | 'answer' | 'rubric' | null
}

// Async thunks
export const processContentToText = createAsyncThunk(
  'ai/processContentToText',
  async ({ content, type }: { content: string; type: 'mc_question' | 'mc_answer' | 'lq_question' | 'lq_answer' }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/ai/content-to-text`)
      const response = await axios.post(
        `${API_URL}/ai/content-to-text`,
        { content, content_type: type },
        { 
          headers,
          withCredentials: true 
        }
      )
      
      if (response.data.status === 'success') {
        // Handle the new response format with array
        const processedData = response.data.data[0] || response.data.data
        return processedData.processed_content
      } else {
        throw new Error('Failed to process content')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to process content'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const generateRubric = createAsyncThunk(
  'ai/generateRubric',
  async ({ question_content, answer_content, question_id }: { question_content: string; answer_content: string; question_id?: string }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/ai/generate-rubric`)
      const requestBody: any = { question_content, answer_content }
      
      // Include question_id if provided (edit mode)
      if (question_id) {
        requestBody.question_id = question_id
      }
      
      const response = await axios.post(
        `${API_URL}/ai/generate-rubric`,
        requestBody,
        { 
          headers,
          withCredentials: true 
        }
      )
      
      if (response.data.status === 'success') {
        const processedData = response.data.data[0] || response.data.data
        
        // Handle new API format with include_criteria and exclude_criteria arrays
        if (processedData.rubric && processedData.rubric.include_criteria && processedData.rubric.exclude_criteria) {
          return {
            include: processedData.rubric.include_criteria.join('\n'),
            exclude: processedData.rubric.exclude_criteria.join('\n')
          }
        }
        // Handle legacy generated_rubric object format
        else if (typeof processedData.generated_rubric === 'object' && processedData.generated_rubric !== null) {
          return processedData.generated_rubric
        } 
        // Handle legacy string format
        else {
          const rubricString = processedData.generated_rubric || ''
          const parts = rubricString.split(/Should not have:/i)
          if (parts.length === 2) {
            return {
              include: parts[0].replace(/Should contain:\s*/i, '').trim(),
              exclude: parts[1].trim()
            }
          } else {
            // Fallback: put all content in include
            return {
              include: rubricString,
              exclude: ''
            }
          }
        }
      } else {
        throw new Error('Failed to generate rubric')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate rubric'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

const initialState: AIState = {
  processing: false,
  error: null,
  success: null,
  processedContent: null,
  showModal: false,
  targetField: null,
}

// Slice
const aiSlice = createSlice({
  name: 'ai',
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
    setProcessedContent: (state, action) => {
      state.processedContent = action.payload.content
      state.targetField = action.payload.field
      state.showModal = true
    },
    acceptProcessedContent: (state) => {
      state.showModal = false
      state.processedContent = null
      state.targetField = null
    },
    rejectProcessedContent: (state) => {
      state.showModal = false
      state.processedContent = null
      state.targetField = null
    },
  },
  extraReducers: (builder) => {
    // Process content to text
    builder
      .addCase(processContentToText.pending, (state) => {
        state.processing = true
        state.error = null
        state.success = null
      })
      .addCase(processContentToText.fulfilled, (state, action) => {
        state.processing = false
        state.success = 'Content processed successfully'
        // Don't automatically set the content - let the component handle it
      })
      .addCase(processContentToText.rejected, (state, action) => {
        state.processing = false
        state.error = action.error.message || 'Failed to process content'
      })
      // Generate rubric
      .addCase(generateRubric.pending, (state) => {
        state.processing = true
        state.error = null
        state.success = null
        state.targetField = 'rubric'
      })
      .addCase(generateRubric.fulfilled, (state, action) => {
        state.processing = false
        state.success = 'Rubric generated successfully'
        state.processedContent = action.payload
        state.targetField = 'rubric'
        state.showModal = false  // Don't show modal, populate directly
      })
      .addCase(generateRubric.rejected, (state, action) => {
        state.processing = false
        state.error = action.error.message || 'Failed to generate rubric'
        state.targetField = null
      })
  },
})

export const { 
  clearError, 
  clearSuccess, 
  clearMessages,
  setProcessedContent,
  acceptProcessedContent,
  rejectProcessedContent
} = aiSlice.actions

export default aiSlice.reducer 