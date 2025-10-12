import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { useTable, useSortBy, ColumnInstance, Row, UseSortByState, TableState, TableOptions, UseSortByColumnProps } from 'react-table'
import { useSelector, useDispatch } from 'react-redux'
import { fetchQuestions, Question } from '../../../../../../store/questions/questionsSlice'
import { RootState, AppDispatch } from '../../../../../../store'
import { questionsColumns } from './columns/_columns'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { QuestionsListLoading } from '../components/loading/QuestionsListLoading'
import { TablePagination } from '../../../../../../_metronic/helpers/TablePagination'
import { KTCardBody } from '../../../../../../_metronic/helpers'

type Props = {
  search: string
  selectedTags: string[]
  tagLogic: 'and' | 'or'
}

const QuestionsTable = ({ search, selectedTags, tagLogic }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  const questions = useSelector((state: RootState) => state.questions.questions)
  const isLoading = useSelector((state: RootState) => state.questions.loading)
  const total = useSelector((state: RootState) => state.questions.total)

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>({ id: 'created_at', desc: true })
  const itemsPerPage = 10

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchQuestionsData = useCallback(() => {
    dispatchRef.current(
      fetchQuestions({
        page,
        items_per_page: itemsPerPage,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        search: search || undefined,
        type: 'lq',
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        tagLogic: selectedTags.length > 0 ? tagLogic : undefined,
      })
    )
  }, [page, sort, search, selectedTags, tagLogic, itemsPerPage])

  useEffect(() => {
    fetchQuestionsData()
  }, [fetchQuestionsData])

  // Reset page to 1 when search, tags, or logic change
  useEffect(() => {
    setPage(1)
  }, [search, selectedTags, tagLogic])

  const data = useMemo(() => (Array.isArray(questions) ? questions : []), [questions])
  const columns = useMemo(() => questionsColumns, [])

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      disableMultiSort: true,
      manualPagination: true,
      initialState: {
        sortBy: sort ? [{ id: sort.id, desc: sort.desc }] : [],
      },
      state: {
        sortBy: sort ? [{ id: sort.id, desc: sort.desc }] : [],
      },
    } as unknown as TableOptions<Question>,
    useSortBy
  )

  const handleSortChange = useCallback((column: ColumnInstance<Question>) => {
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
          id='kt_table_questions'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer table-row-hover'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<Question>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<Question> & UseSortByColumnProps<Question>}
                  onSort={() => handleSortChange(column)}
                  currentSort={sort}
                />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<Question>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.original.q_id}`} />
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
      
      {isLoading && <QuestionsListLoading />}
    </KTCardBody>
  )
}

export { QuestionsTable } 