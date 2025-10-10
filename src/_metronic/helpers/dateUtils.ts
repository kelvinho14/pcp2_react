/**
 * Utility functions for date and time handling
 */
import { config } from './config'

// Date formatting configuration
export interface DateFormatConfig {
  locale: string
  dateStyle: 'short' | 'medium' | 'long' | 'full'
  timeStyle: 'short' | 'medium' | 'long' | 'full'
  hour12: boolean
  showTimezone: boolean
  relativeThreshold: number // days threshold for relative formatting
  customFormat?: string // Custom format like 'YYYY-MM-DD HH:mm'
}

// Default configuration
export const defaultDateFormatConfig: DateFormatConfig = {
  locale: 'en-US',
  dateStyle: 'short',
  timeStyle: 'short',
  hour12: true,
  showTimezone: false,
  relativeThreshold: 7, // Show relative dates for dates within 7 days
  customFormat: config.dateFormat
}

// Global configuration that can be modified
export let dateFormatConfig: DateFormatConfig = { ...defaultDateFormatConfig }

/**
 * Update the global date format configuration
 * @param config - Partial configuration to merge with current settings
 */
export const updateDateFormatConfig = (config: Partial<DateFormatConfig>) => {
  dateFormatConfig = { ...dateFormatConfig, ...config }
}

/**
 * Reset date format configuration to defaults
 */
export const resetDateFormatConfig = () => {
  dateFormatConfig = { ...defaultDateFormatConfig }
}

/**
 * Convert API timestamp to user's local timezone and format for display
 * @param apiTimestamp - ISO timestamp from API (e.g., "2025-07-13T04:40:24.750027")
 * @param options - Formatting options (overrides global config)
 * @returns Formatted date string in user's local timezone
 */
export const formatApiTimestamp = (
  apiTimestamp: string | null | undefined,
  options: {
    format?: 'date' | 'time' | 'datetime' | 'relative' | 'full' | 'custom' | 'dateOnly'
    showTimezone?: boolean
    locale?: string
    hour12?: boolean
    relativeThreshold?: number
    customFormat?: string
  } = {}
): string => {
  if (!apiTimestamp) {
    return 'N/A'
  }

  try {
    // Ensure the timestamp is treated as UTC by adding 'Z' if not present
    const utcTimestamp = apiTimestamp.endsWith('Z') ? apiTimestamp : apiTimestamp + 'Z'
    const date = new Date(utcTimestamp)
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    // Merge options with global config
    const config = {
      ...dateFormatConfig,
      ...options
    }

    const {
      format = 'datetime',
      showTimezone = config.showTimezone,
      locale = config.locale,
      hour12 = config.hour12,
      relativeThreshold = config.relativeThreshold,
      customFormat = config.customFormat
    } = options

    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    switch (format) {
      case 'date':
        return date.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })

      case 'time':
        return date.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12
        })

      case 'datetime':
        return date.toLocaleString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12
        })

      case 'custom':
        if (!customFormat) {
          return date.toLocaleString(locale)
        }
        return formatCustomDate(date, customFormat)

      case 'dateOnly':
        // Use config format but only show the date part (YYYY-MM-DD)
        const dateOnlyFormat = customFormat?.split(' ')[0] || 'YYYY-MM-DD'
        return formatCustomDate(date, dateOnlyFormat)

      case 'full':
        const fullOptions: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12
        }
        
        if (showTimezone) {
          fullOptions.timeZoneName = 'short'
        }
        
        return date.toLocaleString(locale, fullOptions)

      case 'relative':
        if (Math.abs(diffInDays) > relativeThreshold) {
          return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
        
        if (diffInMinutes < 1) {
          return 'Just now'
        } else if (diffInMinutes < 60) {
          return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
        } else if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
        } else {
          return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
        }

      default:
        return date.toLocaleString(locale)
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error)
    return 'Invalid Date'
  }
}

/**
 * Format date using custom format string
 * @param date - Date object
 * @param format - Format string (e.g., 'YYYY-MM-DD HH:mm')
 * @returns Formatted date string
 */
const formatCustomDate = (date: Date, format: string): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * Get the user's current timezone
 * @returns Timezone string (e.g., "America/New_York")
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns boolean
 */
export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

/**
 * Check if a date is yesterday
 * @param date - Date to check
 * @returns boolean
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear()
}

/**
 * Format date for display with smart relative formatting
 * @param apiTimestamp - ISO timestamp from API
 * @returns Formatted date string
 */
export const formatDateSmart = (apiTimestamp: string | null | undefined): string => {
  if (!apiTimestamp) {
    return 'N/A'
  }

  try {
    const date = new Date(apiTimestamp)
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    if (isToday(date)) {
      return `Today at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`
    }

    if (isYesterday(date)) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}`
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Get time difference between two dates
 * @param startDate - Start date
 * @param endDate - End date (defaults to now)
 * @returns Object with time difference in various units
 */
export const getTimeDifference = (
  startDate: string | Date,
  endDate: string | Date = new Date()
): {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
} => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diffMs
  }
}

/**
 * Format duration in a human-readable way
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 */
export const formatDuration = (milliseconds: number): string => {
  const { days, hours, minutes, seconds } = getTimeDifference(new Date(0), new Date(milliseconds))

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
} 