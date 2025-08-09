import {FC} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '../../modules/auth'
import {ROLES} from '../../constants/roles'

interface StudentRouteGuardProps {
  children: React.ReactNode
}

const StudentRouteGuard: FC<StudentRouteGuardProps> = ({children}) => {
  const {currentUser} = useAuth()

  // Check if user is logged in and has student role
  if (!currentUser || currentUser.role?.role_type !== ROLES.STUDENT) {
    // Redirect to dashboard if not authorized
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}

export default StudentRouteGuard 