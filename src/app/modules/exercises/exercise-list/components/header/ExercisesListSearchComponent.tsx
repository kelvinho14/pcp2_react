
type Props = {
  setSearch: (value: string) => void
}

const ExercisesListSearchComponent: React.FC<Props> = ({ setSearch }) => {
  return (
    <div className='d-flex align-items-center position-relative my-1'>
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