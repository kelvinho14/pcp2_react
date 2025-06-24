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
import {Question} from '../../../../../../store/questions/questionsSlice'

const ListViewContext = createContext<ListViewContextProps>(initialListView)

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected)
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(initialListView.itemIdForUpdate)
  
  // Use Redux data
  const questions = useSelector((state: RootState) => state.questions.questions)
  const isLoading = useSelector((state: RootState) => state.questions.loading)
  
  const data = useMemo(() => (Array.isArray(questions) ? questions : []), [questions])
  const disabled = useMemo(() => calculatedGroupingIsDisabled(isLoading, data), [isLoading, data])
  const isAllSelected = useMemo(() => calculateIsAllDataSelected(data, selected), [data, selected])

  // Custom onSelectAll function that works with question q_id
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([])
    } else {
      if (data && data.length > 0) {
        const questionIds = data
          .filter((question: Question) => question.q_id)
          .map((question: Question) => question.q_id as unknown as ID)
        setSelected(questionIds)
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