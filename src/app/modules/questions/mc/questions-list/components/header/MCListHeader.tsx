import { useListView } from '../../core/ListViewProvider'
import { QuestionsListToolbar } from './QuestionsListToolbar'
import QuestionsListGrouping from './QuestionsListGrouping'
import { QuestionsListSearchComponent } from './QuestionsListSearchComponent'

type Props = {
  setSearch: (value: string) => void
}

const MCListHeader: React.FC<Props> = ({ setSearch }) => {
  const { selected } = useListView()

  return (
    <div className='card-header border-0 pt-6'>
      <QuestionsListSearchComponent setSearch={setSearch} />
      <div className='card-toolbar'>
        {selected.length > 0 ? <QuestionsListGrouping /> : <QuestionsListToolbar />}
      </div>
    </div>
  )
}

export default MCListHeader 