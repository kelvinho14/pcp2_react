import { FC } from 'react'
import { User } from '../../core/_models'
import { getSchoolSubjectId } from '../../../../../../_metronic/helpers/axios'
import { useAuth } from '../../../../auth/core/Auth'
import { ROLES, getRoleName, RoleType } from '../../../../../constants/roles'

type Props = {
  user: User
}

const UserRoleCell: FC<Props> = ({ user }) => {
  const { currentUser } = useAuth()
  const currentSchoolSubjectId = getSchoolSubjectId()
  
  // For admin users, don't show role column
  if (currentUser?.role?.role_type === ROLES.ADMIN) {
    return null
  }
  
  // For non-admin users, find the user_subject that matches the current school_subject_id
  const matchingUserSubject = user.user_subjects?.find(
    us => us.school_subject_id === currentSchoolSubjectId
  )
  
  if (!matchingUserSubject) {
    return <span className='text-muted'>No role for this subject</span>
  }

  return (
    <div className='badge badge-light-primary fw-bolder'>
      {getRoleName(matchingUserSubject.role.role_type as RoleType)}
    </div>
  )
}

export { UserRoleCell } 