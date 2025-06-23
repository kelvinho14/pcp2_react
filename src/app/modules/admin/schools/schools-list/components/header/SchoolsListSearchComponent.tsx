import {FC, useEffect, useRef} from 'react'
import {KTIcon} from '../../../../../../../_metronic/helpers'

type Props = {
  setSearch: (value: string) => void
}

const SchoolsListSearchComponent: FC<Props> = ({setSearch}) => {
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus()
    }
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  return (
    <div className='card-title'>
      {/* begin::Search */}
      <div className='d-flex align-items-center position-relative my-1'>
        <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
        <input
          ref={searchRef}
          type='text'
          data-kt-school-table-filter='search'
          className='form-control form-control-solid w-250px ps-14'
          placeholder='Search schools'
          onChange={handleSearch}
        />
      </div>
      {/* end::Search */}
    </div>
  )
}

export {SchoolsListSearchComponent} 