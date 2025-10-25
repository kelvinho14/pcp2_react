import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { useTable, useSortBy, ColumnInstance, Row, UseSortByState, TableState, TableOptions, UseSortByColumnProps } from 'react-table'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers } from '../../../../../store/user/userSlice'
import { RootState, AppDispatch } from '../../../../../store'
import { useUsersColumns } from './columns/_columns'
import { User } from '../core/_models'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { UsersListLoading } from '../components/loading/UsersListLoading'
import { TablePagination } from '../../../../../_metronic/helpers/TablePagination'
import { KTCardBody } from '../../../../../_metronic/helpers'

type Props = {
  search: string   // <-- accept search from parent
  roleFilter?: string
  schoolFilter?: string
  subjectFilter?: string
}

const UsersTable = ({ search, roleFilter, schoolFilter, subjectFilter }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  const users = useSelector((state: RootState) => state.users.users)
  const isLoading = useSelector((state: RootState) => state.users.loading)
  const total = useSelector((state: RootState) => state.users.total)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null)
  const itemsPerPage = 10

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchUsersData = useCallback(() => {
    dispatchRef.current(
      fetchUsers({
        page,
        items_per_page: itemsPerPage,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        search: search || undefined,
        role_type: roleFilter || undefined,
        school: schoolFilter || undefined,
        subject: subjectFilter || undefined,
      })
    )
  }, [page, sort, search, itemsPerPage, roleFilter, schoolFilter, subjectFilter])

  useEffect(() => {
    fetchUsersData()
  }, [fetchUsersData])

  const data = useMemo(() => (Array.isArray(users) ? users : []), [users])
  const columns = useUsersColumns()

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

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_users'
          className='table align-middle table-row-dashed table-row-gray-300 fs-6 gy-5 dataTable no-footer table-row-hover'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<User>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<User> & UseSortByColumnProps<User>}
                  onSort={() => handleSortChange(column)}
                  currentSort={sort}
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

      <TablePagination
        page={page}
        total={total}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        showPageNumbers={true}
        showInfo={true}
        className='mt-5'
      />
      
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export { UsersTable }
