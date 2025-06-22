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
} from '../../../../../../_metronic/helpers'
import {RootState} from '../../../../../../store'
import {School} from '../../../../../../store/schools/schoolsSlice'

const ListViewContext = createContext<ListViewContextProps>(initialListView)

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected)
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(initialListView.itemIdForUpdate)
  
  // Use Redux data
  const schools = useSelector((state: RootState) => state.schools.schools)
  const isLoading = useSelector((state: RootState) => state.schools.loading)
  
  const data = useMemo(() => (Array.isArray(schools) ? schools : []), [schools])
  const disabled = useMemo(() => calculatedGroupingIsDisabled(isLoading, data), [isLoading, data])
  const isAllSelected = useMemo(() => calculateIsAllDataSelected(data, selected), [data, selected])

  // Custom onSelectAll function that works with school school_id
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([])
    } else {
      if (data && data.length > 0) {
        const schoolIds = data
          .filter((school: School) => school.school_id)
          .map((school: School) => school.school_id as unknown as ID)
        setSelected(schoolIds)
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