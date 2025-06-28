import {FC, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../../store'
import {fetchQuestions} from '../../../../store/questions/questionsSlice'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {KTSVG} from '../../../../_metronic/helpers'
import {TablePagination} from '../../../../_metronic/helpers/TablePagination'
import {QuestionsActionsCell} from './components/QuestionsActionsCell'
import {QuestionSelectionCell} from './components/QuestionSelectionCell'

const mcListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Questions',
    path: '/questions',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'MC',
    path: '/questions/mc',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'List',
    path: '/questions/mc/list',
    isSeparator: false,
    isActive: true,
  },
]

const MCListPage: FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  // Redux selectors
  const { questions, loading, total } = useSelector((state: RootState) => state.questions)
  
  // Local state for pagination and search
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  // Fetch questions on component mount and when pagination/search changes
  useEffect(() => {
    dispatch(fetchQuestions({
      page: currentPage,
      items_per_page: itemsPerPage,
      sort: sortBy,
      order: sortOrder,
      search: searchTerm || undefined,
      type: 'mc'
    }))
  }, [dispatch, currentPage, itemsPerPage, sortBy, sortOrder, searchTerm])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleSearch = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handleQuestionSelection = (qId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, qId])
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== qId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(questions.map(q => q.q_id))
    } else {
      setSelectedQuestions([])
    }
  }

  const handleQuestionNameClick = (qId: string) => {
    navigate(`/questions/mc/edit/${qId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const isAllSelected = questions.length > 0 && selectedQuestions.length === questions.length
  const isIndeterminate = selectedQuestions.length > 0 && selectedQuestions.length < questions.length

  return (
    <>
      <PageTitle breadcrumbs={mcListBreadcrumbs}>Multiple Choice Questions List</PageTitle>
      
      <KTCard>
        <div className='card-header border-0 pt-5'>
          <h3 className='card-title align-items-start flex-column'>
            <span className='card-label fw-bold fs-3 mb-1'>Multiple Choice Questions</span>
            <span className='text-muted mt-1 fw-semibold fs-7'>
              Manage your multiple choice questions
            </span>
          </h3>
          <div className='card-toolbar'>
            <button
              type='button'
              className='btn btn-sm btn-light-primary me-3'
              onClick={() => navigate('/questions/mc/create')}
            >
              <KTSVG path='/media/icons/duotune/arrows/arr075.svg' className='svg-icon-2' />
              Create New MC
            </button>
          </div>
        </div>

        <div className='card-body'>
          {/* Search Bar */}
          <div className='d-flex align-items-center position-relative my-1 mb-5'>
            <KTSVG path='/media/icons/duotune/general/gen021.svg' className='svg-icon-1 position-absolute ms-6' />
            <input
              type='text'
              data-kt-user-table-filter='search'
              className='form-control form-control-solid w-250px ps-14'
              placeholder='Search questions...'
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Questions Table */}
          <div className='table-responsive'>
            <table className='table align-middle table-row-dashed fs-6 gy-5'>
              <thead>
                <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                  <th className='w-10px pe-2'>
                    <div className='form-check form-check-sm form-check-custom form-check-solid me-3'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </div>
                  </th>
                  <th 
                    className='min-w-125px cursor-pointer'
                    onClick={() => handleSort('question_content')}
                  >
                    <div className='d-flex align-items-center'>
                      Question Name
                    </div>
                  </th>
                  <th className='min-w-125px'>Question Preview</th>
                  <th className='min-w-125px'>Options Preview</th>
                  <th 
                    className='min-w-125px cursor-pointer'
                    onClick={() => handleSort('created_at')}
                  >
                    <div className='d-flex align-items-center'>
                      Created
                    </div>
                  </th>
                  <th className='text-end min-w-100px'>Actions</th>
                </tr>
              </thead>
              <tbody className='text-gray-600 fw-semibold'>
                {loading ? (
                  <tr>
                    <td colSpan={6} className='text-center py-10'>
                      <div className='spinner-border text-primary' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='text-center py-10'>
                      <div className='text-muted'>No questions found</div>
                    </td>
                  </tr>
                ) : (
                  questions.map((question) => (
                    <tr key={question.q_id}>
                      <td>
                        <QuestionSelectionCell
                          id={question.q_id as any}
                          checked={selectedQuestions.includes(question.q_id)}
                          onChange={(checked) => handleQuestionSelection(question.q_id, checked)}
                        />
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <div className='d-flex flex-column'>
                            <a
                              href='#'
                              className='text-gray-800 text-hover-primary mb-1'
                              onClick={() => handleQuestionNameClick(question.q_id)}
                            >
                              {question.name || 'Untitled Question'}
                            </a>
                            <span className='text-muted'>{question.type.toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className='text-gray-800'>
                          {truncateText(question.question_content, 80)}
                        </div>
                      </td>
                      <td>
                        <div className='text-gray-800'>
                          {question.mc_question ? (
                            <div>
                              {question.mc_question.options?.slice(0, 2).map((option, index) => (
                                <div key={index} className='mb-1'>
                                  <span className='badge badge-light-primary me-1'>{option.option_letter}</span>
                                  {truncateText(option.content, 30)}
                                </div>
                              ))}
                              {question.mc_question.options && question.mc_question.options.length > 2 && (
                                <span className='text-muted'>+{question.mc_question.options.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span className='text-muted'>No options</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className='text-gray-800'>
                          {question.created_at ? formatDate(question.created_at) : 'N/A'}
                        </div>
                      </td>
                      <td className='text-end'>
                        <QuestionsActionsCell id={question.q_id as any} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <TablePagination
            page={currentPage}
            total={total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </KTCard>
    </>
  )
}

export default MCListPage 