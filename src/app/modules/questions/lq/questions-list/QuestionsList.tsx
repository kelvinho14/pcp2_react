import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { QuestionsListHeader } from './components/header/QuestionsListHeader'
import { QuestionsTable } from './table/QuestionsTable'
import { KTCard } from '../../../../../_metronic/helpers'

const QuestionsList = () => {
  console.log('📋 QuestionsList component rendered')
  const { itemIdForUpdate } = useListView()
  const [search, setSearch] = useState('')

  return (
    <>
      <KTCard>
        <QuestionsListHeader setSearch={setSearch} />
        <QuestionsTable search={search} />
      </KTCard>
    </>
  )
}

const QuestionsListWrapper = () => {
  console.log('🔄 QuestionsListWrapper component rendered')
  return (
    <ListViewProvider>
      <QuestionsList />
    </ListViewProvider>
  )
}

export { QuestionsListWrapper } 