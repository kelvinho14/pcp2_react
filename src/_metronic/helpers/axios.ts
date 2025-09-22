import axios from 'axios'

// Function to get the subject_id from sessionStorage for API header
export const getSchoolSubjectId = (): string | null => {
  return sessionStorage.getItem('subject_id')
}

// Function to get the school_id from sessionStorage
export const getSchoolId = (): string | null => {
  return sessionStorage.getItem('school_id')
}

// Function to check if the current request is from admin slice
export const isAdminRequest = (url: string): boolean => {
  // Check if the URL contains admin-related endpoints
  const adminEndpoints = ['/schools']
  return adminEndpoints.some(endpoint => url.includes(endpoint))
}

// Function to check if current user is admin
export const isCurrentUserAdmin = (): boolean => {
  const currentUserRole = sessionStorage.getItem('user_role')
  return currentUserRole === '1'
}

// Function to get headers with X-School-Subject-ID if needed
export const getHeadersWithSchoolSubject = (url: string): Record<string, string> => {
  const headers: Record<string, string> = {}
  
  // Don't add header for admin requests (schools, etc.)
  if (isAdminRequest(url)) {
    return headers
  }
  
  // For user endpoints, only add header for non-admin users
  if (url.includes('/user') || url.includes('/users')) {
    if (isCurrentUserAdmin()) {
      return headers
    }
  }
  
  // For subjects endpoints, only add header for non-admin users
  if (url.includes('/subjects')) {
    if (isCurrentUserAdmin()) {
      return headers
    }
  }
  
  const schoolSubjectId = getSchoolSubjectId()
  if (schoolSubjectId) {
    headers['X-School-Subject-ID'] = schoolSubjectId
  }
  
  return headers
} 