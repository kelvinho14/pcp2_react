import {FC, useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../../_metronic/assets/ts/components'
import {ID, KTIcon} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../../store'
import {deleteSchool} from '../../../../../../../store/admin/adminSlice'
import {ConfirmationDialog} from '../../../../../../../_metronic/helpers/ConfirmationDialog'
import toast from '../../../../../../../_metronic/helpers/toast'

type Props = {
  id: ID
}

const SchoolActionsCell: FC<Props> = ({id}) => {
  const {setItemIdForUpdate} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    setItemIdForUpdate(id)
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await dispatch(deleteSchool(String(id))).unwrap()
      toast.success('School deleted successfully!', 'Success')
    } catch (error) {
      console.error('Error deleting school:', error)
      toast.error('Failed to delete school. Please try again.', 'Error')
    }
  }

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
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
          <a className='menu-link px-3' onClick={openEditModal}>
            Edit
          </a>
        </div>
        {/* end::Menu item */}

        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <a
            className='menu-link px-3'
            data-kt-schools-table-filter='delete_row'
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
        message="Are you sure you want to delete this school? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}

export {SchoolActionsCell} 