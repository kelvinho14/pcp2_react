import {useEffect, useCallback, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useSearchParams} from 'react-router-dom'
import {KTCard} from '../../../../_metronic/helpers'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {PracticeQuestionsTable} from './table/PracticeQuestionsTable'
import {fetchPracticeQuestions} from '../../../../store/dojo/practiceQuestionsSlice'
import {AppDispatch, RootState} from '../../../../store'
import {ColumnInstance} from 'react-table'
import {PracticeQuestionItem} from '../../../../store/dojo/practiceQuestionsSlice'
import {PracticeQuestionsSearchComponent} from './components/PracticeQuestionsSearchComponent'

const practiceQuestionsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Dojo',
    path: '/dojo/weak-spots',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Practice',
    path: '/dojo/practice',
    isSeparator: false,
    isActive: true,
  },
]

const PracticeQuestionsListPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchParams] = useSearchParams()
  const {questions, pagination, loading} = useSelector((state: RootState) => state.practiceQuestions)
  const [currentPage, setCurrentPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(null)
  const [search, setSearch] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const itemsPerPage = 10

  // Get source_question_id from URL params
  const sourceQuestionId = searchParams.get('source_id')

  // Filter out LQ questions for now - only show MC questions
  const filteredQuestions = questions.filter(question => question.type === 'mc')

  const loadQuestions = useCallback(() => {
    dispatch(fetchPracticeQuestions({
      page: currentPage,
      sort: sort?.id,
      order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      search: search || undefined,
      sourceQuestionId: sourceQuestionId || undefined,
    }))
  }, [dispatch, currentPage, sort, search, sourceQuestionId])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const handleSortChange = useCallback((column: ColumnInstance<PracticeQuestionItem>) => {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  return (
    <>
      <PageTitle breadcrumbs={practiceQuestionsBreadcrumbs}>Practice</PageTitle>

      {/* Welcome Banner */}
      <div className='welcome-section mb-6'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='fw-bold mb-2'>
              🏋️ Practice Questions
            </h2>
            <p className='welcome-subtitle'>
              These are questions created by AI based on your weak spots - perfect for mastering your weak spots
            </p>
          </div>
          <div className='welcome-actions'>
            <div className='d-flex align-items-center gap-3 bg-light-primary rounded px-4 py-3'>
              {/* Show Answer Toggle */}
              <div className='form-check form-switch'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='showAnswerToggle'
                  checked={showAnswer}
                  onChange={(e) => setShowAnswer(e.target.checked)}
                  style={{cursor: 'pointer'}}
                />
                <label className='form-check-label fw-bold text-dark' htmlFor='showAnswerToggle' style={{cursor: 'pointer'}}>
                  Show Answer
                </label>
              </div>
              
              {/* Question Count Badge */}
              {pagination && (
                <span className='badge badge-light-primary fs-6'>
                  <i className='fas fa-brain me-1'></i>
                  {pagination.total} {pagination.total === 1 ? 'Question' : 'Questions'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <KTCard>
        <div className='card-header border-0 pt-6'>
          <PracticeQuestionsSearchComponent setSearch={setSearch} />
        </div>
        <PracticeQuestionsTable 
          questions={filteredQuestions} 
          isLoading={loading}
          onSortChange={handleSortChange}
          currentSort={sort}
          page={currentPage}
          total={pagination?.total || 0}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          showAnswer={showAnswer}
        />
      </KTCard>
    </>
  )
}

export default PracticeQuestionsListPage

