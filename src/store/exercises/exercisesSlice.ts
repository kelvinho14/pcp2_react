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
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises`)
      await axios.delete(`${API_URL}/exercises`, { 
        data: { exercise_ids: [exerciseId] },
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

export const fetchExerciseStudents = createAsyncThunk(
  'exercises/fetchExerciseStudents',
  async ({ exerciseIds, params }: { 
    exerciseIds: string[]
    params: {
      page: number
      items_per_page: number
      sort?: string
      order?: string
      search?: string
    }
  }) => {
    try {
      // Call API for each exercise and merge results
      const allStudents = new Map()
      
      for (const exerciseId of exerciseIds) {
        const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${exerciseId}/students`)
        const queryParams = new URLSearchParams({
          page: params.page.toString(),
          items_per_page: params.items_per_page.toString(),
          ...(params.sort && { sort: params.sort }),
          ...(params.order && { order: params.order }),
          ...(params.search && { search: params.search }),
        })
        
        const response = await axios.get(`${API_URL}/exercises/${exerciseId}/students?${queryParams}`, { 
          headers,
          withCredentials: true 
        })
        
        const students = response.data.data || response.data.items || response.data || []
        
        // Merge students with assignment status per exercise
        students.forEach((student: any) => {
          const userId = student.user_id
          if (!allStudents.has(userId)) {
            allStudents.set(userId, {
              ...student,
              assignments: new Map()
            })
          }
          
          const studentData = allStudents.get(userId)
          studentData.assignments.set(exerciseId, {
            exercise_id: exerciseId,
            is_assigned: student.is_assigned
          })
        })
      }
      
      // Convert Map to array and calculate overall assignment status
      const mergedStudents = Array.from(allStudents.values()).map((student: any) => {
        const assignments = Array.from(student.assignments.values())
        const assignedExercises = assignments.filter((a: any) => a.is_assigned)
        const unassignedExercises = assignments.filter((a: any) => !a.is_assigned)
        
        return {
          ...student,
          assignments: assignments,
          assigned_count: assignedExercises.length,
          unassigned_count: unassignedExercises.length,
          total_exercises: exerciseIds.length,
          // Student is selectable if they are unassigned to ANY exercise
          is_selectable: unassignedExercises.length > 0
        }
      })
      
      return {
        data: mergedStudents,
        total: mergedStudents.length
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch exercise students'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const assignExercisesToStudents = createAsyncThunk(
  'exercises/assignExercisesToStudents',
  async ({ studentIds, groupIds, exercises }: { 
    studentIds: string[]
    groupIds?: string[]
    exercises: Array<{
      exercise_id: string
      due_date?: string
      feedback?: string
    }>
  }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/student-exercises/assignments`)
      
      // Prepare the payload with both student_ids and group_ids
      const payload: any = {
        exercises: exercises
      }
      
      // Only include student_ids if students are selected
      if (studentIds && studentIds.length > 0) {
        payload.student_ids = studentIds
      }
      
      // Only include group_ids if groups are selected
      if (groupIds && groupIds.length > 0) {
        payload.group_ids = groupIds
      }
      
      const response = await axios.post(`${API_URL}/student-exercises/assignments`, payload, { 
        headers,
        withCredentials: true 
      })
      
      if (response.data.status === 'success') {
        const message = groupIds && groupIds.length > 0 
          ? 'Exercises assigned to students and groups successfully!' 
          : 'Exercises assigned to students successfully!'
        toast.success(message, 'Success')
      } else {
        toast.error('Failed to assign exercises. Please try again.', 'Error')
      }
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to assign exercises'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchExerciseProgress = createAsyncThunk(
  'exercises/fetchExerciseProgress',
  async ({ exerciseId, params }: { 
    exerciseId: string
    params: {
      page: number
      items_per_page: number
      sort?: string
      order?: string
      search?: string
    }
  }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${exerciseId}/progress`)
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        items_per_page: params.items_per_page.toString(),
        ...(params.sort && { sort: params.sort }),
        ...(params.order && { order: params.order }),
        ...(params.search && { search: params.search }),
      })
      
      const response = await axios.get(`${API_URL}/exercises/${exerciseId}/progress?${queryParams}`, { 
        headers,
        withCredentials: true 
      })
      
      // The API now returns { exercise, questions, students }
      const responseData = response.data.data || response.data
      
      return {
        exercise: responseData.exercise,
        questions: responseData.questions || [],
        students: responseData.students || [],
        total: responseData.students?.length || 0
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch exercise progress'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const submitExerciseByTeacher = createAsyncThunk(
  'exercises/submitExerciseByTeacher',
  async (assignmentId: string, { rejectWithValue }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${assignmentId}/submit-by-teacher`)
      
      const response = await axios.post(`${API_URL}/exercises/${assignmentId}/submit-by-teacher`, {}, {
        headers,
        withCredentials: true
      })
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit exercise by teacher'
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
  assigning: boolean
  currentExercise: Exercise | null
  linkedQuestions: LinkedQuestion[]
  fetchingExercise: boolean
  exerciseStudents: any[]
  fetchingExerciseStudents: boolean
  exerciseStudentsTotal: number
  exerciseProgress: any[]
  fetchingExerciseProgress: boolean
  exerciseProgressTotal: number
  // New fields for monitor API response
  exerciseProgressData: {
    exercise: any
    questions: any[]
    students: any[]
  } | null
  exerciseProgressQuestions: any[]
  exerciseProgressStudents: any[]
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
  assigning: false,
  currentExercise: null,
  linkedQuestions: [],
  fetchingExercise: false,
  exerciseStudents: [],
  fetchingExerciseStudents: false,
  exerciseStudentsTotal: 0,
  exerciseProgress: [],
  fetchingExerciseProgress: false,
  exerciseProgressTotal: 0,
  exerciseProgressData: null,
  exerciseProgressQuestions: [],
  exerciseProgressStudents: [],
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
      // Fetch exercise students
      .addCase(fetchExerciseStudents.pending, (state) => {
        state.fetchingExerciseStudents = true
        state.error = null
      })
      .addCase(fetchExerciseStudents.fulfilled, (state, action) => {
        state.fetchingExerciseStudents = false
        state.exerciseStudents = action.payload.data || []
        state.exerciseStudentsTotal = action.payload.total || 0
      })
      .addCase(fetchExerciseStudents.rejected, (state, action) => {
        state.fetchingExerciseStudents = false
        state.error = action.error.message || 'Failed to fetch exercise students'
      })
      // Assign exercises to students
      .addCase(assignExercisesToStudents.pending, (state) => {
        state.assigning = true
        state.error = null
      })
      .addCase(assignExercisesToStudents.fulfilled, (state) => {
        state.assigning = false
      })
      .addCase(assignExercisesToStudents.rejected, (state, action) => {
        state.assigning = false
        state.error = action.error.message || 'Failed to assign exercises to students'
      })
      // Fetch exercise progress
      .addCase(fetchExerciseProgress.pending, (state) => {
        state.fetchingExerciseProgress = true
        state.error = null
      })
      .addCase(fetchExerciseProgress.fulfilled, (state, action) => {
        state.fetchingExerciseProgress = false
        state.exerciseProgressData = action.payload
        state.exerciseProgressQuestions = action.payload.questions || []
        state.exerciseProgressStudents = action.payload.students || []
        state.exerciseProgressTotal = action.payload.total || 0
      })
      .addCase(fetchExerciseProgress.rejected, (state, action) => {
        state.fetchingExerciseProgress = false
        state.error = action.error.message || 'Failed to fetch exercise progress'
      })
      // Submit exercise by teacher
      .addCase(submitExerciseByTeacher.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitExerciseByTeacher.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(submitExerciseByTeacher.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to submit exercise by teacher'
      })
  },
})

export const { clearError, removeLinkedQuestion } = exercisesSlice.actions
export default exercisesSlice.reducer 