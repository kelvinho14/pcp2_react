import {useState} from 'react'
import {useListView} from '../../core/ListViewProvider'
import {GroupsListToolbar} from './GroupsListToolbar'
import {GroupsListSearchComponent} from './GroupsListSearchComponent'
import {GroupsListGrouping} from './GroupsListGrouping'

const GroupsListHeader = ({setSearch}: {setSearch: (search: string) => void}) => {
  const [search, setSearchState] = useState('')
  const { selected } = useListView()

  const handleSearchChange = (value: string) => {
    setSearchState(value)
    setSearch(value)
  }

  return (
    <div className='card-header border-0 pt-6'>
      <GroupsListSearchComponent value={search} onChange={handleSearchChange} />
      <div className='card-toolbar'>
        {selected.length > 0 ? <GroupsListGrouping /> : <GroupsListToolbar />}
      </div>
    </div>
  )
}

export {GroupsListHeader} 