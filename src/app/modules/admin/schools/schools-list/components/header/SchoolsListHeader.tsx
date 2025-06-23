import { useListView } from '../../core/ListViewProvider'
import { SchoolsListToolbar } from './SchoolsListToolbar'
import { SchoolsListGrouping } from './SchoolsListGrouping'
import { SchoolsListSearchComponent } from './SchoolsListSearchComponent'

type Props = {
  setSearch: (value: string) => void
}

const SchoolsListHeader: React.FC<Props> = ({ setSearch }) => {
  const { selected } = useListView()

  return (
    <div className='card-header border-0 pt-6'>
      <SchoolsListSearchComponent setSearch={setSearch} />
      <div className='card-toolbar'>
        {selected.length > 0 ? <SchoolsListGrouping /> : <SchoolsListToolbar />}
      </div>
    </div>
  )
}

export { SchoolsListHeader } 