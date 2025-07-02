import {KTIcon} from '../../../../../../_metronic/helpers'
import {useNavigate} from 'react-router-dom'
import {UsersListFilter} from './UsersListFilter'

const UsersListToolbar = () => {
  const navigate = useNavigate()
  const openAddUserPage = () => {
    navigate('/admin/users/add')
  }

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      <UsersListFilter />

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
