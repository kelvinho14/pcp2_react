import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
import { formatApiTimestamp } from '../../_metronic/helpers/dateUtils'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Notification {
  type: number
  title: string
  message: string
  status: number
  entity_id: string
  url_path?: string
  notification_id: string
  user_id: string
  created_at: string
  read_at: string | null
  // Computed fields for UI
  isRead: boolean
  time: string
  icon: string
  state: 'primary' | 'danger' | 'warning' | 'success' | 'info'
}

interface NotificationsState {
  notifications: Notification[]
  loading: boolean
  error: string | null
  total: number
  page: number
  limit: number
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/notifications`)
      const response = await axios.get(`${API_URL}/notifications`, {
        params: { page, limit },
        headers,
        withCredentials: true
      })
      
      
      // Map API response to our notification format
      const mapNotification = (apiNotification: any): Notification => {
        const isRead = apiNotification.read_at !== null
        
        // Use the proper date utility function for time formatting
        const timeString = formatApiTimestamp(apiNotification.created_at, { format: 'relative' })
        
        // Map notification type to icon, state, title, and generate URL path
        const getNotificationDetails = (type: number, data: any) => {
          switch (type) {
            case 1: return { 
              icon: 'book', 
              state: 'primary' as const,
              title: 'You have a new exercise!',
              url_path: data?.assignment_id ? `/exercises/attempt/${data.assignment_id}` : undefined
            }
            case 2: return { 
              icon: 'play-circle', 
              state: 'success' as const,
              title: 'You have a new video!',
              url_path: data?.video_id ? `/videos/${data.video_id}` : undefined
            }
            case 3: return { 
              icon: 'clock', 
              state: 'warning' as const,
              title: 'Reminder',
              url_path: undefined
            }
            case 4: return { 
              icon: 'setting-2', 
              state: 'info' as const,
              title: 'System Notification',
              url_path: undefined
            }
            case 5: return { 
              icon: 'message-text-2', 
              state: 'primary' as const,
              title: 'New Message',
              url_path: undefined
            }
            default: return { 
              icon: 'bell', 
              state: 'primary' as const,
              title: 'Notification',
              url_path: undefined
            }
          }
        }
        
        const { icon, state, title, url_path } = getNotificationDetails(apiNotification.type, apiNotification.data)
        
        return {
          ...apiNotification,
          title, // Override with frontend-generated title
          url_path, // Override with frontend-generated URL path
          isRead,
          time: timeString,
          icon,
          state
        }
      }
      
      const notifications = response.data.data?.notifications || []
      const mappedNotifications = Array.isArray(notifications) ? notifications.map(mapNotification) : []
      
      return {
        items: mappedNotifications,
        total: response.data.data?.total || 0,
        page: response.data.data?.page || page,
        limit: response.data.data?.page_size || limit
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch notifications'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/notifications/${notificationId}/read`)
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers,
        withCredentials: true
      })
      return notificationId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark notification as read'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/notifications/mark-all-read`)
      await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
        headers,
        withCredentials: true
      })
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark all notifications as read'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)


// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setPage: (state, action) => {
      state.page = action.payload
    },
    setLimit: (state, action) => {
      state.limit = action.payload
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch notifications'
      })

    // Mark notification as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.notification_id === action.payload)
        if (notification) {
          notification.isRead = true
          notification.read_at = new Date().toISOString()
        }
      })

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true
          notification.read_at = new Date().toISOString()
        })
      })
  },
})

export const { clearError, setPage, setLimit } = notificationsSlice.actions
export default notificationsSlice.reducer
