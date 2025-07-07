import {KTIcon} from '../../../../../../_metronic/helpers'
import {useNavigate} from 'react-router-dom'
import {UsersListFilter} from './UsersListFilter'
import {useAuth} from '../../../../auth/core/Auth'
import {ROLES} from '../../../../../constants/roles'

type Props = {
  setRoleFilter: (role: string) => void
  setSchoolFilter?: (school: string) => void
  setSubjectFilter?: (subject: string) => void
}

const UsersListToolbar = ({ setRoleFilter, setSchoolFilter, setSubjectFilter }: Props) => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role?.role_type === ROLES.ADMIN
  
  const openAddUserPage = () => {
    const addPath = isAdmin ? '/admin/users/add' : '/users/add'
    navigate(addPath)
  }

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      <UsersListFilter setRoleFilter={setRoleFilter} setSchoolFilter={setSchoolFilter} setSubjectFilter={setSubjectFilter} />

      {/* begin::Export */}
      <button type='button' className='btn btn-light-primary me-3'>
        <KTIcon iconName='exit-up' className='fs-2' />
        Export
      </button>
      {/* end::Export */}

      {/* begin::Add user */}
      <button type='button' className='btn btn-primary' onClick={openAddUserPage}>
        <KTIcon iconName='plus' className='fs-2' />
        Add User
      </button>
      {/* end::Add user */}
    </div>
  )
}

export {UsersListToolbar}
