import { KTSVG } from '../../../../../../_metronic/helpers'

type Props = {
  setSearch: (value: string) => void
}

const ExercisesListSearchComponent: React.FC<Props> = ({ setSearch }) => {
  return (
    <div className='d-flex align-items-center position-relative my-1'>
      <KTSVG
        path='/media/icons/duotune/general/gen021.svg'
        className='svg-icon-1 position-absolute ms-6'
      />
      <input
        type='text'
        data-kt-exercise-table-filter='search'
        className='form-control form-control-solid w-250px ps-14'
        placeholder='Search exercises...'
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}

export { ExercisesListSearchComponent } 