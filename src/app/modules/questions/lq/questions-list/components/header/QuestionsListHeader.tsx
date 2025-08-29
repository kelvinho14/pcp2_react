import { useListView } from '../../core/ListViewProvider'
import QuestionsListGrouping from './QuestionsListGrouping'
import { QuestionsListSearchComponent } from './QuestionsListSearchComponent'

type Props = {
  setSearch: (value: string) => void
}

const QuestionsListHeader: React.FC<Props> = ({ setSearch }) => {
  const { selected } = useListView()

  return (
    <div className='card-header border-0 pt-6 d-block'>
      <div className='d-flex flex-column gap-2'>
        <div className='d-flex align-items-center justify-content-between gap-3'>
          <QuestionsListSearchComponent setSearch={setSearch} />
        </div>
      </div>
      <div className='card-toolbar'>
        {selected.length > 0 ? <QuestionsListGrouping /> : null}
      </div>
    </div>
  )
}

export { QuestionsListHeader } 