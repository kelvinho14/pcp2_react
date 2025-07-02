import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { UsersListHeader } from './components/header/UsersListHeader'
import { UsersTable } from './table/UsersTable'
import { KTCard } from '../../../../_metronic/helpers'

const UsersList = () => {
  console.log('📋 UsersList component rendered')
  const [search, setSearch] = useState('')

  return (
    <KTCard>
      <UsersListHeader setSearch={setSearch} />
      <UsersTable search={search} />
    </KTCard>
  )
}

const UsersListWrapper = () => {
  console.log('🔄 UsersListWrapper component rendered')
  return (
    <ListViewProvider>
      <UsersList />
    </ListViewProvider>
  )
}

export { UsersListWrapper }
