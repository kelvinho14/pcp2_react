import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { UsersListHeader } from './components/header/UsersListHeader'
import { UsersTable } from './table/UsersTable'
import { UserEditModal } from './user-edit-modal/UserEditModal'
import { KTCard } from '../../../../_metronic/helpers'

const UsersList = () => {
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

const UsersListWrapper = () => (
  <ListViewProvider>
    <UsersList />
  </ListViewProvider>
)

export { UsersListWrapper }
