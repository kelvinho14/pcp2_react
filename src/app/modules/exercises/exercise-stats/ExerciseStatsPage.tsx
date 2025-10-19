import { FC, useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { KTCard, KTCardBody } from '../../../../_metronic/helpers'
import { PageLink } from '../../../../_metronic/layout/core'
import axios from 'axios'
import { getHeadersWithSchoolSubject } from '../../../../_metronic/helpers/axios'
import { formatApiTimestamp } from '../../../../_metronic/helpers/dateUtils'
import { TablePagination } from '../../../../_metronic/helpers/TablePagination'
import BaseModal from '../../../../components/Modal/BaseModal'
import { renderHtmlSafely } from '../../../../_metronic/helpers/htmlRenderer'
import { getStatusLabel, getStatusColor } from '../../../constants/assignmentStatus'

const exerciseStatsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Exercises',
    path: '/exercises/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Exercise Statistics',
    path: '',
    isSeparator: false,
    isActive: true,
  },
]

interface ExerciseStats {
  exercise_id: string
  exercise_title: string
  total_questions: number
  total_assignments: number
  low_performance_questions: Array<{
    question_id: string
    question_content: string
    question_type: string
    position: number
    correct_percentage: number
    total_attempts: number
    correct_answer: string
  }>
  two_options_questions: Array<{
    question_id: string
    question_content: string
    question_type: string
    position: number
    correct_answer: string
    option_a: string
    option_a_percentage: number
    option_a_count: number
    option_b: string
    option_b_percentage: number
    option_b_count: number
    total_attempts: number
  }>
  question_statistics: Array<{
    question_id: string
    question_content: string
    question_type: string
    position: number
    correct_percentage: number
    total_attempts: number
    options: Array<{
      option_letter: string
      selection_count: number
      selection_percentage: number
      is_correct: boolean
    }>
    score_distribution: any
  }>
  students: {
    items: Array<{
      student_id: string
      student_name: string
      assignment_id: string
      status: number
      total_score: number
      max_score: number
      score_percentage: number
      completed_questions: number
      total_questions: number
      submitted_at: string
      graded_at: string
    }>
    pagination: {
      page: number
      items_per_page: number
      total_items: number
      total_pages: number
    }
  }
}

interface QuestionDetails {
  q_id: string
  question_content: string
  type: string
  school_subject_id: string
  tags: Array<{
    tag_id: string
    name: string
    score: number
  }>
  mc_question?: {
    options: Array<{
      option_letter: string
      option_text: string
    }>
    correct_option: string
    answer_content: string
  }
}

