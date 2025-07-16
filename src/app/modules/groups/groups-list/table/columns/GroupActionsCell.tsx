import {FC, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {AppDispatch} from '../../../../../../store'
import {deleteGroup} from '../../../../../../store/groups/groupsSlice'
import {Group} from '../../core/_models'
import {MenuComponent} from '../../../../../../_metronic/assets/ts/components'
import {KTIcon} from '../../../../../../_metronic/helpers'
import toast from '../../../../../../_metronic/helpers/toast'

type Props = {
  id: string
}

const GroupActionsCell: FC<Props> = ({id}) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const handleDelete = async () => {
    if (!id) return
    try {
      await dispatch(deleteGroup(id)).unwrap()
      toast.success('Group deleted successfully', 'Success')
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Failed to delete group', 'Error')
    }
  }

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
  }

  const handleEditClick = () => {
    navigate(`/groups/edit/${id}`)
  }

  return (
    <>
      <button
        className='btn btn-light btn-active-light-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        Actions
        <KTIcon iconName='down' className='fs-5 m-0' />
      </button>
      <div className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold w-125px' data-kt-menu='true'>
        <div className='menu-item px-3'>
          <a className='menu-link px-3' onClick={handleEditClick}>
            Edit
          </a>
        </div>
        <div className='menu-item px-3'>
          <a className='menu-link px-3 text-danger' onClick={handleDeleteClick}>
            Delete
          </a>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <>
          {/* Backdrop */}
          <div className='modal-backdrop fade show'></div>
          <div className='modal fade show' style={{display: 'block'}} tabIndex={-1}>
            <div className='modal-dialog modal-dialog-centered'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Confirm Delete</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setShowConfirmDialog(false)}
                  ></button>
                </div>
                <div className='modal-body'>
                  <p>Are you sure you want to delete this group?</p>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    className='btn btn-danger'
                    onClick={() => {
                      handleDelete()
                      setShowConfirmDialog(false)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export {GroupActionsCell} 