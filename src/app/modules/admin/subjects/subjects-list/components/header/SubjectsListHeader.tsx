import { useListView } from '../../core/ListViewProvider'
import { SubjectsListToolbar } from './SubjectsListToolbar'
import { SubjectsListGrouping } from './SubjectsListGrouping'
import { SubjectsListSearchComponent } from './SubjectsListSearchComponent'

type Props = {
  setSearch: (value: string) => void
}

const SubjectsListHeader: React.FC<Props> = ({ setSearch }) => {
  const { selected } = useListView()

  return (
    <div className='card-header border-0 pt-6'>
      <SubjectsListSearchComponent setSearch={setSearch} />
      <div className='card-toolbar'>
        {selected.length > 0 ? <SubjectsListGrouping /> : <SubjectsListToolbar />}
      </div>
    </div>
  )
}

export { SubjectsListHeader } 