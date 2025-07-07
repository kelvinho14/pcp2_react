import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState } from 'react'
import { UsersListHeader } from './components/header/UsersListHeader'
import { UsersTable } from './table/UsersTable'
import { KTCard } from '../../../../_metronic/helpers'

const UsersList = () => {
  console.log('📋 UsersList component rendered')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [schoolFilter, setSchoolFilter] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')

  return (
    <KTCard>
      <UsersListHeader 
        setSearch={setSearch} 
        setRoleFilter={setRoleFilter}
        setSchoolFilter={setSchoolFilter}
        setSubjectFilter={setSubjectFilter}
      />
      <UsersTable 
        search={search} 
        roleFilter={roleFilter}
        schoolFilter={schoolFilter}
        subjectFilter={subjectFilter}
      />
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
