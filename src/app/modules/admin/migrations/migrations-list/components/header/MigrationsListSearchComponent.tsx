import { KTIcon } from '../../../../../../../_metronic/helpers'

type Props = {
  setSearch: (value: string) => void
}

const MigrationsListSearchComponent = ({ setSearch }: Props) => {
  return (
    <div className='d-flex align-items-center position-relative my-1'>
      <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
      <input
        type='text'
        data-kt-migration-table-filter='search'
        className='form-control form-control-solid w-250px ps-14'
        placeholder='Search migrations'
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}

export { MigrationsListSearchComponent }


