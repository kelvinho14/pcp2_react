import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { useTable, useSortBy, ColumnInstance, Row, UseSortByState, TableState, TableOptions, UseSortByColumnProps } from 'react-table'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSchools, School } from '../../../../../../store/admin/adminSlice'
import { RootState, AppDispatch } from '../../../../../../store'
import { schoolsColumns } from './columns/_columns'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { SchoolsListLoading } from '../components/loading/SchoolsListLoading'
import { TablePagination } from '../../../../../../_metronic/helpers/TablePagination'
import { KTCardBody } from '../../../../../../_metronic/helpers'

type Props = {
  search: string
}

const SchoolsTable = ({ search }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  const schools = useSelector((state: RootState) => state.admin.schools)
  const isLoading = useSelector((state: RootState) => state.admin.loading)
  const total = useSelector((state: RootState) => state.admin.schoolsTotal)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>({ id: 'name', desc: false })
  const itemsPerPage = 10

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchSchoolsData = useCallback(() => {
    console.log('🔄 Fetching schools data with params:', {
      page,
      items_per_page: itemsPerPage,
      sort: sort?.id,
      order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      search: search || undefined,
    })
    
    dispatchRef.current(
      fetchSchools({
        page,
        items_per_page: itemsPerPage,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        search: search || undefined,
      })
    )
  }, [page, sort, search, itemsPerPage])

  useEffect(() => {
    fetchSchoolsData()
  }, [fetchSchoolsData])

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  const data = useMemo(() => (Array.isArray(schools) ? schools : []), [schools])
  const columns = useMemo(() => schoolsColumns, [])

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
    } as unknown as TableOptions<School>,
    useSortBy
  )

  const handleSortChange = useCallback((column: ColumnInstance<School>) => {
    setSort((currentSort) => {
      if (!currentSort || currentSort.id !== column.id) {
        return { id: column.id, desc: false }
      } else if (currentSort && !currentSort.desc) {
        return { id: column.id, desc: true }
      } else {
        return { id: column.id, desc: false }
      }
    })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Debug logging
  console.log('📊 Schools pagination debug:', {
    totalSchools: schools.length,
    currentPage: page,
    itemsPerPage,
    total,
    totalPages: Math.ceil(total / itemsPerPage)
  })

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_schools'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<School>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<School> & UseSortByColumnProps<School>}
                  onSort={() => handleSortChange(column)}
                  currentSort={sort}
                />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<School>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.original.school_id}`} />
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
      
      {isLoading && <SchoolsListLoading />}
    </KTCardBody>
  )
}

export { SchoolsTable } 