// Role type constants
export const ROLES = {
  SUPER_ADMIN: 1,
  STUDENT: 2,
  SUPER_TEACHER: 3,
  TEACHER: 4,
  TUTOR: 5,
  ASSISTANT: 6,
  CUSTOM_ROLE: 7,
} as const

// Role names for display purposes
export const ROLE_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.STUDENT]: 'Student',
  [ROLES.SUPER_TEACHER]: 'Super Teacher',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.TUTOR]: 'Tutor',
  [ROLES.ASSISTANT]: 'Assistant',
  [ROLES.CUSTOM_ROLE]: 'Custom Role',
} as const

// Type for role values
export type RoleType = typeof ROLES[keyof typeof ROLES]

// Helper function to get role name
export const getRoleName = (roleType: RoleType): string => {
  return ROLE_NAMES[roleType] || 'Unknown Role'
}


// Helper function to check if role type is valid
export const isValidRoleType = (roleType: number): roleType is RoleType => {
  return Object.values(ROLES).includes(roleType as RoleType)
} 