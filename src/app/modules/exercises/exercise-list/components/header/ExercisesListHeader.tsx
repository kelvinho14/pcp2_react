import { useNavigate } from 'react-router-dom'
import { KTSVG } from '../../../../../../_metronic/helpers'
import { ExercisesListSearchComponent } from './ExercisesListSearchComponent'
import { ExercisesListToolbar } from './ExercisesListToolbar'
import { ExercisesListGrouping } from './ExercisesListGrouping'
import { useListView } from '../../core/ListViewProvider'

type Props = {
  setSearch: (value: string) => void
}

const ExercisesListHeader: React.FC<Props> = ({ setSearch }) => {
  const navigate = useNavigate()
  const { selected } = useListView()

  return (
    <div className='card-header border-0 pt-6'>
      <div className='d-flex flex-column gap-4'>
        <ExercisesListSearchComponent setSearch={setSearch} />
      </div>
      
      <div className='card-toolbar'>
        {selected.length > 0 ? <ExercisesListGrouping /> : <ExercisesListToolbar />}
      </div>
    </div>
  )
}

export { ExercisesListHeader } 