import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { SchoolsListHeader } from './components/header/SchoolsListHeader'
import { SchoolsTable } from './table/SchoolsTable'
import { KTCard } from '../../../../../_metronic/helpers'

const SchoolsList = () => {
  console.log('📋 SchoolsList component rendered')
  const { itemIdForUpdate } = useListView()
  const [search, setSearch] = useState('')

  return (
    <>
      <KTCard>
        <SchoolsListHeader setSearch={setSearch} />
        <SchoolsTable search={search} />
      </KTCard>
    </>
  )
}

const SchoolsListWrapper = () => {
  console.log('🔄 SchoolsListWrapper component rendered')
  return (
    <ListViewProvider>
      <SchoolsList />
    </ListViewProvider>
  )
}

export { SchoolsListWrapper } 