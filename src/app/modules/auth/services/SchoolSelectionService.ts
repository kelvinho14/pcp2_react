import { UserModel, School, SchoolSubject } from '../core/_models'

interface StoredSchoolSelection {
  school_id: string
  school_name: string
  subject_id: string
  subject_name: string
}

interface SchoolSelectionResult {
  needsSelection: boolean
  autoSelected?: StoredSchoolSelection
  availableSchools?: School[]
}

class SchoolSelectionService {
  private static readonly STORAGE_KEYS = {
    SCHOOL_ID: 'school_id',
    SCHOOL_NAME: 'school_name',
    SUBJECT_ID: 'subject_id', // Keep consistent with other storage keys
    SUBJECT_NAME: 'subject_name'
  } as const

  /**
   * Determines what action to take based on user's role and schools data
   */
  static processUserSchoolSelection(user: UserModel): SchoolSelectionResult {
    // Admin users skip school selection
    if (this.isAdmin(user)) {
      return { needsSelection: false }
    }

    // No schools data - skip selection
    if (!this.hasSchoolsData(user)) {
      return { needsSelection: false }
    }

    // Single school with single subject - auto-select
    const singleSelection = this.getSingleSchoolSubjectSelection(user.schools!)
    if (singleSelection) {
      this.storeSelection(singleSelection)
      return { 
        needsSelection: false, 
        autoSelected: singleSelection 
      }
    }

    // Multiple options - needs user selection
    return { 
      needsSelection: true, 
      availableSchools: user.schools 
    }
  }

  /**
   * Validates and returns stored selection if it matches user's available schools
   */
  static getValidStoredSelection(user: UserModel): StoredSchoolSelection | null {
    const stored = this.getStoredSelection()
    if (!stored || this.isAdmin(user) || !this.hasSchoolsData(user)) {
      return null
    }

    // Validate stored selection against user's current schools
    const isValid = this.validateStoredSelectionAgainstUser(stored, user)
    return isValid ? stored : null
  }

  /**
   * Stores school and subject selection in session storage
   */
  static storeSelection(selection: StoredSchoolSelection): void {
    const { SCHOOL_ID, SCHOOL_NAME, SUBJECT_ID, SUBJECT_NAME } = this.STORAGE_KEYS
    
    sessionStorage.setItem(SCHOOL_ID, selection.school_id)
    sessionStorage.setItem(SCHOOL_NAME, selection.school_name)
    sessionStorage.setItem(SUBJECT_ID, selection.subject_id) // Stored as 'subject_id'
    sessionStorage.setItem(SUBJECT_NAME, selection.subject_name)

    console.log('✅ Stored school/subject selection:', selection)
  }

  /**
   * Retrieves stored selection from session storage
   */
  static getStoredSelection(): StoredSchoolSelection | null {
    const { SCHOOL_ID, SCHOOL_NAME, SUBJECT_ID, SUBJECT_NAME } = this.STORAGE_KEYS
    
    const school_id = sessionStorage.getItem(SCHOOL_ID)
    const school_name = sessionStorage.getItem(SCHOOL_NAME)
    const subject_id = sessionStorage.getItem(SUBJECT_ID)
    const subject_name = sessionStorage.getItem(SUBJECT_NAME)

    if (!school_id || !school_name || !subject_id || !subject_name) {
      return null
    }

    return { school_id, school_name, subject_id, subject_name }
  }

  /**
   * Clears stored selection from session storage
   */
  static clearStoredSelection(): void {
    const { SCHOOL_ID, SCHOOL_NAME, SUBJECT_ID, SUBJECT_NAME } = this.STORAGE_KEYS
    
    sessionStorage.removeItem(SCHOOL_ID)
    sessionStorage.removeItem(SCHOOL_NAME)
    sessionStorage.removeItem(SUBJECT_ID)
    sessionStorage.removeItem(SUBJECT_NAME)

    console.log('🧹 Cleared stored school/subject selection')
  }

  /**
   * Check if user is admin
   */
  private static isAdmin(user: UserModel): boolean {
    return user.role?.role_type === 1
  }

  /**
   * Check if user has schools data
   */
  private static hasSchoolsData(user: UserModel): boolean {
    return !!(user.schools && Array.isArray(user.schools) && user.schools.length > 0)
  }

  /**
   * Returns auto-selection data if user has exactly 1 school with 1 subject
   */
  private static getSingleSchoolSubjectSelection(schools: School[]): StoredSchoolSelection | null {
    if (schools.length !== 1) return null

    const school = schools[0]
    const subjects = school.school_subjects

    if (!subjects || subjects.length !== 1) return null

    const subject = subjects[0]

    return {
      school_id: school.school_id,
      school_name: school.school_name,
      subject_id: subject.subject_id,
      subject_name: subject.subject_name
    }
  }

  /**
   * Validates that stored selection exists in user's current schools
   */
  private static validateStoredSelectionAgainstUser(
    stored: StoredSchoolSelection, 
    user: UserModel
  ): boolean {
    if (!user.schools) return false

    for (const school of user.schools) {
      if (school.school_id === stored.school_id) {
        const subject = school.school_subjects?.find(s => s.subject_id === stored.subject_id)
        return !!subject
      }
    }

    return false
  }
}

export default SchoolSelectionService
export type { StoredSchoolSelection, SchoolSelectionResult } 