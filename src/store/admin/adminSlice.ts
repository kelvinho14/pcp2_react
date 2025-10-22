import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Subject {
  subject_id: string
  name: string
  code: string
  status?: number
  created_at?: string
  updated_at?: string
}

export interface SubjectFormData {
  name: string
  code: string
  status?: number
}

export interface School {
  school_id: string
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
  active_subjects?: number
  inactive_subjects?: number
  subjects?: SchoolSubject[]
  created_at?: string
  updated_at?: string
}

export interface SchoolFormData {
  name: string
  code: string
}

export interface SchoolSubject {
  subject_id: string
  name: string
  code: string
  custom_name?: string
  status: number | null // null = never used, 0 = inactive, 1 = active
}

// Async thunks for Subjects
export const createSubject = createAsyncThunk(
  'admin/createSubject',
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
  'admin/updateSubject',
  async (subjectData: SubjectFormData & { subject_id: string }) => {
    try {
      const response = await axios.put(`${API_URL}/subjects/${subjectData.subject_id}`, subjectData, { 
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
  'admin/fetchSubject',
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
  'admin/fetchSubjects',
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
  'admin/deleteSubject',
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
  'admin/bulkDeleteSubjects',
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

// Async thunks for Schools
// Track last fetch request to prevent duplicates
let lastFetchRequest: string | null = null

export const fetchSchools = createAsyncThunk(
  'admin/fetchSchools',
  async (params: {
    page: number
    items_per_page: number
    sort?: string
    order?: string
    search?: string
  }) => {
    const response = await axios.get(`${API_URL}/schools`, { params, withCredentials: true })
    return {
      items: response.data.data,
      total: response.data.payload.pagination.total,
    }
  },
  {
    condition: (params, { getState }) => {
      const requestKey = JSON.stringify(params)
      const { admin } = getState() as { admin: { loading: boolean } }
      
      // Prevent duplicate requests if already loading with same params
      if (admin.loading && lastFetchRequest === requestKey) {
        return false
      }
      
      lastFetchRequest = requestKey
      return true
    }
  }
)

export const fetchSchool = createAsyncThunk(
  'admin/fetchSchool',
  async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/schools/${id}`, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch school'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  },
  {
    condition: (id, { getState }) => {
      const { admin } = getState() as { admin: { loading: boolean; currentSchool?: School } }
      // Prevent duplicate requests if already loading or if we already have this school
      if (admin.loading) {
        return false
      }
      if (admin.currentSchool?.school_id === id) {
        return false
      }
      return true
    }
  }
)

export const createSchool = createAsyncThunk(
  'admin/createSchool',
  async (schoolData: SchoolFormData) => {
    try {
      const response = await axios.post(`${API_URL}/schools`, schoolData, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create school'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateSchool = createAsyncThunk(
  'admin/updateSchool',
  async (schoolData: SchoolFormData & { school_id: string }) => {
    try {
      const response = await axios.put(`${API_URL}/schools/${schoolData.school_id}`, schoolData, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update school'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const bulkDeleteSchools = createAsyncThunk(
  'admin/bulkDeleteSchools',
  async (schoolIds: string[]) => {
    try {
      await axios.delete(`${API_URL}/schools`, { 
        data: { school_ids: schoolIds },
        withCredentials: true 
      })
      return schoolIds
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete schools'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const deleteSchool = createAsyncThunk(
  'admin/deleteSchool',
  async (schoolId: string) => {
    try {
      await axios.delete(`${API_URL}/schools/${schoolId}`, { 
        withCredentials: true 
      })
      return schoolId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete school'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const saveSchoolSubjects = createAsyncThunk(
  'admin/saveSchoolSubjects',
  async ({ schoolId, subjectIds }: { schoolId: string; subjectIds: string[] }) => {
    try {
      const response = await axios.post(`${API_URL}/schools/school-subjects/${schoolId}`, {
        subject_ids: subjectIds
      }, { 
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save school subjects'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateSchoolSubjectStatus = createAsyncThunk(
  'admin/updateSchoolSubjectStatus',
  async ({ schoolId, subjectId, status }: { schoolId: string; subjectId: string; status: number }) => {
    try {
      const response = await axios.post(`${API_URL}/schools/school-subjects/${schoolId}`, {
        subjects: [
          {
            subject_id: subjectId,
            status: status
          }
        ]
      }, { 
        withCredentials: true 
      })
      return { subjectId, status }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update subject status'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface AdminState {
  subjects: Subject[]
  schools: School[]
  currentSubject: Subject | null
  currentSchool: School | null
  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  error: string | null
  success: string | null
  subjectsTotal: number
  schoolsTotal: number
}

const initialState: AdminState = {
  subjects: [],
  schools: [],
  currentSubject: null,
  currentSchool: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  success: null,
  subjectsTotal: 0,
  schoolsTotal: 0,
}

// Slice
const adminSlice = createSlice({
  name: 'admin',
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
    clearCurrentSchool: (state) => {
      state.currentSchool = null
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
        state.subjectsTotal = action.payload.total
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
        state.success = null
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.deleting = false
        state.subjects = state.subjects.filter(subject => subject.subject_id !== action.payload)
        state.success = 'Subject deleted successfully'
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
        state.success = null
      })
      .addCase(bulkDeleteSubjects.fulfilled, (state, action) => {
        state.deleting = false
        state.subjects = state.subjects.filter(subject => !action.payload.includes(subject.subject_id))
        state.success = 'Subjects deleted successfully'
      })
      .addCase(bulkDeleteSubjects.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete subjects'
      })

    // Fetch schools
    builder
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false
        state.schools = action.payload.items
        state.schoolsTotal = action.payload.total
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch schools'
      })

    // Fetch single school
    builder
      .addCase(fetchSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchool.fulfilled, (state, action) => {
        state.loading = false
        state.currentSchool = action.payload
      })
      .addCase(fetchSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch school'
      })

    // Create school
    builder
      .addCase(createSchool.pending, (state) => {
        state.creating = true
        state.error = null
        state.success = null
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.creating = false
        state.schools.push(action.payload)
        state.success = 'School created successfully'
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create school'
      })

    // Update school
    builder
      .addCase(updateSchool.pending, (state) => {
        state.updating = true
        state.error = null
        state.success = null
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        state.updating = false
        // Update the school in the list
        const index = state.schools.findIndex(school => school.school_id === action.payload.school_id)
        if (index !== -1) {
          state.schools[index] = action.payload
        }
        // Update current school if it's the same one
        if (state.currentSchool && state.currentSchool.school_id === action.payload.school_id) {
          state.currentSchool = action.payload
        }
        state.success = 'School updated successfully'
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update school'
      })

    // Bulk delete schools
    builder
      .addCase(bulkDeleteSchools.pending, (state) => {
        state.deleting = true
        state.error = null
        state.success = null
      })
      .addCase(bulkDeleteSchools.fulfilled, (state, action) => {
        state.deleting = false
        state.schools = state.schools.filter(school => !action.payload.includes(school.school_id))
        state.success = 'Schools deleted successfully'
      })
      .addCase(bulkDeleteSchools.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete schools'
      })

    // Delete school
    builder
      .addCase(deleteSchool.pending, (state) => {
        state.deleting = true
        state.error = null
        state.success = null
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.deleting = false
        state.schools = state.schools.filter(school => school.school_id !== action.payload)
        state.success = 'School deleted successfully'
      })
      .addCase(deleteSchool.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete school'
      })

    // Save school subjects
    builder
      .addCase(saveSchoolSubjects.pending, (state) => {
        state.updating = true
        state.error = null
        state.success = null
      })
      .addCase(saveSchoolSubjects.fulfilled, (state) => {
        state.updating = false
        state.success = 'School subjects saved successfully'
      })
      .addCase(saveSchoolSubjects.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to save school subjects'
      })

    // Update school subject status
    builder
      .addCase(updateSchoolSubjectStatus.pending, (state) => {
        state.updating = true
        state.error = null
        state.success = null
      })
      .addCase(updateSchoolSubjectStatus.fulfilled, (state, action) => {
        state.updating = false
        // Update the subject status in current school if it exists
        if (state.currentSchool && state.currentSchool.subjects) {
          const subjectIndex = state.currentSchool.subjects.findIndex(
            subject => subject.subject_id === action.payload.subjectId
          )
          if (subjectIndex !== -1) {
            state.currentSchool.subjects[subjectIndex].status = action.payload.status
          }
        }
        state.success = 'Subject status updated successfully'
      })
      .addCase(updateSchoolSubjectStatus.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update subject status'
      })
  },
})

export const { 
  clearError, 
  clearSuccess, 
  clearMessages, 
  clearCurrentSubject, 
  clearCurrentSchool 
} = adminSlice.actions

export default adminSlice.reducer 