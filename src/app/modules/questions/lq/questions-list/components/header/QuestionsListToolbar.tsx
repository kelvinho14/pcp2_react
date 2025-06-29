import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../../../../../_metronic/helpers'

const QuestionsListToolbar = () => {
  const navigate = useNavigate()

  return (
    <div className='d-flex justify-content-end' data-kt-question-table-toolbar='base'>
      <button
        type='button'
        className='btn btn-sm btn-primary me-3'
        onClick={() => navigate('/questions/lq/create')}
      >
        <i className='fas fa-plus me-1'></i>
        Create New LQ
      </button>
    </div>
  )
}

export { QuestionsListToolbar } 