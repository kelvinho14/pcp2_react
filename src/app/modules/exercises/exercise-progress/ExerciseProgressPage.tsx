import {FC, useState, useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useParams, useNavigate} from 'react-router-dom'
import {PageTitle} from '../../../../_metronic/layout/core'
import {AppDispatch, RootState} from '../../../../store'
import {fetchExerciseProgress} from '../../../../store/exercises/exercisesSlice'
import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, getStatusIcon} from '../../../constants/assignmentStatus'
import {KTCard, KTCardBody} from '../../../../_metronic/helpers'
import {toast} from '../../../../_metronic/helpers/toast'
import {hasImages, renderHtmlSafely, getTextPreview} from '../../../../_metronic/helpers/htmlRenderer'
import {formatApiTimestamp, getUserTimezone} from '../../../../_metronic/helpers/dateUtils'
import './ExerciseProgressPage.scss'
import QuestionsView from './QuestionsView';
import StudentsView from './StudentsView';
import GridView from './GridView';

// Mock data for demonstration
// Question types: 1, 3, 4 are MC (Multiple Choice), 2, 5, 6 are LQ (Long Question)

interface StudentProgress {
  student_id: string
  student_name: string
  student_email: string
  assignment_id: string
  assigned_date: string
  due_date?: string
  status: number
  question_progress: Array<{
    question_id: string
    status: number
    score?: number
    max_score?: number
    answered_at?: string
    is_correct?: boolean
    feedback?: string
    tag_scores: Array<{
      tag_id: string
      tag_name: string
      score: number
      max_score: number
      is_correct: boolean
    }>
    student_answer?: string
    student_option?: string
    tag_total: {
      score: number
      maxScore: number
    }
  }>
  total_score: number
  max_total_score: number
  completion_percentage: number
}

