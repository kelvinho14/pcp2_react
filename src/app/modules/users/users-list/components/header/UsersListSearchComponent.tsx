import { useEffect, useState } from 'react'
import { KTIcon, useDebounce } from '../../../../../../_metronic/helpers'

const UsersListSearchComponent = ({ setSearch }: { setSearch: (value: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)  // 300ms smoother typing

  // 🔥 When user stops typing for 300ms, trigger search
  useEffect(() => {
    setSearch(debouncedSearchTerm || '')
  }, [debouncedSearchTerm, setSearch])

  return (
    <div className='card-title'>
      {/* begin::Search */}
      <div className='d-flex align-items-center position-relative my-1'>
        {/* Magnifier icon */}
        <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />

        <input
          type='text'
          data-kt-user-table-filter='search'
          className='form-control form-control-solid w-250px ps-14'
          placeholder='Search user'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* end::Search */}
    </div>
  )
}

export { UsersListSearchComponent }
