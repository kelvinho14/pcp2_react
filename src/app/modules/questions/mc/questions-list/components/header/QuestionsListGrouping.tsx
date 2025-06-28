import {KTIcon} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../../store'
import {ConfirmationDialog} from '../../../../../../../_metronic/helpers/ConfirmationDialog'
import {useState} from 'react'
import {bulkDeleteQuestions, fetchQuestions} from '../../../../../../../store/questions/questionsSlice'
import {toast} from '../../../../../../../_metronic/helpers/toast'

const QuestionsListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleBulkDelete = async () => {
    try {
      const questionIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(bulkDeleteQuestions(questionIds)).unwrap()
      toast.success(`${questionIds.length} question(s) deleted successfully!`, 'Success')
      clearSelected()
      setShowDeleteDialog(false)
      // Refresh the MC questions list
      dispatch(fetchQuestions({ type: 'mc', page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error deleting questions:', error)
      // Error toast is handled by the thunk
    }
  }

  return (
    <>
      <div className='d-flex justify-content-end align-items-center' data-kt-question-table-toolbar='selected'>
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
        title="Delete Questions"
        message={`Are you sure you want to delete ${selected.length} selected question(s)? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export {QuestionsListGrouping} 