/* eslint-disable react-refresh/only-export-components */
import { FC, createContext, useContext } from 'react'
import { useSelector } from 'react-redux'
import { WithChildren } from '../../../../../../_metronic/helpers'
import { RootState } from '../../../../../../store'

interface ListViewContextProps {
  data: any[]
  isLoading: boolean
}

const ListViewContext = createContext<ListViewContextProps>({
  data: [],
  isLoading: false,
})

const ListViewProvider: FC<WithChildren> = ({ children }) => {
  // Use Redux data
  const migrations = useSelector((state: RootState) => state.migrations.migrations)
  const isLoading = useSelector((state: RootState) => state.migrations.loading)
  
  const data = Array.isArray(migrations) ? migrations : []

  return (
    <ListViewContext.Provider
      value={{
        data,
        isLoading,
      }}
    >
      {children}
    </ListViewContext.Provider>
  )
}

const useListView = () => useContext(ListViewContext)

export { ListViewProvider, useListView }

