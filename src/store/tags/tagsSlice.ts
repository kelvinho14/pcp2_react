import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Tag {
  id: string
  name: string
}

export interface QuestionTag {
  tag_id: string
  name: string
  usage_count: number
}

export interface TagLinkage {
  content_type: string
  count: number
}

export interface TagWithLinkages {
  tag_id: string
  name: string
  linkages: TagLinkage[]
}

// API response interface
interface APITag {
  tag_id: string
  name: string
  school_subject_id: string
  created_at: string
  updated_at: string
}

// Async thunks
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/tags`)
      const response = await axios.get(`${API_URL}/tags`, { 
        params: { all: 1 },
        headers,
        withCredentials: true 
      })

      // Transform API response to match our Tag interface
      const apiTags: APITag[] = response.data.data || []
      const transformedTags: Tag[] = apiTags.map(tag => ({
        id: tag.tag_id,
        name: tag.name
      }))

      return transformedTags
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tags'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchQuestionTags = createAsyncThunk(
  'tags/fetchQuestionTags',
  async (type?: 'lq' | 'mc') => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/questions/tags`)
      const params: any = { all: 1 }
      if (type) params.type = type
      
      const response = await axios.get(`${API_URL}/questions/tags`, { 
        params,
        headers,
        withCredentials: true 
      })

      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch question tags'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Fetch tags with linkages for tags management page
export const fetchTagsWithLinkages = createAsyncThunk(
  'tags/fetchTagsWithLinkages',
  async (search?: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/tags`)
      const params: any = { all: 1, linkagecount: 1 }
      if (search && search.trim()) {
        params.search = search.trim()
      }
      
      const response = await axios.get(`${API_URL}/tags`, {
        params,
        headers,
        withCredentials: true
      })

      if (response.data.status === 'success') {
        return response.data.data || []
      } else {
        throw new Error('Failed to fetch tags')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tags'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Update tag name
export const updateTagName = createAsyncThunk(
  'tags/updateTagName',
  async ({ tagId, newName }: { tagId: string; newName: string }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/tags/${tagId}`)
      
      await axios.put(`${API_URL}/tags/${tagId}`, {
        name: newName.trim()
      }, {
        headers,
        withCredentials: true
      })

      toast.success('Tag updated successfully!', 'Success')
      return { tagId, newName: newName.trim() }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update tag'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface TagsState {
  tags: Tag[]
  questionTags: QuestionTag[]
  tagsWithLinkages: TagWithLinkages[]
  loading: boolean
  questionTagsLoading: boolean
  tagsWithLinkagesLoading: boolean
  error: string | null
}

const initialState: TagsState = {
  tags: [],
  questionTags: [],
  tagsWithLinkages: [],
  loading: false,
  questionTagsLoading: false,
  tagsWithLinkagesLoading: false,
  error: null,
}

// Slice
const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateTagInList: (state, action) => {
      const { tagId, newName } = action.payload
      const tagIndex = state.tagsWithLinkages.findIndex(tag => tag.tag_id === tagId)
      if (tagIndex !== -1) {
        state.tagsWithLinkages[tagIndex].name = newName
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tags
    builder
      .addCase(fetchTags.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false
        state.tags = action.payload
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tags'
      })
      // Fetch question tags
      .addCase(fetchQuestionTags.pending, (state) => {
        state.questionTagsLoading = true
        state.error = null
      })
      .addCase(fetchQuestionTags.fulfilled, (state, action) => {
        state.questionTagsLoading = false
        state.questionTags = action.payload
      })
      .addCase(fetchQuestionTags.rejected, (state, action) => {
        state.questionTagsLoading = false
        state.error = action.error.message || 'Failed to fetch question tags'
      })
      // Fetch tags with linkages
      .addCase(fetchTagsWithLinkages.pending, (state) => {
        state.tagsWithLinkagesLoading = true
        state.error = null
      })
      .addCase(fetchTagsWithLinkages.fulfilled, (state, action) => {
        state.tagsWithLinkagesLoading = false
        state.tagsWithLinkages = action.payload
      })
      .addCase(fetchTagsWithLinkages.rejected, (state, action) => {
        state.tagsWithLinkagesLoading = false
        state.error = action.error.message || 'Failed to fetch tags'
      })
      // Update tag name
      .addCase(updateTagName.pending, (state) => {
        state.error = null
      })
      .addCase(updateTagName.fulfilled, (state, action) => {
        const { tagId, newName } = action.payload
        const tagIndex = state.tagsWithLinkages.findIndex(tag => tag.tag_id === tagId)
        if (tagIndex !== -1) {
          state.tagsWithLinkages[tagIndex].name = newName
        }
      })
      .addCase(updateTagName.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update tag'
      })
  },
})

export const { clearError, updateTagInList } = tagsSlice.actions
export default tagsSlice.reducer 