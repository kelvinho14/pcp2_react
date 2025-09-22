import {FC} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '../../modules/auth'
import {ROLES} from '../../constants/roles'

interface NonStudentRouteGuardProps {
  children: React.ReactNode
}

const NonStudentRouteGuard: FC<NonStudentRouteGuardProps> = ({children}) => {
  const {currentUser} = useAuth()

  // Check if user is logged in and is NOT a student
  if (!currentUser || currentUser.role?.role_type === ROLES.STUDENT) {
    // Redirect to dashboard if not authorized (student or not logged in)
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}

export default NonStudentRouteGuard
