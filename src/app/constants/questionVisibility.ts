/**
 * Question Visibility Levels
 * Determines who can see and use a question
 */
export const QUESTION_VISIBILITY = {
  PRIVATE: 0,          // Only creator can see/use
  SUBJECT_SHARED: 1,   // All teachers in school_subject can see (default)
  SCHOOL_SHARED: 2,    // All teachers in school can see
  PUBLIC: 3,           // Everyone can see
} as const

export type QuestionVisibility = typeof QUESTION_VISIBILITY[keyof typeof QUESTION_VISIBILITY]

/**
 * Helper function to get visibility label
 */
export const getVisibilityLabel = (visibility: QuestionVisibility): string => {
  switch (visibility) {
    case QUESTION_VISIBILITY.PRIVATE:
      return 'Private'
    case QUESTION_VISIBILITY.SUBJECT_SHARED:
      return 'Subject Shared'
    case QUESTION_VISIBILITY.SCHOOL_SHARED:
      return 'School Shared'
    case QUESTION_VISIBILITY.PUBLIC:
      return 'Public'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function to get visibility description
 */
export const getVisibilityDescription = (visibility: QuestionVisibility): string => {
  switch (visibility) {
    case QUESTION_VISIBILITY.PRIVATE:
      return 'Only you can see/use this question'
    case QUESTION_VISIBILITY.SUBJECT_SHARED:
      return 'All teachers in your subject can see/use this question'
    case QUESTION_VISIBILITY.SCHOOL_SHARED:
      return 'All teachers in your school can see/use this question'
    case QUESTION_VISIBILITY.PUBLIC:
      return 'Everyone can see/use this question'
    default:
      return ''
  }
}

/**
 * Helper function to get visibility icon
 */
export const getVisibilityIcon = (visibility: QuestionVisibility): string => {
  switch (visibility) {
    case QUESTION_VISIBILITY.PRIVATE:
      return 'fa-lock'
    case QUESTION_VISIBILITY.SUBJECT_SHARED:
      return 'fa-users'
    case QUESTION_VISIBILITY.SCHOOL_SHARED:
      return 'fa-school'
    case QUESTION_VISIBILITY.PUBLIC:
      return 'fa-globe'
    default:
      return 'fa-question-circle'
  }
}

/**
 * Helper function to get visibility badge color
 */
export const getVisibilityBadgeClass = (visibility: QuestionVisibility): string => {
  switch (visibility) {
    case QUESTION_VISIBILITY.PRIVATE:
      return 'badge-light-danger'
    case QUESTION_VISIBILITY.SUBJECT_SHARED:
      return 'badge-light-primary'
    case QUESTION_VISIBILITY.SCHOOL_SHARED:
      return 'badge-light-info'
    case QUESTION_VISIBILITY.PUBLIC:
      return 'badge-light-success'
    default:
      return 'badge-light-secondary'
  }
}

