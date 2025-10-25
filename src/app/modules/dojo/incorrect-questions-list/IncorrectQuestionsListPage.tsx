import {useEffect, useCallback, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {KTCard} from '../../../../_metronic/helpers'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {IncorrectQuestionsTable} from './table/IncorrectQuestionsTable'
import {fetchIncorrectQuestions} from '../../../../store/dojo/incorrectQuestionsSlice'
import {AppDispatch, RootState} from '../../../../store'
import {ColumnInstance} from 'react-table'
import {IncorrectQuestionItem} from '../../../../store/dojo/incorrectQuestionsSlice'
import {IncorrectQuestionsSearchComponent} from './components/IncorrectQuestionsSearchComponent'
import AIGenerateSimilarModal from '../../questions/components/AIGenerateSimilarModal'
import DojoGeneratedQuestionsModal from './components/DojoGeneratedQuestionsModal'
import {generateSimilarQuestions, createMultipleQuestions, clearGeneratedQuestions, updateGeneratedQuestions, removeGeneratedQuestion} from '../../../../store/questions/questionsSlice'
import {toast} from '../../../../_metronic/helpers/toast'
import {transformQuestionsForBackend} from '../../questions/components/questionTransformers'
import {QUESTION_VISIBILITY} from '../../../constants/questionVisibility'
import {TEACHER_VERIFICATION_STATUS} from '../../../constants/teacherVerificationStatus'
import {ConfirmationDialog} from '../../../../_metronic/helpers/ConfirmationDialog'
import Select from 'react-select'
import clsx from 'clsx'

const incorrectQuestionsBreadcrumbs: Array<PageLink> = [
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
    title: 'Weak Spots',
    path: '/dojo/weak-spots',
    isSeparator: false,
    isActive: true,
  },
]

const IncorrectQuestionsListPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const {questions, exercises, tags, pagination, loading} = useSelector((state: RootState) => state.incorrectQuestions)
  const {generatedQuestions, generatingSimilarQuestions, creatingMultipleQuestions, creating} = useSelector((state: RootState) => state.questions)
  const [currentPage, setCurrentPage] = useState(1)
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>({ id: 'answered_at', desc: true })
  const [search, setSearch] = useState('')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'challenging'>('medium')
  const [selectedQuestionType, setSelectedQuestionType] = useState<'mc' | 'lq'>('mc')
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false)
  const [showGeneratedQuestionsModal, setShowGeneratedQuestionsModal] = useState(false)
  const [showPracticePrompt, setShowPracticePrompt] = useState(false)
  const [questionsCreatedCount, setQuestionsCreatedCount] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLogic, setSelectedLogic] = useState<'and' | 'or'>('and')
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 12

  const loadQuestions = useCallback(() => {
    dispatch(fetchIncorrectQuestions({
      page: currentPage,
      sort: sort?.id,
      order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      search: search || undefined,
      assignment_ids: selectedExercises.length > 0 ? selectedExercises : undefined,
      tag_ids: selectedTags.length > 0 ? selectedTags : undefined,
      logic: selectedLogic,
    }))
  }, [dispatch, currentPage, sort, search, selectedExercises, selectedTags, selectedLogic])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const handleSortChange = useCallback((column: ColumnInstance<IncorrectQuestionItem>) => {
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

  const handleGenerateClick = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId)
    setShowAIGenerateModal(true)
  }, [])

  const handleAIGenerateSimilar = async (selectedQuestionType: 'mc' | 'lq', difficulty: 'easy' | 'medium' | 'hard' | 'challenging', count: number) => {
    if (!selectedQuestionId) return
    
    // Store the difficulty and question type for metadata and regeneration
    setSelectedDifficulty(difficulty)
    setSelectedQuestionType(selectedQuestionType)
    
    try {
      await dispatch(generateSimilarQuestions({ 
        questionIds: [selectedQuestionId], 
        questionType: selectedQuestionType,
        difficulty,
        count
      })).unwrap()
      setShowAIGenerateModal(false)
      setShowGeneratedQuestionsModal(true)
    } catch (error) {
      // Error toast is handled by the thunk
    }
  }

  const handleAcceptGeneratedQuestions = async (questions: any[], questionVerificationMap: Map<number, number>, shouldCloseModal?: boolean, questionIndex?: number) => {
    try {
      const questionData = transformQuestionsForBackend(questions)
      
      // Add AI generation metadata, verification status, and visibility to each question
      // The verification map contains the original indices, so we can use them directly
      const questionsWithMetadata = Array.from(questionVerificationMap.entries()).map(([originalIndex, verificationStatus]) => {
        // Find the question data that corresponds to this original index
        // Since the questions array passed here only contains accepted questions in order,
        // we need to match by the original generatedQuestions array
        const questionIndex = Array.from(questionVerificationMap.keys()).indexOf(originalIndex)
        const q = questionData[questionIndex]
        
        return {
          ...q,
          is_ai_generated: true,
          source_question_id: selectedQuestionId,
          teacher_verification_status: verificationStatus,
          ai_generation_metadata: {
            difficulty: selectedDifficulty,
          },
          visibility: QUESTION_VISIBILITY.PRIVATE, // Set to PRIVATE for Dojo-generated questions
        }
      })
      
      await dispatch(createMultipleQuestions(questionsWithMetadata)).unwrap()
      
      // Count how many questions need verification
      const verificationCount = Array.from(questionVerificationMap.values()).filter(
        status => status === TEACHER_VERIFICATION_STATUS.PENDING_VERIFICATION
      ).length
      
      const verificationMsg = verificationCount > 0
        ? ` (${verificationCount} marked for teacher verification)` 
        : ''
      toast.success(`${questions.length} ${questions.length === 1 ? 'question' : 'questions'} created successfully${verificationMsg}!`, 'Success')
      
      // Only close modal and clear Redux if shouldCloseModal is true
      // Don't modify Redux array when accepting individual questions - let modal handle hiding via local state
      if (shouldCloseModal) {
        setShowGeneratedQuestionsModal(false)
        dispatch(clearGeneratedQuestions())
        
        // Show practice prompt modal
        setQuestionsCreatedCount(questions.length)
        setShowPracticePrompt(true)
      }
      
      // Refresh the Weak Spots list
      loadQuestions()
    } catch (error) {
      // Error toast is handled by the thunk
    }
  }

  const handleRegenerateQuestion = async (index: number) => {
    if (!selectedQuestionId) return
    
    try {
      // Generate a single new question with the same parameters
      const result = await dispatch(generateSimilarQuestions({ 
        questionIds: [selectedQuestionId], 
        questionType: selectedQuestionType,
        difficulty: selectedDifficulty,
        count: 1
      })).unwrap()
      
      // Replace the question at the specified index with the newly generated one
      if (result && result.length > 0) {
        const updatedQuestions = [...generatedQuestions]
        updatedQuestions[index] = result[0]
        dispatch(updateGeneratedQuestions(updatedQuestions))
        toast.success('Question regenerated successfully!', 'Success')
      }
    } catch (error) {
      // Error toast is handled by the thunk
    }
  }

  const handleDismissGeneratedQuestions = () => {
    setShowGeneratedQuestionsModal(false)
    dispatch(clearGeneratedQuestions())
  }

  const handleGeneratedCountClick = useCallback((questionId: string) => {
    navigate(`/dojo/practice?source_id=${questionId}`)
  }, [navigate])

  const handleGoToPractice = () => {
    navigate('/dojo/practice')
  }

  const handleExerciseSelection = (selectedOptions: any) => {
    const optionValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedExercises(optionValues)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleTagSelection = (selectedOptions: any) => {
    const optionValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedTags(optionValues)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleLogicChange = (logic: 'and' | 'or') => {
    setSelectedLogic(logic)
    setCurrentPage(1) // Reset to first page when logic changes
  }

  // Format exercises for dropdown
  const exerciseOptions = exercises.map((exercise) => ({
    value: exercise.assignment_id,
    label: exercise.title
  }))

  // Format tags for dropdown
  const tagOptions = tags.map((tag) => ({
    value: tag.tag_id,
    label: tag.name
  }))

  return (
    <>
      <PageTitle breadcrumbs={incorrectQuestionsBreadcrumbs}>Weak Spots</PageTitle>

      {/* Welcome Banner */}
      <div className='welcome-section mb-6'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='fw-bold mb-2'>
            🥋 Welcome to the Dojo!
            </h2>
            <p className='welcome-subtitle'>
            These are the questions you missed. Ask AI to create similar ones so you can practice more
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
                  <i className='fas fa-chart-line me-1'></i>
                  {pagination.total} {pagination.total === 1 ? 'Question' : 'Questions'}
                </span>
              )}

              {/* Filters Toggle Button */}
              {(exercises.length > 0 || tags.length > 0) && (
                <button
                  type='button'
                  className='btn btn-light-dark btn-sm'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} me-2`}></i>
                  Filters
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (exercises.length > 0 || tags.length > 0) && (
          <div className='custom-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              {/* Exercise Filter */}
              {exercises.length > 0 && (
                <div className='d-flex align-items-center gap-2'>
                  <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>
                    Filter by Exercise:
                  </label>
                  <div style={{ width: '280px' }}>
                    <Select
                      options={exerciseOptions}
                      isMulti
                      onChange={handleExerciseSelection}
                      placeholder="Select exercises..."
                      isClearable
                      isSearchable
                      value={exerciseOptions.filter(option => 
                        selectedExercises.includes(option.value)
                      )}
                      noOptionsMessage={() => "No exercises found"}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        option: (provided, state) => ({
                          ...provided,
                          color: state.isSelected ? 'white' : '#000000',
                          backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8f9fa' : 'white',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: 'white',
                          zIndex: 99999,
                        }),
                        menuPortal: (provided) => ({
                          ...provided,
                          zIndex: 99999,
                        }),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className='d-flex align-items-center gap-2'>
                  <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>
                    Filter by Tag:
                  </label>
                  <div style={{ width: '280px' }}>
                    <Select
                      options={tagOptions}
                      isMulti
                      onChange={handleTagSelection}
                      placeholder="Select tags..."
                      isClearable
                      isSearchable
                      value={tagOptions.filter(option => 
                        selectedTags.includes(option.value)
                      )}
                      noOptionsMessage={() => "No tags found"}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        option: (provided, state) => ({
                          ...provided,
                          color: state.isSelected ? 'white' : '#000000',
                          backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8f9fa' : 'white',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: 'white',
                          zIndex: 99999,
                        }),
                        menuPortal: (provided) => ({
                          ...provided,
                          zIndex: 99999,
                        }),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Logic Toggle - Show when both exercises and tags filters are available */}
              {exercises.length > 0 && tags.length > 0 && (
                <div className='d-flex align-items-center gap-2'>
                  <span className='text-white-50' style={{ fontSize: '0.875rem' }}>Logic:</span>
                  <div className='btn-group btn-group-sm' role='group'>
                    <input
                      type='radio'
                      className='btn-check'
                      name='dojoFilterLogic'
                      id='dojoFilterLogicAnd'
                      value='and'
                      checked={selectedLogic === 'and'}
                      onChange={() => handleLogicChange('and')}
                    />
                    <label className={clsx('btn btn-sm', selectedLogic === 'and' ? 'btn-light-primary' : 'btn-outline-light')} htmlFor='dojoFilterLogicAnd'>
                      AND
                    </label>
                    <input
                      type='radio'
                      className='btn-check'
                      name='dojoFilterLogic'
                      id='dojoFilterLogicOr'
                      value='or'
                      checked={selectedLogic === 'or'}
                      onChange={() => handleLogicChange('or')}
                    />
                    <label className={clsx('btn btn-sm', selectedLogic === 'or' ? 'btn-light-primary' : 'btn-outline-light')} htmlFor='dojoFilterLogicOr'>
                      OR
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <KTCard>
        <div className='card-header border-0 pt-6'>
          <IncorrectQuestionsSearchComponent setSearch={setSearch} />
        </div>
        <IncorrectQuestionsTable 
          questions={questions} 
          isLoading={loading}
          onSortChange={handleSortChange}
          currentSort={sort}
          page={currentPage}
          total={pagination?.total || 0}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onGenerateClick={handleGenerateClick}
          onGeneratedCountClick={handleGeneratedCountClick}
          showAnswer={showAnswer}
        />
      </KTCard>

      {/* AI Generate Similar Questions Modal */}
      <AIGenerateSimilarModal
        show={showAIGenerateModal}
        onHide={() => setShowAIGenerateModal(false)}
        onGenerate={handleAIGenerateSimilar}
        defaultQuestionType='mc'
        isLoading={generatingSimilarQuestions}
      />

      {/* AI Generated Questions Review Modal (Read-only for Dojo) */}
      <DojoGeneratedQuestionsModal
        show={showGeneratedQuestionsModal}
        onHide={handleDismissGeneratedQuestions}
        onAccept={handleAcceptGeneratedQuestions}
        onRegenerate={handleRegenerateQuestion}
        questions={generatedQuestions}
        isLoading={generatingSimilarQuestions || creatingMultipleQuestions || creating}
      />

      {/* Go to Practice Page Confirmation */}
      <ConfirmationDialog
        show={showPracticePrompt}
        onHide={() => setShowPracticePrompt(false)}
        onConfirm={handleGoToPractice}
        title="Questions ready"
        message={` Would you like to go to the Practice page to try them now?`}
        confirmText="Go to Practice"
        cancelText="Stay Here"
        variant="success"
        confirmButtonVariant="primary"
      />
    </>
  )
}

export default IncorrectQuestionsListPage

