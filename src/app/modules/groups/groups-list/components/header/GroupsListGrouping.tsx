import {useState} from 'react'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../../store'
import {deleteSelectedGroups} from '../../../../../../store/groups/groupsSlice'
import {ConfirmationDialog} from '../../../../../../_metronic/helpers/ConfirmationDialog'
import toast from '../../../../../../_metronic/helpers/toast'

const GroupsListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const groups = useSelector((state: RootState) => state.groups.groups)
  const dispatch = useDispatch<AppDispatch>()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    try {
      // Selected IDs are now the actual group_ids (strings)
      const selectedGroupIds = (selected as any[])
        .filter((id): id is string => id !== undefined && id !== null)
      
      console.log('🔍 GroupsListGrouping - handleDeleteSelected called')
      console.log('🔍 GroupsListGrouping - selected group_ids:', selected)
      console.log('🔍 GroupsListGrouping - selectedGroupIds:', selectedGroupIds)
      
      await dispatch(deleteSelectedGroups(selectedGroupIds)).unwrap()
      clearSelected()
      toast.success(`Successfully deleted ${selectedGroupIds.length} group(s)`, 'Success')
    } catch (error) {
      console.error('Error deleting selected groups:', error)
      toast.error('Failed to delete selected groups', 'Error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClick = () => {
    console.log('🔍 GroupsListGrouping - handleDeleteClick called')
    console.log('🔍 GroupsListGrouping - selected:', selected)
    console.log('🔍 GroupsListGrouping - groups:', groups)
    
    if (selected.length === 0) {
      toast.warning('No groups selected', 'Warning')
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
          disabled={selected.length === 0 || isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Selected'}
        </button>
      </div>

      <ConfirmationDialog
        show={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteSelected}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${selected.length} selected group(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        loadingText="Deleting..."
      />
    </>
  )
}

export {GroupsListGrouping} 