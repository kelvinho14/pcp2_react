import { useEffect, useState } from 'react'
import { KTIcon, useDebounce } from '../../../../../_metronic/helpers'

type Props = {
  setSearch: (value: string) => void
}

const PracticeQuestionsSearchComponent: React.FC<Props> = ({ setSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)  // 300ms delay for smooth typing

  // When user stops typing for 300ms, trigger search
  useEffect(() => {
    setSearch(debouncedSearchTerm || '')
  }, [debouncedSearchTerm, setSearch])

  return (
    <div className='d-flex align-items-center position-relative my-1'>
      <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
      <input
        type='text'
        data-kt-question-table-filter='search'
        className='form-control form-control-solid w-250px ps-14'
        placeholder='Search practice questions...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}

export { PracticeQuestionsSearchComponent }
