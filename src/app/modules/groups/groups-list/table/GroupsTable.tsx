import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { useTable, useSortBy, ColumnInstance, Row, UseSortByState, TableState, TableOptions, UseSortByColumnProps } from 'react-table'
import { useSelector, useDispatch } from 'react-redux'
import { fetchGroups } from '../../../../../store/groups/groupsSlice'
import { RootState, AppDispatch } from '../../../../../store'
import { useGroupsColumns } from './columns/_columns'
import { Group } from '../core/_models'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { GroupsListLoading } from '../components/loading/GroupsListLoading'
import { TablePagination } from '../../../../../_metronic/helpers/TablePagination'
import { KTCardBody } from '../../../../../_metronic/helpers'

type Props = {
  search: string
}

const GroupsTable = ({ search }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  const groups = useSelector((state: RootState) => state.groups.groups)
  const isLoading = useSelector((state: RootState) => state.groups.loading)
  const total = useSelector((state: RootState) => state.groups.total)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null)
  const itemsPerPage = 10

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchGroupsData = useCallback(() => {
    console.log('🔍 GroupsTable - Fetching groups...')
    dispatchRef.current(
      fetchGroups({
        page,
        items_per_page: itemsPerPage,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        search: search || undefined,
      })
    )
  }, [page, sort, search, itemsPerPage])

  useEffect(() => {
    fetchGroupsData()
  }, [fetchGroupsData])

  const data = useMemo(() => (Array.isArray(groups) ? groups : []), [groups])
  const columns = useGroupsColumns()

  // Debug logging
  console.log('🔍 GroupsTable - groups from Redux:', groups)
  console.log('🔍 GroupsTable - isLoading:', isLoading)

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      disableMultiSort: true,
      manualPagination: true,
      initialState: {
        sortBy: [],
      },
    } as TableOptions<Group>,
    useSortBy
  )

  const handleSortChange = useCallback((column: ColumnInstance<Group>) => {
    setSort((currentSort) => {
      if (!currentSort || currentSort.id !== column.id) {
        return { id: column.id, desc: false }
      } else if (currentSort && !currentSort.desc) {
        return { id: column.id, desc: true }
      } else {
        return null
      }
    })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_groups'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer table-row-hover'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<Group>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<Group> & UseSortByColumnProps<Group>}
                  onSort={() => handleSortChange(column)}
                  currentSort={sort}
                />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<Group>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        total={total}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        showPageNumbers={true}
        showInfo={true}
        className='mt-5'
      />
      
      {isLoading && <GroupsListLoading />}
    </KTCardBody>
  )
}

export { GroupsTable } 