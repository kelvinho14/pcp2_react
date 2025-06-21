/* eslint-disable react-refresh/only-export-components */
import {FC, useState, createContext, useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {
  ID,
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  initialListView,
  ListViewContextProps,
  WithChildren,
} from '../../../../../_metronic/helpers'
import {RootState} from '../../../../../store'
import {User} from './_models'

const ListViewContext = createContext<ListViewContextProps>(initialListView)

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected)
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(initialListView.itemIdForUpdate)
  
  // Use Redux data instead of QueryResponseProvider
  const users = useSelector((state: RootState) => state.users.users)
  const isLoading = useSelector((state: RootState) => state.users.loading)
  
  const data = useMemo(() => (Array.isArray(users) ? users : []), [users])
  const disabled = useMemo(() => calculatedGroupingIsDisabled(isLoading, data), [isLoading, data])
  const isAllSelected = useMemo(() => calculateIsAllDataSelected(data, selected), [data, selected])

  // Custom onSelectAll function that works with user_id
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([])
    } else {
      if (data && data.length > 0) {
        const userIds = data.filter((user: User) => user.user_id).map((user: User) => user.user_id)
        setSelected(userIds)
      }
    }
  }

  return (
    <ListViewContext.Provider
      value={{
        selected,
        itemIdForUpdate,
        setItemIdForUpdate,
        disabled,
        isAllSelected,
        onSelect: (id: ID) => {
          groupingOnSelect(id, selected, setSelected)
        },
        onSelectAll: handleSelectAll,
        clearSelected: () => {
          setSelected([])
        },
      }}
    >
      {children}
    </ListViewContext.Provider>
  )
}

const useListView = () => useContext(ListViewContext)

export {ListViewProvider, useListView}
