import {useState} from 'react'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../store'
import {deleteSelectedUsers} from '../../../../../../store/user/userSlice'
import {ConfirmationDialog} from '../../../../../../_metronic/helpers/ConfirmationDialog'
import toast from '../../../../../../_metronic/helpers/toast'

const UsersListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleDeleteSelected = async () => {
    try {
      // Filter out undefined and null values
      const validSelected = selected.filter((id): id is number => id !== undefined && id !== null)
      await dispatch(deleteSelectedUsers(validSelected)).unwrap()
      clearSelected()
      toast.success(`Successfully deleted ${validSelected.length} user(s)`, 'Success')
    } catch (error) {
      console.error('Error deleting selected users:', error)
      toast.error('Failed to delete selected users', 'Error')
    }
  }

  const handleDeleteClick = () => {
    if (selected.length === 0) {
      toast.warning('No users selected', 'Warning')
      return
    }
    setShowConfirmDialog(true)
  }

  return (
    <>
      <div className='d-flex justify-content-end align-items-center'>
        <div className='fw-bolder me-5'>
          <span className='me-2'>{selected.length}</span> Selected
        </div>

        <button
          type='button'
          className='btn btn-danger'
          onClick={handleDeleteClick}
          disabled={selected.length === 0}
        >
          Delete Selected
        </button>
      </div>

      <ConfirmationDialog
        show={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteSelected}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${selected.length} selected user(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}

export {UsersListGrouping}
