import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API_URL

export interface School {
  school_id: string
  name: string
  code?: string
  address?: string
  phone?: string
  email?: string
  status?: number
  created_at?: string
  updated_at?: string
  subjects?: SchoolSubject[]
}

export interface SchoolSubject {
  subject_id: string
  code: string
  name: string
  status: number | null // null = never used, 0 = inactive, 1 = active
  custom_name?: string
  created_at?: string
  updated_at?: string
}

interface SchoolsState {
  schools: School[]
  loading: boolean
  error: string | null
  total: number
  currentSchool: School | null
}

const initialState: SchoolsState = {
  schools: [],
  loading: false,
  error: null,
  total: 0,
  currentSchool: null,
}

// Fetch schools with pagination and search
export const fetchSchools = createAsyncThunk(
  'schools/fetchSchools',
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
  }
)

// Fetch single school by ID
export const fetchSchoolById = createAsyncThunk(
  'schools/fetchSchoolById',
  async (id: string) => {
    const response = await axios.get(`${API_URL}/schools/${id}`, { withCredentials: true })
    return response.data.data
  }
)

// Create new school
export const createSchool = createAsyncThunk(
  'schools/createSchool',
  async (schoolData: Partial<School>) => {
    const response = await axios.post(`${API_URL}/schools`, schoolData, { withCredentials: true })
    return response.data.data
  }
)

// Update school
export const updateSchool = createAsyncThunk(
  'schools/updateSchool',
  async ({ id, schoolData }: { id: string; schoolData: Partial<School> }) => {
    const response = await axios.put(`${API_URL}/schools/${id}`, schoolData, { withCredentials: true })
    return response.data.data
  }
)

// Delete school
export const deleteSchool = createAsyncThunk(
  'schools/deleteSchool',
  async (id: string) => {
    await axios.delete(`${API_URL}/schools/${id}`, { withCredentials: true })
    return id
  }
)

// Bulk delete schools
export const bulkDeleteSchools = createAsyncThunk(
  'schools/bulkDeleteSchools',
  async (ids: string[]) => {
    await axios.delete(`${API_URL}/schools/`, { data: { school_ids: ids }, withCredentials: true })
    return ids
  }
)

// Save school subjects
export const saveSchoolSubjects = createAsyncThunk(
  'schools/saveSchoolSubjects',
  async ({ schoolId, subjectIds }: { schoolId: string; subjectIds: string[] }) => {
    const response = await axios.post(`${API_URL}/schools/school-subjects/${schoolId}`, {
      school_id: schoolId,
      subject_ids: subjectIds,
    }, { withCredentials: true })
    return response.data
  }
)

// Update subject status for a school
export const updateSubjectStatus = createAsyncThunk(
  'schools/updateSubjectStatus',
  async ({ schoolId, subjectId, status }: { schoolId: string; subjectId: string; status: number }) => {
    const response = await axios.post(`${API_URL}/schools/school-subjects/${schoolId}`, {
      subjects: [
        {
          subject_id: subjectId,
          status: status
        }
      ]
    }, { withCredentials: true })
    return { subjectId, status, response: response.data }
  }
)

const schoolsSlice = createSlice({
  name: 'schools',
  initialState,
  reducers: {
    clearCurrentSchool: (state) => {
      state.currentSchool = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch schools
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false
        state.schools = action.payload.items || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch schools'
      })
      // Fetch school by ID
      .addCase(fetchSchoolById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchoolById.fulfilled, (state, action) => {
        state.loading = false
        state.currentSchool = action.payload
      })
      .addCase(fetchSchoolById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch school'
      })
      // Create school
      .addCase(createSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.loading = false
        state.schools.unshift(action.payload)
        state.total += 1
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create school'
      })
      // Update school
      .addCase(updateSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        state.loading = false
        const index = state.schools.findIndex(school => school.school_id === action.payload.school_id)
        if (index !== -1) {
          state.schools[index] = action.payload
        }
        if (state.currentSchool?.school_id === action.payload.school_id) {
          state.currentSchool = action.payload
        }
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update school'
      })
      // Delete school
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.schools = state.schools.filter(school => school.school_id !== action.payload)
        state.total -= 1
      })
      // Bulk delete schools
      .addCase(bulkDeleteSchools.fulfilled, (state, action) => {
        state.schools = state.schools.filter(school => !action.payload.includes(school.school_id))
        state.total -= action.payload.length
      })
      // Save school subjects
      .addCase(saveSchoolSubjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveSchoolSubjects.fulfilled, (state, action) => {
        state.loading = false
        // Optionally update the current school's subjects if needed
      })
      .addCase(saveSchoolSubjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to save school subjects'
      })
      // Update subject status
      .addCase(updateSubjectStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSubjectStatus.fulfilled, (state, action) => {
        state.loading = false
        // Update the subject status in current school if it exists
        if (state.currentSchool?.subjects) {
          const subjectIndex = state.currentSchool.subjects.findIndex(
            subject => subject.subject_id === action.payload.subjectId
          )
          if (subjectIndex !== -1) {
            state.currentSchool.subjects[subjectIndex].status = action.payload.status
          }
        }
      })
      .addCase(updateSubjectStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update subject status'
      })
  },
})

export const { clearCurrentSchool, clearError } = schoolsSlice.actions
export default schoolsSlice.reducer 