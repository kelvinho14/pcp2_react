import {FC} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '../../modules/auth'
import {isTeachingStaff} from '../../constants/roles'

interface TeacherRouteGuardProps {
  children: React.ReactNode
}

const TeacherRouteGuard: FC<TeacherRouteGuardProps> = ({children}) => {
  const {currentUser} = useAuth()

  // Check if user is logged in and has teaching staff role
  if (!currentUser || !isTeachingStaff(currentUser.role?.role_type)) {
    // Redirect to dashboard if not authorized
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}

export default TeacherRouteGuard 