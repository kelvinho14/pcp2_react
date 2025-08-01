import {KTIcon} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../../store'
import {bulkDeleteSchools} from '../../../../../../../store/admin/adminSlice'
import {ConfirmationDialog} from '../../../../../../../_metronic/helpers/ConfirmationDialog'
import {useState} from 'react'
import toast from '../../../../../../../_metronic/helpers/toast'

const SchoolsListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleBulkDelete = async () => {
    try {
      const schoolIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(bulkDeleteSchools(schoolIds)).unwrap()
      toast.success(`Successfully deleted ${schoolIds.length} school(s)!`, 'Success')
      clearSelected()
    } catch (error) {
      console.error('Error deleting schools:', error)
      toast.error('Failed to delete selected schools. Please try again.', 'Error')
    }
  }

  return (
    <>
      <div className='d-flex justify-content-end align-items-center' data-kt-school-table-toolbar='selected'>
        <div className='fw-bolder me-5'>
          <span className='me-2'>{selected.length}</span> selected
        </div>

        <button type='button' className='btn btn-danger' onClick={() => setShowDeleteDialog(true)}>
          <KTIcon iconName='trash' className='fs-2' />
          Delete Selected
        </button>
      </div>

      <ConfirmationDialog
        show={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Schools"
        message={`Are you sure you want to delete ${selected.length} selected school(s)? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export {SchoolsListGrouping} 