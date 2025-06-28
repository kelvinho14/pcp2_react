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
import {Exercise} from '../../../../../store/exercises/exercisesSlice'

const ListViewContext = createContext<ListViewContextProps>(initialListView)

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected)
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(initialListView.itemIdForUpdate)
  
  // Use Redux data
  const exercises = useSelector((state: RootState) => state.exercises.exercises)
  const isLoading = useSelector((state: RootState) => state.exercises.loading)
  
  const data = useMemo(() => (Array.isArray(exercises) ? exercises : []), [exercises])
  const disabled = useMemo(() => calculatedGroupingIsDisabled(isLoading, data), [isLoading, data])
  const isAllSelected = useMemo(() => calculateIsAllDataSelected(data, selected), [data, selected])

  // Custom onSelectAll function that works with exercise exercise_id
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([])
    } else {
      if (data && data.length > 0) {
        const exerciseIds = data
          .filter((exercise: Exercise) => exercise.exercise_id)
          .map((exercise: Exercise) => exercise.exercise_id as unknown as ID)
        setSelected(exerciseIds)
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