/**
 * Teacher Verification Status Constants
 * Matches the backend TeacherVerificationStatus enum
 */
export const TEACHER_VERIFICATION_STATUS = {
  NO_VERIFICATION_NEEDED: 0,    // Default state - no verification required
  PENDING_VERIFICATION: 1,      // Student requested teacher verification
  TEACHER_VERIFIED: 2,          // Teacher approved the content
  TEACHER_DISAGREED: 3,         // Teacher disagreed with the content
} as const

export type TeacherVerificationStatusType = typeof TEACHER_VERIFICATION_STATUS[keyof typeof TEACHER_VERIFICATION_STATUS]