const ExerciseProgressPage: FC = () => {
  const {exerciseId} = useParams<{exerciseId: string}>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'students' | 'questions' | 'grid'>('questions')
  const isInitialLoad = useRef(true)

  const {
    exerciseProgressData,
    exerciseProgressQuestions,
    exerciseProgressStudents,
    fetchingExerciseProgress,
    exerciseProgressTotal: apiExerciseProgressTotal,
  } = useSelector((state: RootState) => state.exercises)

  const exerciseProgress = exerciseProgressStudents || []
  const exerciseProgressTotal = apiExerciseProgressTotal || 0
  const questions = exerciseProgressQuestions || []
  const exercise = exerciseProgressData?.exercise

  const filteredExerciseProgress = exerciseProgress.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentAnswersForQuestion = (questionId: string) => {
    return filteredExerciseProgress.map(student => {
      const questionProgress = student.question_progress.find((q: any) => q.question_id === questionId)
      return {
        student_id: student.student_id,
        student_name: student.student_name,
        student_email: student.student_email,
        status: questionProgress?.status || ASSIGNMENT_STATUS.ASSIGNED,
        score: questionProgress?.score,
        student_answer: questionProgress?.student_answer,
        student_option: questionProgress?.student_option,
        answered_at: questionProgress?.answered_at,
        overall_status: student.status,
        tag_scores: questionProgress?.tag_scores || [],
        tag_total: questionProgress?.tag_total || { score: 0, maxScore: 0 }
      }
    }).filter(answer => answer.status !== ASSIGNMENT_STATUS.ASSIGNED)
  }

  const fetchProgressData = () => {
    if (!exerciseId) return
    dispatch(fetchExerciseProgress({
      exerciseId,
      params: {
        page: currentPage,
        items_per_page: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
        search: searchTerm || undefined
      }
    }))
  }

  useEffect(() => {
    if (exerciseId) {
      fetchProgressData()
    }
  }, [exerciseId])

  useEffect(() => {
    if (exerciseId && !isInitialLoad.current) {
      fetchProgressData()
    }
    isInitialLoad.current = false
  }, [currentPage, itemsPerPage, searchTerm, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getProgressPercentage = (student: StudentProgress) => {
    return student.completion_percentage || 0
  }

  const getOverallStatus = (student: StudentProgress) => {
    return student.status
  }

  const getQuestionStatusBadge = (status: number) => {
    const label = getStatusLabel(status as any)
    const color = getStatusColor(status as any)
    const icon = getStatusIcon(status as any)
    return (
      <span className={`badge badge-light-${color} fs-7`}>
        <i className={`${icon} me-1`}></i>
        {label}
      </span>
    )
  }

  const getQuestionTypeBadge = (type: string) => {
    return type === 'mc' ? 
      <span className='badge badge-light-primary fs-7'>MC</span> : 
      <span className='badge badge-light-info fs-7'>LQ</span>
  }

  const formatDate = (dateString?: string) => {
    return formatApiTimestamp(dateString, { format: 'custom' })
  }

  const totalPages = Math.ceil(exerciseProgressTotal / itemsPerPage)

  if (fetchingExerciseProgress) {
    return (
      <>
        <PageTitle breadcrumbs={[
          {title: 'Home', path: '/dashboard', isSeparator: false, isActive: false},
          {title: 'Exercises', path: '/exercises/assignedlist', isSeparator: false, isActive: false},
          {title: 'Exercise Progress', path: '', isSeparator: false, isActive: true}
        ]}>
          Exercise Progress
        </PageTitle>
        <KTCard>
          <KTCardBody>
            <div className='d-flex justify-content-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </KTCardBody>
        </KTCard>
      </>
    )
  }

  return (
    <div className='exercise-progress-page'>
      <PageTitle breadcrumbs={[
        {title: 'Home', path: '/dashboard', isSeparator: false, isActive: false},
        {title: 'Exercises', path: '/exercises/assignedlist', isSeparator: false, isActive: false},
        {title: exercise?.title || 'Exercise Progress', path: '', isSeparator: false, isActive: true}
      ]}>
        Exercise Progress: {exercise?.title}
      </PageTitle>

      <KTCard>
        <KTCardBody>
          {/* Exercise Summary */}
          <div className='row mb-6'>
            <div className='col-lg-12'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h3 className='card-title'>Student Progress Overview</h3>
                <button 
                  className='btn btn-secondary btn-sm'
                  onClick={() => navigate('/exercises/assignedlist')}
                >
                  <i className='fas fa-arrow-left me-2'></i>
                  Back to Exercises
                </button>
              </div>
              
              {exercise && (
                <div className='row g-4 mb-6'>
                  <div className='col-lg-3'>
                    <div className='card bg-light-primary'>
                      <div className='card-body'>
                        <div className='d-flex align-items-center'>
                          <div className='symbol symbol-50px me-3'>
                            <div className='symbol-label bg-primary'>
                              <i className='fas fa-users text-white fs-2'></i>
                            </div>
                          </div>
                          <div>
                            <div className='fs-6 text-muted'>Total Students</div>
                            <div className='fs-4 fw-bold'>{exerciseProgressTotal}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-lg-3'>
                    <div className='card bg-light-success'>
                      <div className='card-body'>
                        <div className='d-flex align-items-center'>
                          <div className='symbol symbol-50px me-3'>
                            <div className='symbol-label bg-success'>
                              <i className='fas fa-check-circle text-white fs-2'></i>
                            </div>
                          </div>
                          <div>
                            <div className='fs-6 text-muted'>Completed</div>
                            <div className='fs-4 fw-bold'>
                              {exerciseProgress.filter((s: StudentProgress) => s.status === ASSIGNMENT_STATUS.SUBMITTED || s.status === ASSIGNMENT_STATUS.GRADED).length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-lg-3'>
                    <div className='card bg-light-warning'>
                      <div className='card-body'>
                        <div className='d-flex align-items-center'>
                          <div className='symbol symbol-50px me-3'>
                            <div className='symbol-label bg-warning'>
                              <i className='fas fa-play text-white fs-2'></i>
                            </div>
                          </div>
                          <div>
                            <div className='fs-6 text-muted'>In Progress</div>
                            <div className='fs-4 fw-bold'>
                              {exerciseProgress.filter((s: StudentProgress) => s.status === ASSIGNMENT_STATUS.IN_PROGRESS).length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-lg-3'>
                    <div className='card bg-light-secondary'>
                      <div className='card-body'>
                        <div className='d-flex align-items-center'>
                          <div className='symbol symbol-50px me-3'>
                            <div className='symbol-label bg-secondary'>
                              <i className='fas fa-clock text-white fs-2'></i>
                            </div>
                          </div>
                          <div>
                            <div className='fs-6 text-muted'>Not Started</div>
                            <div className='fs-4 fw-bold'>
                              {exerciseProgress.filter((s: StudentProgress) => s.status === ASSIGNMENT_STATUS.ASSIGNED).length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student Search - always visible */}
          <div className='row mb-4'>
            <div className='col-lg-6'>
              <div className='input-group' style={{width: '300px'}}>
                <span className='input-group-text'>
                  <i className='fas fa-search'></i>
                </span>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Search students...'
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className='row mb-6'>
            <div className='col-lg-12'>
              <div className='d-flex justify-content-between align-items-center'>
                <div className='btn-group' role='group'>
                  <button
                    type='button'
                    className={`btn ${viewMode === 'questions' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('questions')}
                  >
                    <i className='fas fa-list me-2'></i>
                    Questions View
                  </button>
                  <button
                    type='button'
                    className={`btn ${viewMode === 'students' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('students')}
                  >
                    <i className='fas fa-users me-2'></i>
                    Students View
                  </button>
                  <button
                    type='button'
                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className='fas fa-th-large me-2'></i>
                    Grid View
                  </button>
                </div>
                
                {viewMode === 'students' && (
                  <select 
                    className='form-select w-auto'
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'questions' ? (
            <QuestionsView
              allQuestions={questions}
              getStudentAnswersForQuestion={getStudentAnswersForQuestion}
              getQuestionTypeBadge={getQuestionTypeBadge}
              getQuestionStatusBadge={getQuestionStatusBadge}
              formatDate={formatDate}
            />
          ) : viewMode === 'grid' ? (
            <GridView
              allQuestions={questions}
              exerciseProgress={filteredExerciseProgress}
              ASSIGNMENT_STATUS={ASSIGNMENT_STATUS}
            />
          ) : (
            <StudentsView
              exerciseProgress={filteredExerciseProgress}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
              getQuestionStatusBadge={getQuestionStatusBadge}
              getOverallStatus={getOverallStatus}
              getProgressPercentage={getProgressPercentage}
              getStatusColor={(status: number) => getStatusColor(status as any)}
              formatDate={formatDate}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
            />
          )}

          {/* Question Details for Selected Student */}
          {selectedStudent && (
            <div className='mt-6'>
              <h4 className='mb-4'>Question Details</h4>
              <div className='table-responsive'>
                <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                  <thead>
                    <tr className='fw-bold text-muted'>
                      <th className='w-50px'>#</th>
                      <th className='w-100px'>Type</th>
                      <th>Question</th>
                      <th className='w-100px'>Status</th>
                      <th className='w-100px'>Score</th>
                      <th className='w-150px'>Answered</th>
                    </tr>
                  </thead>
                  <tbody>
                                         {exerciseProgress
                       .find((s: StudentProgress) => s.student_id === selectedStudent)
                       ?.question_progress.map((question: any, index: number) => (
                        <tr key={question.question_id}>
                          <td>
                            <span className='fw-bold'>{index + 1}</span>
                          </td>
                          <td>
                            {getQuestionTypeBadge(question.question_type)}
                          </td>
                          <td>
                            <div className='fw-bold text-dark'>{question.question_name}</div>
                          </td>
                          <td>
                            {getQuestionStatusBadge(question.status)}
                          </td>
                          <td>
                            {question.score !== undefined ? (
                              <span className='fw-bold fs-6 text-success'>{question.score}%</span>
                            ) : (
                              <span className='text-muted fs-7'>N/A</span>
                            )}
                          </td>
                          <td>
                            <span className='text-muted fs-7'>{formatDate(question.answered_at)}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='d-flex justify-content-between align-items-center mt-6'>
              <div className='text-muted'>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, exerciseProgressTotal)} of {exerciseProgressTotal} students
              </div>
              <div className='d-flex'>
                <button
                  className='btn btn-sm btn-light-primary me-2'
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className='fas fa-chevron-left'></i>
                  Previous
                </button>
                <button
                  className='btn btn-sm btn-light-primary'
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                  <i className='fas fa-chevron-right ms-1'></i>
                </button>
              </div>
            </div>
          )}
        </KTCardBody>
      </KTCard>
    </div>
  )
}

export default ExerciseProgressPage 