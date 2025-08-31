import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { useTable, useSortBy, ColumnInstance, Row, UseSortByState, TableState, TableOptions, UseSortByColumnProps } from 'react-table'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMigrations, Migration } from '../../../../../../store/admin/migrationsSlice'
import { RootState, AppDispatch } from '../../../../../../store'
import { migrationsColumns } from './columns/_columns'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { MigrationsListLoading } from '../components/loading/MigrationsListLoading'
import { TablePagination } from '../../../../../../_metronic/helpers/TablePagination'
import { KTCardBody } from '../../../../../../_metronic/helpers'

type Props = {
  search: string
}

const MigrationsTable = ({ search }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  const migrations = useSelector((state: RootState) => state.migrations.migrations)
  const isLoading = useSelector((state: RootState) => state.migrations.loading)
  const total = useSelector((state: RootState) => state.migrations.migrationsTotal)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>({ id: 'started_at', desc: true })
  const itemsPerPage = 10

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchMigrationsData = useCallback(() => {
    console.log('🔄 Fetching migrations data with params:', {
      page,
      items_per_page: itemsPerPage,
      sort: sort?.id,
      order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      search: search || undefined,
    })
    
    dispatchRef.current(
      fetchMigrations({
        page,
        items_per_page: itemsPerPage,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        search: search || undefined,
      })
    )
  }, [page, sort, search, itemsPerPage])

  useEffect(() => {
    fetchMigrationsData()
  }, [fetchMigrationsData])

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  const data = useMemo(() => (Array.isArray(migrations) ? migrations : []), [migrations])
  const columns = useMemo(() => migrationsColumns, [])

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
    } as unknown as TableOptions<Migration>,
    useSortBy
  )

  const handleSortChange = useCallback(
    (column: ColumnInstance<Migration>) => {
      setSort((currentSort) => {
        if (!currentSort || currentSort.id !== column.id) {
          return { id: column.id, desc: false }
        } else if (currentSort && !currentSort.desc) {
          return { id: column.id, desc: true }
        } else {
          return { id: column.id, desc: false }
        }
      })
    },
    []
  )

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Debug logging
  console.log('📊 Migrations pagination debug:', {
    totalMigrations: migrations.length,
    currentPage: page,
    itemsPerPage,
    total,
    totalPages: Math.ceil(total / itemsPerPage)
  })

  if (isLoading) {
    return <MigrationsListLoading />
  }

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_migrations'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<Migration>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<Migration> & UseSortByColumnProps<Migration>}
                  onSort={() => handleSortChange(column)}
                  currentSort={sort}
                />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<Migration>, i) => {
                prepareRow(row)
                return <CustomRow key={`row-${i}-${row.original.log_id}`} row={row} />
              })
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No migrations found
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
      />
    </KTCardBody>
  )
}

export { MigrationsTable }
