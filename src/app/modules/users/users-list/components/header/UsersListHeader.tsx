import { useListView } from '../../core/ListViewProvider'
import { UsersListToolbar } from './UserListToolbar'
import { UsersListGrouping } from './UsersListGrouping'
import { UsersListSearchComponent } from './UsersListSearchComponent' // ✅ Keep this!

type Props = {
  setSearch: (value: string) => void
}

const UsersListHeader: React.FC<Props> = ({ setSearch }) => {
  const { selected } = useListView()

  return (
    <div className='card-header border-0 pt-6'>
      {/* ✅ This is YOUR custom Search Component */}
      <UsersListSearchComponent setSearch={setSearch} />
      <div className='card-toolbar'>
        {selected.length > 0 ? <UsersListGrouping /> : <UsersListToolbar />}
      </div>
    </div>
  )
}

export { UsersListHeader }
