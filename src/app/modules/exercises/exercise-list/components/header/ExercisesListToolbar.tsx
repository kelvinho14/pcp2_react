import { useNavigate } from 'react-router-dom'

const ExercisesListToolbar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <button
      type='button'
      className='btn btn-sm btn-primary me-3'
      onClick={() => navigate('/exercises/create')}
    >
      <i className='fas fa-plus me-1'></i>
      Create New Exercise
    </button>
  )
}

export { ExercisesListToolbar } 