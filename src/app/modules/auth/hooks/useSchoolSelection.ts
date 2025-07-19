import {useState, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../core/Auth'
import SchoolSelectionService, {StoredSchoolSelection} from '../services/SchoolSelectionService'
import {UserModel} from '../core/_models'

interface UseSchoolSelectionReturn {
  showSubjectModal: boolean
  userSchools: UserModel['schools'] | undefined
  pendingUser: UserModel | null
  isProcessing: boolean
  handleSchoolSubjectSelection: (schoolId: string, schoolName: string, subjectId: string, subjectName: string) => void
  processUserAfterLogin: (user: UserModel) => void
  checkExistingUserSession: (currentUser: UserModel | undefined) => void
}

export const useSchoolSelection = (): UseSchoolSelectionReturn => {
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [userSchools, setUserSchools] = useState<UserModel['schools']>(undefined)
  const [pendingUser, setPendingUser] = useState<UserModel | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const {setCurrentUser} = useAuth()
  const navigate = useNavigate()

  const handleSchoolSubjectSelection = useCallback((
    schoolId: string, 
    schoolName: string, 
    subjectId: string, 
    subjectName: string
  ) => {
    const selection: StoredSchoolSelection = {
      school_id: schoolId,
      school_name: schoolName,
      subject_id: subjectId,
      subject_name: subjectName
    }
    
    SchoolSelectionService.storeSelection(selection)
    setShowSubjectModal(false)
    
    if (pendingUser) {
      setCurrentUser(pendingUser)
      setPendingUser(null)
    }
    
    navigate('/dashboard')
  }, [pendingUser, setCurrentUser, navigate])

  const processUserAfterLogin = useCallback((user: UserModel) => {
    setIsProcessing(true)
    
    const result = SchoolSelectionService.processUserSchoolSelection(user)
    
    if (!result.needsSelection) {
      setCurrentUser(user)
      navigate('/dashboard')
      setIsProcessing(false)
      return
    }

    if (result.availableSchools) {
      setPendingUser(user)
      setUserSchools(result.availableSchools)
      setShowSubjectModal(true)
    }
    
    setIsProcessing(false)
  }, [setCurrentUser, navigate])

  const checkExistingUserSession = useCallback((currentUser: UserModel | undefined) => {
    if (!currentUser) return

    const stored = SchoolSelectionService.getStoredSelection()
    if (stored?.school_id && stored?.school_name && stored?.subject_id && stored?.subject_name) {
      navigate('/dashboard')
    } else {
      processUserAfterLogin(currentUser)
    }
  }, [navigate, processUserAfterLogin])

  return {
    showSubjectModal,
    userSchools,
    pendingUser,
    isProcessing,
    handleSchoolSubjectSelection,
    processUserAfterLogin,
    checkExistingUserSession
  }
} 