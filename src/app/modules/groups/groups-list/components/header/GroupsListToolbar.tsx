import {useNavigate} from 'react-router-dom'
import {KTIcon} from '../../../../../../_metronic/helpers'

const GroupsListToolbar = () => {
  const navigate = useNavigate()
  
  const openAddGroupPage = () => {
    navigate('/groups/add')
  }

  return (
    <div className='d-flex justify-content-end' data-kt-group-table-toolbar='base'>
      {/* begin::Export */}
      <button type='button' className='btn btn-light-primary me-3'>
        <KTIcon iconName='exit-up' className='fs-2' />
        Export
      </button>
      {/* end::Export */}

      {/* begin::Add group */}
      <button type='button' className='btn btn-primary' onClick={openAddGroupPage}>
        <KTIcon iconName='plus' className='fs-2' />
        Add Group
      </button>
      {/* end::Add group */}
    </div>
  )
}

export {GroupsListToolbar} 