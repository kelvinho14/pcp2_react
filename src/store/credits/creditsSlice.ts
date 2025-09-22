import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
import { toast } from '../../_metronic/helpers/toast'

const API_URL = import.meta.env.VITE_APP_API_URL

// Cancellation reasons
export const CANCELLATION_REASONS = [
  'No longer needed',
  'Switching to different plan',
  'Budget constraints',
  'Found better alternative',
  'Temporary suspension',
  'Other'
] as const

// Interfaces
export interface Plan {
  plan_id: string
  name: string
  description: string
  monthly_price: number
  yearly_price: number
  currency: string
  credits_included: number
  billing_cycle: number
  billing_cycle_name: string
  max_users?: number
  is_featured?: boolean
  status?: number
  transaction_id?: string
  scheduled_start?: string
  scheduled_date?: string
  purchase_date?: string
  plan_type?: string
}

export interface PlanCredits {
  scope: string
  scope_name: string
  school_subject_id?: string
  school_id?: string
  plan_credits: number
  top_up_credits: number
  total_credits: number
  active_plans: Plan[]
  scheduled_plans: Plan[]
  plan_credits_reset_at: string
  last_used_at: string | null
}

export interface CreditsOverviewResponse {
  status: string
  data: {
    plans: PlanCredits[]
    totals: {
      total_plan_credits: number
      total_top_up_credits: number
      total_credits: number
    }
    summary: {
      active_plans_count: number
      scheduled_plans_count: number
      scopes_available: string[]
    }
  }
}

export interface AvailablePlan {
  plan_id: string
  name: string
  description: string
  monthly_price: number
  yearly_price: number
  currency: string
  credits_included: number
  billing_cycle: number
  billing_cycle_name: string
  max_users?: number
  is_featured?: boolean
  status?: number
}

export interface AvailablePlansResponse {
  data: AvailablePlan[]
  status: string
  message: string
}

export interface SubscriptionRequest {
  plan_id: string
  billing_cycle: number
  payment_method: number
  currency: string
  credit_scope: string
  school_id?: string
  school_subject_id?: string
}

export interface CancelPlanRequest {
  credit_scope: number
  school_id?: string
  school_subject_id?: string
  reason: string
}

export interface CancelScheduledPlanRequest {
  transaction_id: string
  credit_scope: number
  reason: string
}

// Async thunks
export const fetchCreditsOverview = createAsyncThunk(
  'credits/fetchCreditsOverview',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/credits/overview`)
      const response = await axios.get(`${API_URL}/credits/overview`, {
        headers,
        withCredentials: true
      })
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch credits overview'
      toast.error(errorMessage, 'Error')
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchAvailablePlans = createAsyncThunk(
  'credits/fetchAvailablePlans',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/credits/plans`)
      const response = await axios.get(`${API_URL}/credits/plans`, {
        headers,
        withCredentials: true
      })
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch available plans'
      toast.error(errorMessage, 'Error')
      return rejectWithValue(errorMessage)
    }
  }
)

export const purchasePlan = createAsyncThunk(
  'credits/purchasePlan',
  async (subscriptionData: SubscriptionRequest, { rejectWithValue }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/credits/purchase-plan`)
      const response = await axios.post(`${API_URL}/credits/purchase-plan`, subscriptionData, {
        headers,
        withCredentials: true
      })
      
      // Check if the response contains an error detail
      if (response.data.detail && response.data.detail.includes('Failed')) {
        console.warn('API returned error detail:', response.data.detail)
        // Still show success since the record was created
        toast.success('Plan purchased successfully!', 'Success')
        return response.data
      }
      
      toast.success('Plan purchased successfully!', 'Success')
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Failed to purchase plan'
      toast.error(errorMessage, 'Error')
      return rejectWithValue(errorMessage)
    }
  }
)

export const changePlan = createAsyncThunk(
  'credits/changePlan',
  async (subscriptionData: SubscriptionRequest, { rejectWithValue }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/credits/change-plan`)
      const response = await axios.post(`${API_URL}/credits/change-plan`, subscriptionData, {
        headers,
        withCredentials: true
      })
      toast.success('Plan changed successfully!', 'Success')
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change plan'
      toast.error(errorMessage, 'Error')
      return rejectWithValue(errorMessage)
    }
  }
)

