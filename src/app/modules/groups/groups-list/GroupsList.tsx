import { ListViewProvider } from './core/ListViewProvider'
import { useState } from 'react'
import { GroupsListHeader } from './components/header/GroupsListHeader'
import { GroupsTable } from './table/GroupsTable'
import { KTCard } from '../../../../_metronic/helpers'

const GroupsList = () => {
  const [search, setSearch] = useState('')

  return (
    <ListViewProvider>
      <KTCard>
        <GroupsListHeader setSearch={setSearch} />
        <GroupsTable search={search} />
      </KTCard>
    </ListViewProvider>
  )
}

export { GroupsList } 