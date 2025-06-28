import {FC, useState} from 'react'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {ExercisesListHeader} from './components/header/ExercisesListHeader'
import {ExercisesTable} from './table/ExercisesTable'
import {ListViewProvider} from './core/ListViewProvider'

const exercisesListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
]

const ExerciseListPage: FC = () => {
  const [search, setSearch] = useState('')

  return (
    <>
      <PageTitle breadcrumbs={exercisesListBreadcrumbs}>
        Exercises List
      </PageTitle>
      
      <KTCard>
        <ListViewProvider>
          <ExercisesListHeader setSearch={setSearch} />
          <ExercisesTable search={search} />
        </ListViewProvider>
      </KTCard>
    </>
  )
}

export default ExerciseListPage 