export const cancelPlan = createAsyncThunk(
  'credits/cancelPlan',
  async (cancelData: CancelPlanRequest, { rejectWithValue }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/credits/cancel-current-plan`)
      const response = await axios.post(`${API_URL}/credits/cancel-current-plan`, cancelData, {
        headers,
        withCredentials: true
      })
      toast.success('Plan cancelled successfully!', 'Success')
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel plan'
      toast.error(errorMessage, 'Error')
      return rejectWithValue(errorMessage)
    }
  }
)

export const cancelScheduledPlan = createAsyncThunk(
  'credits/cancelScheduledPlan',
  async (cancelData: CancelScheduledPlanRequest, { rejectWithValue }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/credits/cancel-scheduled-plan`)
      const response = await axios.post(`${API_URL}/credits/cancel-scheduled-plan`, cancelData, {
        headers,
        withCredentials: true
      })
      toast.success('Scheduled plan cancelled successfully!', 'Success')
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel scheduled plan'
      toast.error(errorMessage, 'Error')
      return rejectWithValue(errorMessage)
    }
  }
)

// Initial state
interface CreditsState {
  creditsOverview: CreditsOverviewResponse | null
  availablePlans: AvailablePlan[]
  loading: boolean
  purchasing: boolean
  changing: boolean
  cancelling: boolean
  cancellingScheduled: boolean
  error: string | null
  success: string | null
}

const initialState: CreditsState = {
  creditsOverview: null,
  availablePlans: [],
  loading: false,
  purchasing: false,
  changing: false,
  cancelling: false,
  cancellingScheduled: false,
  error: null,
  success: null,
}

// Slice
const creditsSlice = createSlice({
  name: 'credits',
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
  },
  extraReducers: (builder) => {
    // Fetch credits overview
    builder
      .addCase(fetchCreditsOverview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCreditsOverview.fulfilled, (state, action) => {
        state.loading = false
        state.creditsOverview = action.payload
      })
      .addCase(fetchCreditsOverview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch available plans
    builder
      .addCase(fetchAvailablePlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailablePlans.fulfilled, (state, action) => {
        state.loading = false
        state.availablePlans = action.payload.data || []
      })
      .addCase(fetchAvailablePlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Purchase plan
    builder
      .addCase(purchasePlan.pending, (state) => {
        state.purchasing = true
        state.error = null
      })
      .addCase(purchasePlan.fulfilled, (state) => {
        state.purchasing = false
        state.success = 'Plan purchased successfully'
      })
      .addCase(purchasePlan.rejected, (state, action) => {
        state.purchasing = false
        state.error = action.payload as string
      })

    // Change plan
    builder
      .addCase(changePlan.pending, (state) => {
        state.changing = true
        state.error = null
      })
      .addCase(changePlan.fulfilled, (state) => {
        state.changing = false
        state.success = 'Plan changed successfully'
      })
      .addCase(changePlan.rejected, (state, action) => {
        state.changing = false
        state.error = action.payload as string
      })

    // Cancel plan
    builder
      .addCase(cancelPlan.pending, (state) => {
        state.cancelling = true
        state.error = null
      })
      .addCase(cancelPlan.fulfilled, (state) => {
        state.cancelling = false
        state.success = 'Plan cancelled successfully'
      })
      .addCase(cancelPlan.rejected, (state, action) => {
        state.cancelling = false
        state.error = action.payload as string
      })
      .addCase(cancelScheduledPlan.pending, (state) => {
        state.cancellingScheduled = true
        state.error = null
      })
      .addCase(cancelScheduledPlan.fulfilled, (state) => {
        state.cancellingScheduled = false
        state.success = 'Scheduled plan cancelled successfully'
      })
      .addCase(cancelScheduledPlan.rejected, (state, action) => {
        state.cancellingScheduled = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearSuccess, clearMessages } = creditsSlice.actions
export default creditsSlice.reducer
