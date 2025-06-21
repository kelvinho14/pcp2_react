import {KTIcon} from '../../../../../../../_metronic/helpers'

type Props = {
  setSearch: (value: string) => void
}

const SubjectsListSearchComponent = ({setSearch}: Props) => {
  return (
    <div className='d-flex align-items-center position-relative my-1'>
      <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
      <input
        type='text'
        data-kt-subject-table-filter='search'
        className='form-control form-control-solid w-250px ps-14'
        placeholder='Search subjects'
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}

export {SubjectsListSearchComponent} 