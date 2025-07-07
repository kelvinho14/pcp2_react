import {FC, useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../_metronic/assets/ts/components'
import {ID, KTIcon} from '../../../../../../_metronic/helpers'
import {User} from '../../core/_models'
import {useIntl} from 'react-intl'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../store'
import {deleteUser} from '../../../../../../store/user/userSlice'
import {ConfirmationDialog} from '../../../../../../_metronic/helpers/ConfirmationDialog'
import toast from '../../../../../../_metronic/helpers/toast'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../../../auth/core/Auth'
import {ROLES} from '../../../../../constants/roles'

type Props = {
  id: ID
}

const UserActionsCell: FC<Props> = ({id}) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const handleDelete = async () => {
    if (!id) return
    try {
      await dispatch(deleteUser(id)).unwrap()
      toast.success('User deleted successfully', 'Success')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user', 'Error')
    }
  }

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
  }

  const handleEditClick = () => {
    // Determine the correct edit path based on user role
    const isAdmin = currentUser?.role?.role_type === ROLES.ADMIN
    const editPath = isAdmin ? `/admin/users/edit/${id}` : `/users/edit/${id}`
    navigate(editPath)
  }

  return (
    <>
      <a
        href='#'
        className='btn btn-light btn-active-light-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        Actions
        <KTIcon iconName='down' className='fs-5 m-0' />
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <a
            className='menu-link px-3'
            onClick={handleEditClick}
          >
            Edit
          </a>
        </div>
        {/* end::Menu item */}
        
        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <a
            className='menu-link px-3'
            data-kt-users-table-filter='delete_row'
            onClick={handleDeleteClick}
          >
            Delete
          </a>
        </div>
        {/* end::Menu item */}
      </div>
      {/* end::Menu */}

      <ConfirmationDialog
        show={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}

export {UserActionsCell}
