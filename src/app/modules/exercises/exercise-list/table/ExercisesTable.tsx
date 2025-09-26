import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { useTable, useSortBy, ColumnInstance, Row, UseSortByState, TableState, TableOptions, UseSortByColumnProps } from 'react-table'
import { useSelector, useDispatch } from 'react-redux'
import { fetchExercises, Exercise } from '../../../../../store/exercises/exercisesSlice'
import { RootState, AppDispatch } from '../../../../../store'
import { exercisesColumns } from './columns/_columns'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { TablePagination } from '../../../../../_metronic/helpers/TablePagination'
import { KTCardBody } from '../../../../../_metronic/helpers'

type Props = {
  search: string
  selectedTypes: string[]
  statusFilter: number | ''
  selectedTags: string[]
  tagLogic: 'and' | 'or'
}

const ExercisesTable = ({ search, selectedTypes, statusFilter, selectedTags, tagLogic }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  const exercises = useSelector((state: RootState) => state.exercises.exercises)
  const isLoading = useSelector((state: RootState) => state.exercises.loading)
  const total = useSelector((state: RootState) => state.exercises.total)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>({ id: 'created_at', desc: true })
  const itemsPerPage = 10

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchExercisesData = useCallback(() => {
    dispatchRef.current(
      fetchExercises({
        page,
        items_per_page: itemsPerPage,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        search: search || undefined,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        status: statusFilter !== '' ? statusFilter : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        tag_logic: selectedTags.length > 0 ? tagLogic : undefined,
      })
    )
  }, [page, sort, search, selectedTypes, statusFilter, selectedTags, tagLogic, itemsPerPage])

  useEffect(() => {
    fetchExercisesData()
  }, [fetchExercisesData])

  // Reset page to 1 when search, types, status, or tags change
  useEffect(() => {
    setPage(1)
  }, [search, selectedTypes, statusFilter, selectedTags, tagLogic])

  const data = useMemo(() => (Array.isArray(exercises) ? exercises : []), [exercises])
  const columns = useMemo(() => exercisesColumns, [])

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
    } as unknown as TableOptions<Exercise>,
    useSortBy
  )

  const handleSortChange = useCallback((column: ColumnInstance<Exercise>) => {
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

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_exercises'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer table-row-hover'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<Exercise>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<Exercise> & UseSortByColumnProps<Exercise>}
                  onSort={() => handleSortChange(column)}
                />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<Exercise>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.original.exercise_id}`} />
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
      
      {isLoading && (
        <div className='overlay-layer bg-transparent'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      )}
    </KTCardBody>
  )
}

export { ExercisesTable } 