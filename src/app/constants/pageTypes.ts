// Page type constants for dropdown placement
export const PAGE_TYPES = {
  QUESTION_LIST: 1,
  EXERCISE_LIST: 2, 
  VIDEO_LIST: 3
} as const

// Page type names for display purposes
export const PAGE_TYPE_NAMES = {
  [PAGE_TYPES.QUESTION_LIST]: 'Question List',
  [PAGE_TYPES.EXERCISE_LIST]: 'Exercise List',
  [PAGE_TYPES.VIDEO_LIST]: 'Video List'
} as const

// Type for page type values
export type PageType = typeof PAGE_TYPES[keyof typeof PAGE_TYPES]

// Helper function to get page type name
export const getPageTypeName = (pageType: PageType): string => {
  return PAGE_TYPE_NAMES[pageType] || 'Unknown Page'
}

// Helper function to check if page type is valid
export const isValidPageType = (pageType: number): pageType is PageType => {
  return Object.values(PAGE_TYPES).includes(pageType as PageType)
}
