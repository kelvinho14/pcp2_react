import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../../../../_metronic/helpers'

const ExercisesListToolbar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <button
      type='button'
      className='btn btn-sm btn-light-primary me-3'
      onClick={() => navigate('/exercises/create')}
    >
      <KTSVG path='/media/icons/duotune/arrows/arr075.svg' className='svg-icon-2' />
      Create New Exercise
    </button>
  )
}

export { ExercisesListToolbar } 