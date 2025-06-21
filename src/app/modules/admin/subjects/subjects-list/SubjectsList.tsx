import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { SubjectsListHeader } from './components/header/SubjectsListHeader'
import { SubjectsTable } from './table/SubjectsTable'
import { KTCard } from '../../../../../_metronic/helpers'

const SubjectsList = () => {
  console.log('📋 SubjectsList component rendered')
  const { itemIdForUpdate } = useListView()
  const [search, setSearch] = useState('')

  return (
    <>
      <KTCard>
        <SubjectsListHeader setSearch={setSearch} />
        <SubjectsTable search={search} />
      </KTCard>
    </>
  )
}

const SubjectsListWrapper = () => {
  console.log('🔄 SubjectsListWrapper component rendered')
  return (
    <ListViewProvider>
      <SubjectsList />
    </ListViewProvider>
  )
}

export { SubjectsListWrapper } 