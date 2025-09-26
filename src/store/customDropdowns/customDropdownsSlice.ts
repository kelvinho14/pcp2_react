import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface TagOption {
  display_text: string
  option_type: number
  option_value: string
}

export interface CustomDropdownOption {
  option_type: number
  option_value: string
  display_text: string
  sort_order: number
}

export interface CustomDropdown {
  dropdown_id: string
  name: string
  description?: string
  is_active: boolean
  user_id: string
  school_subject_id: string
  created_at: string
  updated_at: string
  display_locations: number[]
  options: CustomDropdownOption[]
}

export interface CreateDropdownPayload {
  name: string
  description?: string
  display_locations: number[]
  is_active: boolean
  options: CustomDropdownOption[]
}

// Async thunks
export const fetchCustomDropdowns = createAsyncThunk(
  'customDropdowns/fetchCustomDropdowns',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/custom-dropdowns`)
      const response = await axios.get(`${API_URL}/custom-dropdowns`, { 
        params: { all: 1 },
        headers,
        withCredentials: true 
      })

      if (response.data.status === 'success') {
        return response.data.data || []
      } else {
        throw new Error('Failed to fetch custom dropdowns')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch custom dropdowns'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchTagOptions = createAsyncThunk(
  'customDropdowns/fetchTagOptions',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/custom-dropdowns/tag-options`)
      const response = await axios.get(`${API_URL}/custom-dropdowns/tag-options`, { 
        params: { all: 1 },
        headers,
        withCredentials: true 
      })

      if (response.data.status === 'success') {
        return response.data.data || []
      } else {
        throw new Error('Failed to fetch tag options')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tag options'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchCustomDropdownsByLocation = createAsyncThunk(
  'customDropdowns/fetchCustomDropdownsByLocation',
  async (location: number) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/custom-dropdowns/by-location/${location}`)
      const response = await axios.get(`${API_URL}/custom-dropdowns/by-location/${location}`, {
        headers,
        withCredentials: true
      })

      if (response.data.status === 'success') {
        return response.data.data || []
      } else {
        throw new Error('Failed to fetch custom dropdowns by location')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch custom dropdowns by location'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const createCustomDropdown = createAsyncThunk(
  'customDropdowns/createCustomDropdown',
  async (payload: CreateDropdownPayload) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/custom-dropdowns`)
      const response = await axios.post(`${API_URL}/custom-dropdowns`, payload, {
        headers,
        withCredentials: true
      })

      if (response.data.status === 'success') {
        toast.success('Custom dropdown created successfully!', 'Success')
        return response.data.data
      } else {
        throw new Error('Failed to create custom dropdown')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create custom dropdown'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateCustomDropdown = createAsyncThunk(
  'customDropdowns/updateCustomDropdown',
  async ({ dropdownId, payload }: { dropdownId: string; payload: CreateDropdownPayload }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/custom-dropdowns/${dropdownId}`)
      const response = await axios.put(`${API_URL}/custom-dropdowns/${dropdownId}`, payload, {
        headers,
        withCredentials: true
      })

      if (response.data.status === 'success') {
        toast.success('Custom dropdown updated successfully!', 'Success')
        return response.data.data
      } else {
        throw new Error('Failed to update custom dropdown')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update custom dropdown'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const deleteCustomDropdown = createAsyncThunk(
  'customDropdowns/deleteCustomDropdown',
  async (dropdownId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/custom-dropdowns/${dropdownId}`)
      const response = await axios.delete(`${API_URL}/custom-dropdowns/${dropdownId}`, {
        headers,
        withCredentials: true
      })

      if (response.data.status === 'success') {
        toast.success('Custom dropdown deleted successfully!', 'Success')
        return dropdownId
      } else {
        throw new Error('Failed to delete custom dropdown')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete custom dropdown'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Initial state
interface CustomDropdownsState {
  dropdowns: CustomDropdown[]
  tagOptions: TagOption[]
  dropdownsByLocation: Record<number, CustomDropdown[]>
  loading: boolean
  tagOptionsLoading: boolean
  dropdownsByLocationLoading: Record<number, boolean>
  error: string | null
}

const initialState: CustomDropdownsState = {
  dropdowns: [],
  tagOptions: [],
  dropdownsByLocation: {},
  loading: false,
  tagOptionsLoading: false,
  dropdownsByLocationLoading: {},
  error: null,
}

// Slice
const customDropdownsSlice = createSlice({
  name: 'customDropdowns',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch custom dropdowns
    builder
      .addCase(fetchCustomDropdowns.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomDropdowns.fulfilled, (state, action) => {
        state.loading = false
        state.dropdowns = action.payload
      })
      .addCase(fetchCustomDropdowns.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch custom dropdowns'
      })
      // Fetch tag options
      .addCase(fetchTagOptions.pending, (state) => {
        state.tagOptionsLoading = true
        state.error = null
      })
      .addCase(fetchTagOptions.fulfilled, (state, action) => {
        state.tagOptionsLoading = false
        state.tagOptions = action.payload
      })
      .addCase(fetchTagOptions.rejected, (state, action) => {
        state.tagOptionsLoading = false
        state.error = action.error.message || 'Failed to fetch tag options'
      })
      // Fetch custom dropdowns by location
      .addCase(fetchCustomDropdownsByLocation.pending, (state, action) => {
        state.dropdownsByLocationLoading[action.meta.arg] = true
        state.error = null
      })
      .addCase(fetchCustomDropdownsByLocation.fulfilled, (state, action) => {
        state.dropdownsByLocationLoading[action.meta.arg] = false
        state.dropdownsByLocation[action.meta.arg] = action.payload
      })
      .addCase(fetchCustomDropdownsByLocation.rejected, (state, action) => {
        state.dropdownsByLocationLoading[action.meta.arg] = false
        state.error = action.error.message || 'Failed to fetch custom dropdowns by location'
      })
      // Create custom dropdown
      .addCase(createCustomDropdown.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomDropdown.fulfilled, (state, action) => {
        state.loading = false
        state.dropdowns.push(action.payload)
      })
      .addCase(createCustomDropdown.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create custom dropdown'
      })
      // Update custom dropdown
      .addCase(updateCustomDropdown.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomDropdown.fulfilled, (state, action) => {
        state.loading = false
        const index = state.dropdowns.findIndex(d => d.dropdown_id === action.payload.dropdown_id)
        if (index !== -1) {
          state.dropdowns[index] = action.payload
        }
      })
      .addCase(updateCustomDropdown.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update custom dropdown'
      })
      // Delete custom dropdown
      .addCase(deleteCustomDropdown.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomDropdown.fulfilled, (state, action) => {
        state.loading = false
        state.dropdowns = state.dropdowns.filter(d => d.dropdown_id !== action.payload)
      })
      .addCase(deleteCustomDropdown.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete custom dropdown'
      })
  },
})

export const { clearError } = customDropdownsSlice.actions
export default customDropdownsSlice.reducer
