// Role type constants
export const ROLES = {
  ADMIN: 1,
  SUPER_TEACHER: 2,
  TEACHER: 3,
  TUTOR: 4,
  ASSISTANT: 5,
  STUDENT: 6,
  PARENT: 7,
} as const

// Role names for display purposes
export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SUPER_TEACHER]: 'Super Teacher',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.TUTOR]: 'Tutor',
  [ROLES.ASSISTANT]: 'Assistant',
  [ROLES.STUDENT]: 'Student',
  [ROLES.PARENT]: 'Parent',
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