import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Subject {
  subject_id: string
  name: string
  code: string
  created_at?: string
  updated_at?: string
}

export interface SubjectFormData {
  name: string
  code: string
}

// Async thunks
export const createSubject = createAsyncThunk(
  'subjects/createSubject',
  async (subjectData: SubjectFormData) => {
    try {
      const response = await axios.post(`${API_URL}/subjects`, subjectData, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create subject'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateSubject = createAsyncThunk(
  'subjects/updateSubject',
  async ({ id, subjectData }: { id: string; subjectData: SubjectFormData }) => {
    try {
      const response = await axios.put(`${API_URL}/subjects/${id}`, subjectData, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update subject'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchSubject = createAsyncThunk(
  'subjects/fetchSubject',
  async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/subjects/${id}`, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch subject'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
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
      const response = await axios.get(`${API_URL}/subjects`, { params, withCredentials: true })
      return {
        items: response.data.data,
        total: response.data.payload.pagination.total,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch subjects'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const deleteSubject = createAsyncThunk(
  'subjects/deleteSubject',
  async (subjectId: string) => {
    try {
      await axios.delete(`${API_URL}/subjects/${subjectId}`, { 
        withCredentials: true 
      })
      return subjectId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete subject'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const bulkDeleteSubjects = createAsyncThunk(
  'subjects/bulkDeleteSubjects',
  async (subjectIds: string[]) => {
    try {
        await axios.delete(`${API_URL}/subjects`, { 
            data: { subject_ids: subjectIds },
            withCredentials: true 
          })
      return subjectIds
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete subjects'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface SubjectsState {
  subjects: Subject[]
  currentSubject: Subject | null
  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  error: string | null
  success: string | null
}

const initialState: SubjectsState = {
  subjects: [],
  currentSubject: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  success: null,
}

// Slice
const subjectsSlice = createSlice({
  name: 'subjects',
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
    clearCurrentSubject: (state) => {
      state.currentSubject = null
    },
  },
  extraReducers: (builder) => {
    // Create subject
    builder
      .addCase(createSubject.pending, (state) => {
        state.creating = true
        state.error = null
        state.success = null
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.creating = false
        state.subjects.push(action.payload)
        state.success = 'Subject created successfully'
        toast.success('Subject created successfully', 'Success!')
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create subject'
      })

    // Update subject
    builder
      .addCase(updateSubject.pending, (state) => {
        state.updating = true
        state.error = null
        state.success = null
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.updating = false
        // Update the subject in the list
        const index = state.subjects.findIndex(subject => subject.subject_id === action.payload.subject_id)
        if (index !== -1) {
          state.subjects[index] = action.payload
        }
        // Update current subject if it's the same one
        if (state.currentSubject && state.currentSubject.subject_id === action.payload.subject_id) {
          state.currentSubject = action.payload
        }
        state.success = 'Subject updated successfully'
        toast.success('Subject updated successfully', 'Success!')
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update subject'
      })

    // Fetch single subject
    builder
      .addCase(fetchSubject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubject.fulfilled, (state, action) => {
        state.loading = false
        state.currentSubject = action.payload
      })
      .addCase(fetchSubject.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch subject'
      })

    // Fetch subjects
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false
        state.subjects = action.payload.items
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch subjects'
      })

    // Delete subject
    builder
      .addCase(deleteSubject.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.deleting = false
        state.subjects = state.subjects.filter(subject => subject.subject_id !== action.payload)
        state.success = 'Subject deleted successfully'
        toast.success('Subject deleted successfully', 'Success!')
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete subject'
      })

    // Bulk delete subjects
    builder
      .addCase(bulkDeleteSubjects.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(bulkDeleteSubjects.fulfilled, (state, action) => {
        state.deleting = false
        state.subjects = state.subjects.filter(subject => !action.payload.includes(subject.subject_id))
        state.success = 'Subjects deleted successfully'
        toast.success('Subjects deleted successfully', 'Success!')
      })
      .addCase(bulkDeleteSubjects.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete subjects'
      })
  },
})

export const { clearError, clearSuccess, clearMessages, clearCurrentSubject } = subjectsSlice.actions
export default subjectsSlice.reducer 