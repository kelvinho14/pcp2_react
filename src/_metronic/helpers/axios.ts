import axios from 'axios'

// Function to get the school_subject_id from localStorage
export const getSchoolSubjectId = (): string | null => {
  return sessionStorage.getItem('school_subject_id')
}

// Function to check if the current request is from admin slice
export const isAdminRequest = (url: string): boolean => {
  // Check if the URL contains admin-related endpoints
  const adminEndpoints = ['/subjects', '/schools', '/school-subjects']
  return adminEndpoints.some(endpoint => url.includes(endpoint))
}

// Function to get headers with X-School-Subject-ID if needed
export const getHeadersWithSchoolSubject = (url: string): Record<string, string> => {
  const headers: Record<string, string> = {}
  
  // Don't add header for admin requests
  if (isAdminRequest(url)) {
    return headers
  }
  
  const schoolSubjectId = getSchoolSubjectId()
  if (schoolSubjectId) {
    headers['X-School-Subject-ID'] = schoolSubjectId
  }
  
  return headers
} 