import {KTIcon} from '../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../store'
import {ConfirmationDialog} from '../../../../../../_metronic/helpers/ConfirmationDialog'
import {useState} from 'react'
import {fetchExercises} from '../../../../../../store/exercises/exercisesSlice'
import {toast} from '../../../../../../_metronic/helpers/toast'

const ExercisesListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleBulkDelete = async () => {
    try {
      const exerciseIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      // TODO: Implement bulk delete for exercises
      console.log('Bulk delete exercises:', exerciseIds)
      toast.success(`${exerciseIds.length} exercise(s) deleted successfully!`, 'Success')
      clearSelected()
      setShowDeleteDialog(false)
      // Refresh the exercises list
      dispatch(fetchExercises({ page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error deleting exercises:', error)
      // Error toast is handled by the thunk
    }
  }

  return (
    <>
      <div className='d-flex justify-content-end align-items-center' data-kt-exercise-table-toolbar='selected'>
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
        title="Delete Exercises"
        message={`Are you sure you want to delete ${selected.length} selected exercise(s)? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export {ExercisesListGrouping} 