const ExerciseStatsPage: FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const [stats, setStats] = useState<ExerciseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentsPage, setStudentsPage] = useState(1)
  const studentsPerPage = 10
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [questionDetails, setQuestionDetails] = useState<QuestionDetails | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)

  const fetchExerciseStats = useCallback(async () => {
    if (!exerciseId) {
      setError('Exercise ID is required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const API_URL = import.meta.env.VITE_APP_API_URL
      const response = await axios.get(`${API_URL}/exercises/${exerciseId}/stats?page=${studentsPage}&items_per_page=${studentsPerPage}`, {
        headers: getHeadersWithSchoolSubject(`${API_URL}/exercises/${exerciseId}/stats`),
        withCredentials: true
      })
      
      setStats(response.data)
    } catch (err: any) {
      console.error('Error fetching exercise stats:', err)
      setError(err.response?.data?.message || 'Failed to fetch exercise statistics')
    } finally {
      setLoading(false)
    }
  }, [exerciseId, studentsPage, studentsPerPage])

  useEffect(() => {
    fetchExerciseStats()
  }, [fetchExerciseStats])

  const handleStudentsPageChange = useCallback((newPage: number) => {
    setStudentsPage(newPage)
  }, [])

  // Get all questions with their positions for navigation
  const getAllQuestions = useCallback(() => {
    if (!stats) return []
    
    const allQuestions = [
      ...stats.low_performance_questions,
      ...stats.two_options_questions,
      ...stats.question_statistics
    ]
    
    // Remove duplicates based on question_id and sort by position
    const uniqueQuestions = allQuestions.reduce((acc, current) => {
      const existingIndex = acc.findIndex(q => q.question_id === current.question_id)
      if (existingIndex === -1) {
        acc.push(current)
      }
      return acc
    }, [] as typeof allQuestions)
    
    return uniqueQuestions.sort((a, b) => a.position - b.position)
  }, [stats])

  const fetchQuestionDetails = useCallback(async (questionId: string) => {
    setQuestionLoading(true)
    setCurrentQuestionId(questionId)
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL
      const response = await axios.get(`${API_URL}/questions/${questionId}`, {
        headers: getHeadersWithSchoolSubject(`${API_URL}/questions/${questionId}`),
        withCredentials: true
      })
      
      setQuestionDetails(response.data.data)
      setShowQuestionModal(true)
    } catch (err: any) {
      console.error('Error fetching question details:', err)
      setError(err.response?.data?.message || 'Failed to fetch question details')
    } finally {
      setQuestionLoading(false)
    }
  }, [])

  // Navigation functions
  const navigateToQuestion = useCallback((direction: 'prev' | 'next') => {
    const allQuestions = getAllQuestions()
    if (!currentQuestionId || allQuestions.length === 0) return
    
    const currentIndex = allQuestions.findIndex(q => q.question_id === currentQuestionId)
    if (currentIndex === -1) {
      console.error('Current question not found in navigation list')
      return
    }
    
    let newIndex: number
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allQuestions.length - 1
    } else {
      newIndex = currentIndex < allQuestions.length - 1 ? currentIndex + 1 : 0
    }
    
    const nextQuestion = allQuestions[newIndex]
    
    // Prevent navigation to the same question
    if (nextQuestion.question_id === currentQuestionId) {
      console.log('Already at the target question')
      return
    }
    
    console.log(`Navigating ${direction}: from Q${allQuestions[currentIndex].position} to Q${nextQuestion.position}`)
    fetchQuestionDetails(nextQuestion.question_id)
  }, [currentQuestionId, getAllQuestions, fetchQuestionDetails])

  if (loading) {
    return (
      <>
        <PageTitle breadcrumbs={exerciseStatsBreadcrumbs}>Exercise Statistics</PageTitle>
        <KTCard>
          <KTCardBody>
            <div className='d-flex justify-content-center align-items-center py-10'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </KTCardBody>
        </KTCard>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle breadcrumbs={exerciseStatsBreadcrumbs}>Exercise Statistics</PageTitle>
        <KTCard>
          <KTCardBody>
            <div className='alert alert-danger'>
              <h4 className='alert-heading'>Error</h4>
              <p>{error}</p>
              <hr />
              <button 
                className='btn btn-primary'
                onClick={() => navigate('/exercises/list')}
              >
                Back to Exercises
              </button>
            </div>
          </KTCardBody>
        </KTCard>
      </>
    )
  }

  if (!stats) {
    return (
      <>
        <PageTitle breadcrumbs={exerciseStatsBreadcrumbs}>Exercise Statistics</PageTitle>
        <KTCard>
          <KTCardBody>
            <div className='alert alert-warning'>
              <h4 className='alert-heading'>No Data</h4>
              <p>No statistics available for this exercise.</p>
              <hr />
              <button 
                className='btn btn-primary'
                onClick={() => navigate('/exercises/list')}
              >
                Back to Exercises
              </button>
            </div>
          </KTCardBody>
        </KTCard>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={exerciseStatsBreadcrumbs}>
        Exercise Statistics
      </PageTitle>

      {/* Exercise Title */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h1 className='welcome-title'>{stats.exercise_title}</h1>
            <p className='welcome-subtitle'>
              Comprehensive statistics and analytics for this exercise
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-md-6 col-lg-4'>
          <KTCard className='h-100'>
            <KTCardBody className='d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-5'>
                  <span className='symbol-label bg-light-primary'>
                    <i className='fas fa-question-circle fs-2x text-primary'></i>
                  </span>
                </div>
                <div className='d-flex flex-column'>
                  <span className='text-gray-800 fw-bold fs-2'>{stats.total_questions}</span>
                  <span className='text-muted fw-semibold'>Total Questions</span>
                </div>
              </div>
            </KTCardBody>
          </KTCard>
        </div>

        <div className='col-md-6 col-lg-4'>
          <KTCard className='h-100'>
            <KTCardBody className='d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-5'>
                  <span className='symbol-label bg-light-success'>
                    <i className='fas fa-tasks fs-2x text-success'></i>
                  </span>
                </div>
                <div className='d-flex flex-column'>
                  <span className='text-gray-800 fw-bold fs-2'>{stats.total_assignments}</span>
                  <span className='text-muted fw-semibold'>{stats.total_assignments === 1 ? 'Student assigned' : 'Students assigned'}</span>
                </div>
              </div>
            </KTCardBody>
          </KTCard>
        </div>

        <div className='col-md-6 col-lg-4'>
          <KTCard className='h-100'>
            <KTCardBody className='d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-5'>
                  <span className='symbol-label bg-light-warning'>
                    <i className='fas fa-exclamation-triangle fs-2x text-warning'></i>
                  </span>
                </div>
                <div className='d-flex flex-column'>
                  <span className='text-gray-800 fw-bold fs-2'>{stats.low_performance_questions.length}</span>
                  <span className='text-muted fw-semibold'>Low Performance Questions</span>
                </div>
              </div>
            </KTCardBody>
          </KTCard>
        </div>

      </div>


      {/* Less than 50% correct */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Less than 50% correct</span>
              </h3>
              <div className='mt-5'>
                {stats.low_performance_questions.length > 0 ? (
                  <div className='table-responsive'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted'>
                          <th className='min-w-200px'>Question</th>
                          <th className='min-w-200px text-start'>Correct %</th>
                          <th className='min-w-100px text-center'>Correct answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.low_performance_questions.map((question, index) => (
                          <tr key={index}>
                            <td>
                              <div className='d-flex align-items-center'>
                                <div 
                                  className='symbol symbol-40px me-3'
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => fetchQuestionDetails(question.question_id)}
                                  title='View question details'
                                >
                                  <span className='symbol-label bg-warning'>
                                    <i className='fas fa-question text-white fs-6'></i>
                                  </span>
                                </div>
                                <div className='d-flex justify-content-start flex-column'>
                                  <span className='text-gray-800 fw-bold fs-6'>Q{question.position}</span>
                                </div>
                              </div>
                            </td>
                            <td className='text-start'>
                              <span className='text-gray-800 fw-bold fs-6'>
                                {question.correct_percentage.toFixed(0)}%
                              </span>
                            </td>
                            <td className='text-center'>
                              <span className='text-gray-800 fw-bold fs-6'>
                                {question.correct_answer}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='text-center py-5'>
                    <i className='fas fa-check-circle fs-3x text-success mb-3'></i>
                    <p className='text-muted'>No low performance questions found</p>
                  </div>
                )}
              </div>
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Two option with >30% chosen */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Two options with &gt;30% chosen</span>
              </h3>
              <div className='mt-5'>
                {stats.two_options_questions.length > 0 ? (
                  <div className='table-responsive'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted'>
                          <th className='min-w-200px'>Question</th>
                          <th className='min-w-200px text-start'>Option</th>
                          <th className='min-w-100px text-center'>Correct answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.two_options_questions.map((question, index) => (
                          <tr key={index}>
                            <td>
                              <div className='d-flex align-items-center'>
                                <div 
                                  className='symbol symbol-40px me-3'
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => fetchQuestionDetails(question.question_id)}
                                  title='View question details'
                                >
                                  <span className='symbol-label bg-warning'>
                                    <i className='fas fa-question text-white fs-6'></i>
                                  </span>
                                </div>
                                <div className='d-flex justify-content-start flex-column'>
                                  <span className='text-gray-800 fw-bold fs-6'>Q{question.position}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className='d-flex flex-column gap-2 align-items-start'>
                                <span className='badge badge-primary py-1 px-2 fs-7 fw-bold d-inline-block w-auto'>
                                  {question.option_a} ({question.option_a_percentage.toFixed(0)}%)
                                </span>
                                <span className='badge badge-primary py-1 px-2 fs-7 fw-bold d-inline-block w-auto'>
                                  {question.option_b} ({question.option_b_percentage.toFixed(0)}%)
                                </span>
                              </div>
                            </td>
                            <td className='text-center'>
                              <span className='text-gray-800 fw-bold fs-6'>
                                {question.correct_answer}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='text-center py-5'>
                    <i className='fas fa-chart-bar fs-3x text-muted mb-3'></i>
                    <p className='text-muted'>No data</p>
                  </div>
                )}
              </div>
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Question distribution */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Question distribution</span>
              </h3>
              <div className='mt-5'>
                {stats.question_statistics.length > 0 ? (
                  <div className='table-responsive'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted'>
                          <th className='min-w-200px'>Question</th>
                          <th className='min-w-100px text-center'>Correct %</th>
                          <th className='min-w-100px text-center'>A</th>
                          <th className='min-w-100px text-center'>B</th>
                          <th className='min-w-100px text-center'>C</th>
                          <th className='min-w-100px text-center'>D</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.question_statistics.map((question, index) => {
                          // Create options array with all A, B, C, D options
                          const options = ['A', 'B', 'C', 'D'].map(letter => {
                            const option = question.options?.find(opt => opt.option_letter === letter)
                            return {
                              letter,
                              percentage: option ? option.selection_percentage : 0,
                              isCorrect: option ? option.is_correct : false
                            }
                          })
                          
                          return (
                            <tr key={index}>
                              <td>
                                <div className='d-flex align-items-center'>
                                  <div 
                                    className='symbol symbol-40px me-3'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => fetchQuestionDetails(question.question_id)}
                                    title='View question details'
                                  >
                                    <span className='symbol-label bg-warning'>
                                      <i className='fas fa-question text-white fs-6'></i>
                                    </span>
                                  </div>
                                  <div className='d-flex justify-content-start flex-column'>
                                    <span className='text-gray-800 fw-bold fs-6'>Q{question.position}</span>
                                  </div>
                                </div>
                              </td>
                              <td className='text-center'>
                                <span className='text-gray-800 fw-bold fs-6'>
                                  {question.correct_percentage.toFixed(0)}%
                                </span>
                              </td>
                              {options.map((option, optIndex) => (
                                <td key={optIndex} className='text-center'>
                                  <span 
                                    className={`fw-bold fs-6 px-2 py-1 rounded ${
                                      option.isCorrect ? 'bg-success text-white' : 'text-gray-800'
                                    }`}
                                  >
                                    {option.percentage.toFixed(0)}%
                                  </span>
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='text-center py-5'>
                    <i className='fas fa-chart-bar fs-3x text-muted mb-3'></i>
                    <p className='text-muted'>No question statistics available</p>
                  </div>
                )}
              </div>
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Students List */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Assigned students</span>
              </h3>
              <div className='mt-5'>
                {stats.students && stats.students.items && stats.students.items.length > 0 ? (
                  <div className='table-responsive'>
                    <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                      <thead>
                        <tr className='fw-bold text-muted'>
                          <th className='min-w-200px'>Student Name</th>
                          <th className='min-w-200px'>Score</th>
                          <th className='min-w-150px'>Submit Time</th>
                          <th className='min-w-100px'>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.students.items.map((student, index) => (
                          <tr key={index}>
                            <td>
                              <div className='d-flex align-items-center'>
                                <div className='symbol symbol-40px me-3'>
                                  <span className='symbol-label bg-light-primary'>
                                    <i className='fas fa-user text-primary fs-6'></i>
                                  </span>
                                </div>
                                <div className='d-flex justify-content-start flex-column'>
                                  <span className='text-gray-800 fw-bold fs-6'>{student.student_name}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                            <div className='d-flex flex-column gap-2 align-items-start'>
                                <span className='text-gray-800 fw-bold fs-6'>
                                  {student.total_score} / {student.max_score}
                                </span>
                                <span className={`badge badge-primary py-1 px-2 fs-7 fw-bold d-inline-block w-auto`}>
                                  {student.score_percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className='text-gray-800 fw-semibold fs-7'>
                                {formatApiTimestamp(student.submitted_at, { format: 'custom' })}
                              </span>
                            </td>
                            <td>
                              <span className={`badge fs-7 fw-bold badge-light-${getStatusColor(student.status as any)}`}>
                                {getStatusLabel(student.status as any)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='text-center py-5'>
                    <i className='fas fa-users fs-3x text-muted mb-3'></i>
                    <p className='text-muted'>No student submissions found</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {stats.students && stats.students.pagination && stats.students.pagination.total_pages > 1 && (
                <TablePagination
                  page={stats.students.pagination.page}
                  total={stats.students.pagination.total_items}
                  itemsPerPage={stats.students.pagination.items_per_page}
                  onPageChange={handleStudentsPageChange}
                  showPageNumbers={true}
                  showInfo={true}
                  className='mt-5'
                />
              )}
            </KTCardBody>
          </KTCard>
        </div>
      </div>

      {/* Back Button */}
      <div className='d-flex justify-content-end'>
        <button 
          className='btn btn-primary'
          onClick={() => navigate('/exercises/list')}
        >
          <i className='fas fa-arrow-left me-2'></i>
          Back to Exercises
        </button>
      </div>

      {/* Question Details Modal */}
      <BaseModal
        show={showQuestionModal}
        onHide={() => setShowQuestionModal(false)}
        title={questionDetails && currentQuestionId ? `Question ${getAllQuestions().find(q => q.question_id === currentQuestionId)?.position || 0}` : "Question Details"}
        size="xl"
      >
        <div className="p-4">
          {questionLoading ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fs-2x text-primary mb-3"></i>
              <p className="text-muted">Loading question details...</p>
            </div>
          ) : questionDetails ? (
            <div>
              {/* Question Content */}
              <div className="mb-4">
                <h5 className="fw-bold mb-3">Question Content</h5>
                <div 
                  className="border rounded p-3 bg-light"
                  dangerouslySetInnerHTML={{ 
                    __html: renderHtmlSafely(questionDetails.question_content, {
                      maxImageWidth: 600,
                      maxImageHeight: 400
                    })
                  }}
                />
              </div>

              {/* Multiple Choice Options */}
              {questionDetails.mc_question && (
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Options</h5>
                  <div className="row">
                    {questionDetails.mc_question.options.map((option, index) => (
                      <div key={index} className="col-md-6 mb-2">
                        <div className={`border rounded p-3 ${
                          option.option_letter === questionDetails.mc_question?.correct_option 
                            ? 'border-success bg-light-success' 
                            : 'bg-light'
                        }`}>
                          <div className="d-flex align-items-center">
                            <span className={`badge me-2 ${
                              option.option_letter === questionDetails.mc_question?.correct_option 
                                ? 'badge-success' 
                                : 'badge-secondary'
                            }`}>
                              {option.option_letter}
                            </span>
                            <div
                              dangerouslySetInnerHTML={{ 
                                __html: renderHtmlSafely(option.option_text, {
                                  maxImageWidth: 600,
                                  maxImageHeight: 400
                                })
                              }}
                            />
                            {option.option_letter === questionDetails.mc_question?.correct_option && (
                              <i className="fas fa-check-circle text-success ms-auto"></i>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {questionDetails.mc_question?.answer_content && (
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Explanation</h5>
                  <div 
                    className="border rounded p-3 bg-light"
                    dangerouslySetInnerHTML={{ 
                      __html: renderHtmlSafely(questionDetails.mc_question.answer_content, {
                        maxImageWidth: 600,
                        maxImageHeight: 400
                      })
                    }}
                  />
                </div>
              )}

              {/* Tags */}
              {questionDetails.tags && questionDetails.tags.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Tags & Scores</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {questionDetails.tags.map((tag, index) => (
                      <div key={index} className="border rounded p-2 bg-light">
                        <span className="fw-bold">{tag.name}</span>
                        <span className={`badge ms-2 ${
                          tag.score >= 80 ? 'badge-success' :
                          tag.score >= 60 ? 'badge-warning' : 'badge-primary'
                        }`}>
                          {tag.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-exclamation-triangle fs-2x text-warning mb-3"></i>
              <p className="text-muted">No question details available</p>
            </div>
          )}

          {/* Bottom Navigation */}
          {stats && questionDetails && currentQuestionId && (
            <div className="d-flex justify-content-center align-items-center mt-4 pt-3 border-top">
              <button
                className="btn btn-light me-3"
                onClick={() => navigateToQuestion('prev')}
                title="Previous Question"
              >
                <i className="fas fa-chevron-left me-2"></i>
                Previous
              </button>
              
              <div className="d-flex align-items-center mx-3">
                <select
                  className="form-select form-select-sm me-2"
                  style={{ width: 'auto' }}
                  value={currentQuestionId}
                  onChange={(e) => {
                    const selectedQuestionId = e.target.value
                    if (selectedQuestionId !== currentQuestionId) {
                      fetchQuestionDetails(selectedQuestionId)
                    }
                  }}
                >
                  {getAllQuestions().map((question) => (
                    <option key={question.question_id} value={question.question_id}>
                      Q{question.position}
                    </option>
                  ))}
                </select>
                <span className="text-muted">of {stats.total_questions}</span>
              </div>

              <button
                className="btn btn-light ms-3"
                onClick={() => navigateToQuestion('next')}
                title="Next Question"
              >
                Next
                <i className="fas fa-chevron-right ms-2"></i>
              </button>
            </div>
          )}
        </div>
      </BaseModal>
    </>
  )
}

export default ExerciseStatsPage
