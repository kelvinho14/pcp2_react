import {FC, useEffect, useState} from 'react'
import {MenuComponent} from '../../../../../../_metronic/assets/ts/components'
import {ID, KTIcon} from '../../../../../../_metronic/helpers'
import {useNavigate} from 'react-router-dom'
import {ConfirmationDialog} from '../../../../../../_metronic/helpers/ConfirmationDialog'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../store'
import {fetchExercises, deleteExercise} from '../../../../../../store/exercises/exercisesSlice'
import {toast} from '../../../../../../_metronic/helpers/toast'

type Props = {
  id: ID
}

const ExerciseActionsCell: FC<Props> = ({id}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    navigate(`/exercises/edit/${id}`)
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await dispatch(deleteExercise(id.toString())).unwrap()
      setShowConfirmDialog(false)
      // Refresh the exercises list
      dispatch(fetchExercises({ page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error deleting exercise:', error)
      // Error toast is handled by the thunk
    } finally {
      setIsDeleting(false)
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
            data-kt-exercises-table-filter='delete_row'
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
        message="Are you sure you want to delete this exercise? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}

export {ExerciseActionsCell} 