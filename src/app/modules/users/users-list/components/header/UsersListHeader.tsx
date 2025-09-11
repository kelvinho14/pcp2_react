import React from 'react'
import { useListView } from '../../core/ListViewProvider'
import { UsersListSearchComponent } from './UsersListSearchComponent'
import { UsersListToolbar } from './UserListToolbar'
import { UsersListGrouping } from './UsersListGrouping'

type Props = {
  setSearch: (search: string) => void
  setRoleFilter: (role: string) => void
  setSchoolFilter?: (school: string) => void
  setSubjectFilter?: (subject: string) => void
}

const UsersListHeader: React.FC<Props> = ({ setSearch, setRoleFilter, setSchoolFilter, setSubjectFilter }) => {
  const { selected } = useListView()

  return (
    <div className='card-header border-0 pt-6'>
      {/* ✅ This is YOUR custom Search Component */}
      <UsersListSearchComponent setSearch={setSearch} />
      <div className='card-toolbar'>
        {selected.length > 0 && <UsersListGrouping />}
      </div>
    </div>
  )
}

export { UsersListHeader }
