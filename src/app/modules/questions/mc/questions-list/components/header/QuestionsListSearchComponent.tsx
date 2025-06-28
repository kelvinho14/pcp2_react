import { KTSVG } from '../../../../../../../_metronic/helpers'

type Props = {
  setSearch: (value: string) => void
}

const QuestionsListSearchComponent: React.FC<Props> = ({ setSearch }) => {
  return (
    <div className='d-flex align-items-center position-relative my-1'>
      <input
        type='text'
        data-kt-question-table-filter='search'
        className='form-control form-control-solid w-250px ps-14'
        placeholder='Search questions...'
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}

export { QuestionsListSearchComponent } 