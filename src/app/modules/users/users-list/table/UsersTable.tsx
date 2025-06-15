import { useMemo, useEffect, useState, useCallback } from 'react'
import { useTable, useSortBy, ColumnInstance, Row, UseSortByState, TableState, TableOptions, UseSortByColumnProps } from 'react-table'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers } from '../../../../../store/user/userSlice'
import { RootState, AppDispatch } from '../../../../../store'
import { usersColumns } from './columns/_columns'
import { User } from '../core/_models'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { UsersListLoading } from '../components/loading/UsersListLoading'
import { UsersListPagination } from '../components/pagination/UsersListPagination'
import { KTCardBody } from '../../../../../_metronic/helpers'

type Props = {
  search: string   // <-- accept search from parent
}

const UsersTable = ({ search }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const users = useSelector((state: RootState) => state.users.users)
  const isLoading = useSelector((state: RootState) => state.users.loading)
  const total = useSelector((state: RootState) => state.users.total)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    dispatch(
      fetchUsers({
        page,
        items_per_page: itemsPerPage,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        search: search || undefined,  // ✅ Now it's the prop!
      })
    )
  }, [dispatch, page, sort, search])

  const data = useMemo(() => (Array.isArray(users) ? users : []), [users])
  const columns = useMemo(() => usersColumns, [])

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
    } as TableOptions<User>,
    useSortBy
  )

  const handleSortChange = useCallback((column: ColumnInstance<User>) => {
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

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_users'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<User>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<User> & UseSortByColumnProps<User>}
                  onSort={() => handleSortChange(column)}
                />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<User>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UsersListPagination
        page={page}
        total={total}
        itemsPerPage={itemsPerPage}
        onPageChange={(newPage) => setPage(newPage)}
      />
      
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export { UsersTable }
