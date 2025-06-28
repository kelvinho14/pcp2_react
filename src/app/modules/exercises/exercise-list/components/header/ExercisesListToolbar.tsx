import { useNavigate } from 'react-router-dom'

const ExercisesListToolbar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <button
      type='button'
      className='btn btn-sm btn-light-primary me-3'
      onClick={() => navigate('/exercises/create')}
    >
      Create New Exercise
    </button>
  )
}

export { ExercisesListToolbar } 