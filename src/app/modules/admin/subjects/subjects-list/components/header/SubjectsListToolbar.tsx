import {KTIcon} from '../../../../../../../_metronic/helpers'

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
      <button type='button' className='btn btn-primary' onClick={openAddSubjectPage}>
        <KTIcon iconName='plus' className='fs-2' />
        Add Subject
      </button>
    </div>
  )
}

export {SubjectsListToolbar} 