export const ASSIGNMENT_STATUS = {
  ASSIGNED: 0,
  IN_PROGRESS: 1,
  SUBMITTED: 2,
  GRADED: 3,
  OVERDUE: 4,
  SUBMITTEDBYTEACHER: 5,
} as const

export type AssignmentStatus = typeof ASSIGNMENT_STATUS[keyof typeof ASSIGNMENT_STATUS]

// Helper function to get status label
export const getStatusLabel = (status: AssignmentStatus): string => {
  switch (status) {
    case ASSIGNMENT_STATUS.ASSIGNED:
      return 'Not Started'
    case ASSIGNMENT_STATUS.IN_PROGRESS:
      return 'In Progress'
    case ASSIGNMENT_STATUS.SUBMITTED:
      return 'Submitted'
    case ASSIGNMENT_STATUS.GRADED:
      return 'Graded'
    case ASSIGNMENT_STATUS.OVERDUE:
      return 'Overdue'
    case ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER:
      return 'Teacher Submitted'
    default:
      return 'Unknown'
  }
}

// Helper function to get status color
export const getStatusColor = (status: AssignmentStatus): string => {
  switch (status) {
    case ASSIGNMENT_STATUS.ASSIGNED:
      return 'secondary'
    case ASSIGNMENT_STATUS.IN_PROGRESS:
      return 'warning'
    case ASSIGNMENT_STATUS.SUBMITTED:
      return 'success'
    case ASSIGNMENT_STATUS.GRADED:
      return 'primary'
    case ASSIGNMENT_STATUS.OVERDUE:
      return 'danger'
    case ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER:
      return 'info'
    default:
      return 'secondary'
  }
}

// Helper function to get status hex color
export const getStatusHexColor = (status: AssignmentStatus): string => {
  switch (status) {
    case ASSIGNMENT_STATUS.ASSIGNED:
      return '#adb5bd' // Light grey
    case ASSIGNMENT_STATUS.IN_PROGRESS:
      return '#ffc107' // Yellow
    case ASSIGNMENT_STATUS.SUBMITTED:
      return '#28a745' // Green
    case ASSIGNMENT_STATUS.GRADED:
      return '#3699ff' // Blue
    case ASSIGNMENT_STATUS.OVERDUE:
      return '#dc3545' // Red
    case ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER:
      return '#17a2b8' // Info blue
    default:
      return '#6c757d' // Grey
  }
}

// Helper function to get status background color (with opacity)
export const getStatusBackgroundColor = (status: AssignmentStatus): string => {
  switch (status) {
    case ASSIGNMENT_STATUS.ASSIGNED:
      return 'rgba(173, 181, 189, 0.1)' // Light grey with opacity
    case ASSIGNMENT_STATUS.IN_PROGRESS:
      return 'rgba(255, 193, 7, 0.1)' // Yellow with opacity
    case ASSIGNMENT_STATUS.SUBMITTED:
      return 'rgba(40, 167, 69, 0.1)' // Green with opacity
    case ASSIGNMENT_STATUS.GRADED:
      return 'rgba(54, 153, 255, 0.1)' // Blue with opacity
    case ASSIGNMENT_STATUS.OVERDUE:
      return 'rgba(220, 53, 69, 0.1)' // Red with opacity
    case ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER:
      return 'rgba(23, 162, 184, 0.1)' // Info blue with opacity
    default:
      return 'rgba(108, 117, 125, 0.1)' // Grey with opacity
  }
}

// Helper function to get status icon
export const getStatusIcon = (status: AssignmentStatus): string => {
  switch (status) {
    case ASSIGNMENT_STATUS.ASSIGNED:
      return 'fas fa-clock'
    case ASSIGNMENT_STATUS.IN_PROGRESS:
      return 'fas fa-play'
    case ASSIGNMENT_STATUS.SUBMITTED:
      return 'fas fa-check-circle'
    case ASSIGNMENT_STATUS.GRADED:
      return 'fas fa-star'
    case ASSIGNMENT_STATUS.OVERDUE:
      return 'fas fa-exclamation-triangle'
    case ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER:
      return 'fas fa-user-tie'
    default:
      return 'fas fa-question-circle'
  }
} 