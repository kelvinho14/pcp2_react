import {FC, useMemo, useCallback} from 'react'
import {useTable, Column, useSortBy, TableOptions, ColumnInstance, UseSortByColumnProps} from 'react-table'
import {KTCardBody, TablePagination} from '../../../../../_metronic/helpers'
import {PracticeQuestionItem} from '../../../../../store/dojo/practiceQuestionsSlice'
import {createPracticeQuestionsColumns} from './columns/_columns'
import {CustomHeaderColumn} from './columns/CustomHeaderColumn'

type Props = {
  questions: PracticeQuestionItem[]
  isLoading: boolean
  onSortChange: (column: ColumnInstance<PracticeQuestionItem>) => void
  currentSort?: { id: string; desc: boolean } | null
  page: number
  total: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onQuestionClick?: (questionId: string) => void
  showAnswer?: boolean
}

const PracticeQuestionsTable: FC<Props> = ({questions, isLoading, onSortChange, currentSort, page, total, itemsPerPage, onPageChange, onQuestionClick, showAnswer = false}) => {
  const data = useMemo(() => questions, [questions])
  const columns = useMemo(() => createPracticeQuestionsColumns(showAnswer) as Column<PracticeQuestionItem>[], [showAnswer])

  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable(
    {
      columns,
      data,
      manualSortBy: true,
      disableMultiSort: true,
      manualPagination: true,
      initialState: {
        sortBy: [],
      },
    } as TableOptions<PracticeQuestionItem>,
    useSortBy
  )

  const handleSortChange = useCallback((column: ColumnInstance<PracticeQuestionItem>) => {
    onSortChange(column)
  }, [onSortChange])

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_practice_questions'
          className='table align-middle table-row-dashed table-row-gray-300 fs-6 gy-5 dataTable no-footer'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<PracticeQuestionItem>) => (
                <CustomHeaderColumn
                  key={column.id}
                  column={column as ColumnInstance<PracticeQuestionItem> & UseSortByColumnProps<PracticeQuestionItem>}
                  onSort={() => handleSortChange(column)}
                  currentSort={currentSort}
                />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row) => {
                prepareRow(row)
                const {key: rowKey, ...rowProps} = row.getRowProps()
                return (
                  <tr key={rowKey || row.id} {...rowProps}>
                    {row.cells.map((cell) => {
                      const {key: cellKey, ...cellProps} = cell.getCellProps()
                      return (
                        <td key={cellKey || `${row.id}-${cell.column.id}`} {...cellProps}>
                          {cell.render('Cell')}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={headers.length}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    {isLoading ? (
                      <span className='indicator-progress' style={{display: 'block'}}>
                        Please wait...
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    ) : (
                      <div className='text-center py-10'>
                        <i className='fas fa-brain fs-2x text-muted mb-5'></i>
                        <p className='fs-5 text-muted'>
                          No practice questions yet. Generate some from your weak spots!
                        </p>
                      </div>
                    )}
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
        onPageChange={onPageChange}
        showPageNumbers={true}
        showInfo={true}
        className='mt-5'
      />
    </KTCardBody>
  )
}

export {PracticeQuestionsTable}

