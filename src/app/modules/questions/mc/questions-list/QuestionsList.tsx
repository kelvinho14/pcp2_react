import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { QuestionsListHeader } from './components/header/QuestionsListHeader'
import { QuestionsTable } from './table/QuestionsTable'
import { KTCard } from '../../../../../_metronic/helpers'
import { PageLink, PageTitle } from '../../../../../_metronic/layout/core'

const mcListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Multiple Choice Questions',
    path: '/questions/mc',
    isSeparator: false,
    isActive: true,
  }
]

const MCList = () => {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagLogic, setTagLogic] = useState<'and' | 'or'>('and')

  return (
    <>
      <PageTitle breadcrumbs={mcListBreadcrumbs}>
        Multiple Choice Questions
      </PageTitle>
      <KTCard>
        <QuestionsListHeader 
          setSearch={setSearch} 
          setSelectedTags={setSelectedTags} 
          setTagLogic={setTagLogic}
        />
        <QuestionsTable 
          search={search} 
          selectedTags={selectedTags} 
          tagLogic={tagLogic}
        />
      </KTCard>
    </>
  )
}

const MCListWrapper = () => {
  return (
    <ListViewProvider>
      <MCList />
    </ListViewProvider>
  )
}

export default MCListWrapper 