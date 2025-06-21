import {FC, ReactNode} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '../auth'

interface AdminRouteGuardProps {
  children: ReactNode
}

const AdminRouteGuard: FC<AdminRouteGuardProps> = ({children}) => {
  const {currentUser} = useAuth()

  // Check if user is logged in and has admin role (role_type === 1)
  if (!currentUser || currentUser.role.role_type !== 1) {
    // Redirect to dashboard if not authorized
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}

export default AdminRouteGuard 