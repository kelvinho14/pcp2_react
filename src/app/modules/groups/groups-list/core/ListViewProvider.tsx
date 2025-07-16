/* eslint-disable react-refresh/only-export-components */
import {FC, useState, createContext, useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  initialListView,
  ListViewContextProps,
  WithChildren,
} from '../../../../../_metronic/helpers'
import {RootState} from '../../../../../store'
import {Group} from './_models'

const ListViewContext = createContext<ListViewContextProps>(initialListView)

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<string>>([])
  
  // Use Redux data instead of QueryResponseProvider
  const groups = useSelector((state: RootState) => state.groups.groups)
  const isLoading = useSelector((state: RootState) => state.groups.loading)
  
  const data = useMemo(() => (Array.isArray(groups) ? groups : []), [groups])
  const disabled = useMemo(() => calculatedGroupingIsDisabled(isLoading, data), [isLoading, data])
  const isAllSelected = useMemo(() => data.length > 0 && data.length === selected.length, [data, selected])

  // Debug logging to see what's causing the disabled state
  console.log('🔍 ListViewProvider - isLoading:', isLoading)
  console.log('🔍 ListViewProvider - data length:', data.length)
  console.log('🔍 ListViewProvider - disabled:', disabled)
  console.log('🔍 ListViewProvider - selected:', selected)

  // Custom onSelectAll function that works with group_id
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([])
    } else {
      if (data && data.length > 0) {
        const groupIds = data.filter((group: Group) => group.group_id).map((group: Group) => group.group_id)
        setSelected(groupIds)
      }
    }
  }

  // Custom onSelect function for string IDs
  const handleSelect = (id: string) => {
    if (!id) return
    
    if (selected.includes(id)) {
      setSelected(selected.filter((itemId) => itemId !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  return (
    <ListViewContext.Provider
      value={{
        selected: selected as any, // Cast to any to satisfy the interface
        itemIdForUpdate: undefined,
        setItemIdForUpdate: () => {},
        disabled,
        isAllSelected,
        onSelect: (id: any) => handleSelect(id as string),
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

const useListView = () => {
  const context = useContext(ListViewContext)
  if (!context) {
    throw new Error('useListView must be used within a ListViewProvider')
  }
  return context
}

export {ListViewProvider, useListView} 