import {KTIcon} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {SubjectsListFilter} from './SubjectsListFilter'
import {useNavigate} from 'react-router-dom'

const SubjectsListToolbar = () => {
  const navigate = useNavigate()
  
  const openAddSubjectPage = () => {
    navigate('/admin/subjects/create')
  }

  return (
    <div className='d-flex justify-content-end' data-kt-subject-table-toolbar='base'>
      <SubjectsListFilter />

      {/* begin::Export */}
      <button type='button' className='btn btn-light-primary me-3'>
        <KTIcon iconName='exit-up' className='fs-2' />
        Export
      </button>
      {/* end::Export */}

      {/* begin::Add subject */}
      <button type='button' className='btn btn-primary' onClick={openAddSubjectPage}>
        <KTIcon iconName='plus' className='fs-2' />
        Add Subject
      </button>
      {/* end::Add subject */}
    </div>
  )
}

export {SubjectsListToolbar} 