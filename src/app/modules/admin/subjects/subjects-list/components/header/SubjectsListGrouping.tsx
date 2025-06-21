import {KTIcon} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../../store'
import {bulkDeleteSubjects} from '../../../../../../../store/subjects/subjectsSlice'
import {ConfirmationDialog} from '../../../../../../../_metronic/helpers/ConfirmationDialog'
import {useState} from 'react'

const SubjectsListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleBulkDelete = async () => {
    try {
      const subjectIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(bulkDeleteSubjects(subjectIds)).unwrap()
      clearSelected()
    } catch (error) {
      console.error('Error deleting subjects:', error)
    }
  }

  return (
    <>
      <div className='d-flex justify-content-end align-items-center' data-kt-subject-table-toolbar='selected'>
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
        title="Delete Subjects"
        message={`Are you sure you want to delete ${selected.length} selected subject(s)? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export {SubjectsListGrouping} 