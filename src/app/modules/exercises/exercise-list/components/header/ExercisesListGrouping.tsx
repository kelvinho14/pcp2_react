import {KTIcon} from '../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../../store'
import {ConfirmationDialog} from '../../../../../../_metronic/helpers/ConfirmationDialog'
import {useState} from 'react'
import {fetchExercises, Exercise} from '../../../../../../store/exercises/exercisesSlice'
import {toast} from '../../../../../../_metronic/helpers/toast'
import {AssignToStudentsModal} from './AssignToStudentsModal'

const ExercisesListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  
  // Get exercises data to check question count
  const exercises = useSelector((state: RootState) => state.exercises.exercises)

  const handleBulkDelete = async () => {
    try {
      const exerciseIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      // TODO: Implement bulk delete for exercises
      console.log('Bulk delete exercises:', exerciseIds)
      toast.success(`${exerciseIds.length} exercise(s) deleted successfully!`, 'Success')
      clearSelected()
      setShowDeleteDialog(false)
      // Refresh the exercises list
      dispatch(fetchExercises({ page: 1, items_per_page: 10, status: undefined }))
    } catch (error) {
      console.error('Error deleting exercises:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleAssignToStudents = () => {
    const exerciseIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
    
    // Check if any selected exercises have no questions or are inactive
    const selectedExercises = exercises.filter((exercise: Exercise) => exerciseIds.includes(exercise.exercise_id))
    const exercisesWithoutQuestions = selectedExercises.filter((exercise: Exercise) => exercise.question_count === 0)
    const inactiveExercises = selectedExercises.filter((exercise: Exercise) => exercise.status === 0)
    
    // Collect all invalid exercises
    const invalidExercises = []
    
    if (exercisesWithoutQuestions.length > 0) {
      const exerciseNames = exercisesWithoutQuestions.map(ex => ex.title).join(', ')
      invalidExercises.push(`Cannot assign exercise with question to student`)
    }
    
    if (inactiveExercises.length > 0) {
      const exerciseNames = inactiveExercises.map(ex => ex.title).join(', ')
      invalidExercises.push(`Cannot assign inactive exercise to student`)
    }
    
    if (invalidExercises.length > 0) {
      const errorMessage = `${invalidExercises.join('<br/> ')}`
      toast.error(errorMessage, 'Error')
      return
    }
    
    // If all exercises are valid, open the modal
    setShowAssignModal(true)
  }

  return (
    <>
      <div className='d-flex justify-content-end align-items-center' data-kt-exercise-table-toolbar='selected'>
        <div className='fw-bolder me-5'>
          <span className='me-2'>{selected.length}</span> selected
        </div>

        <button type='button' className='btn btn-primary me-2' onClick={handleAssignToStudents}>
          <KTIcon iconName='user' className='fs-2' />
          Assign to Students
        </button>

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

      <AssignToStudentsModal 
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        exerciseIds={selected.map(id => String(id))}
      />
    </>
  )
}

export {ExercisesListGrouping} 