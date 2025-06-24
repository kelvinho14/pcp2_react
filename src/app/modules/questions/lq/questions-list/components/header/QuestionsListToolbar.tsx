import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../../../../../_metronic/helpers'

const QuestionsListToolbar = () => {
  const navigate = useNavigate()

  return (
    <div className='d-flex justify-content-end' data-kt-question-table-toolbar='base'>
      <button
        type='button'
        className='btn btn-primary'
        onClick={() => navigate('/questions/lq/create')}
      > Create New LQ
      </button>
    </div>
  )
}

export { QuestionsListToolbar } 