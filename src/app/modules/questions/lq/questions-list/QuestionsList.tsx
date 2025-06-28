import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { QuestionsListHeader } from './components/header/QuestionsListHeader'
import { QuestionsTable } from './table/QuestionsTable'
import { KTCard } from '../../../../../_metronic/helpers'
import { PageLink, PageTitle } from '../../../../../_metronic/layout/core'

const questionsListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  }
]

const QuestionsList = () => {
  const { itemIdForUpdate } = useListView()
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagLogic, setTagLogic] = useState<'and' | 'or'>('and')

  return (
    <>
      <PageTitle breadcrumbs={questionsListBreadcrumbs}>
        Long Questions
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

const QuestionsListWrapper = () => {
  return (
    <ListViewProvider>
      <QuestionsList />
    </ListViewProvider>
  )
}

export default QuestionsListWrapper 