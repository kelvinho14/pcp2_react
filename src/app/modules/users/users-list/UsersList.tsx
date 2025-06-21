import { ListViewProvider, useListView } from './core/ListViewProvider'
import { QueryRequestProvider } from './core/QueryRequestProvider'
import { useState } from 'react'
import { UsersListHeader } from './components/header/UsersListHeader'
import { UsersTable } from './table/UsersTable'
import { UserEditModal } from './user-edit-modal/UserEditModal'
import { KTCard } from '../../../../_metronic/helpers'

const UsersList = () => {
  console.log('📋 UsersList component rendered')
  const { itemIdForUpdate } = useListView()
  const [search, setSearch] = useState('')

  return (
    <>
      <KTCard>
        <UsersListHeader setSearch={setSearch} />
        <UsersTable search={search} />
      </KTCard>
      {itemIdForUpdate !== undefined && <UserEditModal />}
    </>
  )
}

const UsersListWrapper = () => {
  console.log('🔄 UsersListWrapper component rendered')
  return (
    <QueryRequestProvider>
      <ListViewProvider>
        <UsersList />
      </ListViewProvider>
    </QueryRequestProvider>
  )
}

export { UsersListWrapper }
