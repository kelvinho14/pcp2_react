import {FC, useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {toast} from '../../../../_metronic/helpers/toast'
import {renderHtmlSafely} from '../../../../_metronic/helpers/htmlRenderer'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import {formatApiTimestamp} from '../../../../_metronic/helpers/dateUtils'
import StudentRouteGuard from '../StudentRouteGuard'
import './ExerciseMyResultPage.scss'

interface Option {
  option_letter: string
  option_text: string
}

interface ModelAnswer {
  correct_option?: string
  options?: Option[]
  answer_content?: string
  rubric_content?: any
}

interface StudentAnswer {
  your_answer?: string
  correct_answer?: string
  is_correct?: boolean
  score?: number
  max_score?: number
  feedback?: string | null
  is_graded?: boolean
  graded_at?: string
}

interface Question {
  question_id: string
  question_type: 'mc' | 'lq'
  question_content: string
  model_answer: ModelAnswer
  student_answer: StudentAnswer | null
}

interface ExerciseResult {
  assignment_id: string
  exercise: {
    exercise_id: string
    title: string
  }
  student: {
    id: string
    name: string
    email: string
  }
  status: number
  assigned_at: string
  due_date: string | null
  submitted_at: string
  graded_at: string | null
  feedback: string | null
  score: {
    total_score: number
    max_total_score: number
    percentage: number
  }
  progress: {
    answered_questions: number
    total_questions: number
    percentage: number
  }
  questions: Question[]
}

const ExerciseMyResultPage: FC = () => {
  const {assignmentId} = useParams<{assignmentId: string}>()
  const navigate = useNavigate()
  const [result, setResult] = useState<ExerciseResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (assignmentId) {
      fetchExerciseResult()
    }
  }, [assignmentId])

  const fetchExerciseResult = async () => {
    if (!assignmentId) return

    try {
      setLoading(true)
      const url = `${import.meta.env.VITE_APP_API_URL}/student-exercises/myresult/${assignmentId}`
      const headers = getHeadersWithSchoolSubject(url)
      
      const response = await axios.get(url, {
        headers,
        withCredentials: true
      })

      if (response.data.status === 'success') {
        setResult(response.data.data)
      } else {
        setError('Failed to load exercise result')
        toast.error('Failed to load exercise result', 'Error')
      }
    } catch (err: any) {
      console.error('Error fetching exercise result:', err)
      const errorMessage = err.response?.data?.message || 'Failed to load exercise result'
      setError(errorMessage)
      toast.error(errorMessage, 'Error')
    } finally {
      setLoading(false)
    }
  }


  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success'
    if (percentage >= 60) return 'text-warning'
    return 'text-danger'
  }

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) return 'badge-light-success'
    if (percentage >= 60) return 'badge-light-warning'
    return 'badge-light-danger'
  }

  const getAnswerDisplay = (question: Question, includeIcon: boolean = false) => {
    if (question.question_type === 'mc') {
      if (!question.student_answer || !question.student_answer.your_answer) {
        return '<span class="text-danger">Not answered</span>'
      }
      const studentOption = question.model_answer.options?.find(
        opt => opt.option_letter === question.student_answer?.your_answer
      )
      if (!studentOption) return '<span class="text-danger">Not answered</span>'
      
      const optionText = studentOption.option_text || ''
      const isCorrect = question.student_answer?.is_correct || false
      
      if (includeIcon) {
        const icon = isCorrect 
          ? '<i class="fas fa-check text-success ms-2"></i>' 
          : '<i class="fas fa-times text-danger ms-2"></i>'
        
        // For correct answers, only show option letter and icon
        if (isCorrect) {
          return `<div><strong>${studentOption.option_letter}</strong> ${icon}</div>`
        }
        
        // For incorrect answers, show option letter, icon, and text
        return `<div><strong>${studentOption.option_letter}</strong> ${icon}</div><div class="mt-1">${optionText}</div>`
      }
      
      return `<strong>${studentOption.option_letter}</strong> ${optionText}`
    }
    return 'N/A'
  }

  const getModelAnswerDisplay = (question: Question) => {
    if (question.question_type === 'mc') {
      const correctOption = question.model_answer.options?.find(
        opt => opt.option_letter === question.model_answer.correct_option
      )
      if (!correctOption) return 'N/A'
      
      const optionText = correctOption.option_text || ''
      return `<strong>${correctOption.option_letter}</strong> ${optionText}`
    }
    return 'N/A'
  }

  // Filter only MC questions
  const mcQuestions = result?.questions.filter(q => q.question_type === 'mc') || []

  if (loading) {
    return (
      <StudentRouteGuard>
        <PageTitle breadcrumbs={[
          {
            title: 'Dashboard',
            path: '/exercises/dashboard',
            isSeparator: false,
            isActive: false,
          },
          {
            title: 'Exercise Result',
            path: '#',
            isSeparator: false,
            isActive: true,
          }
        ]}>
          Exercise Result
        </PageTitle>
        <KTCard>
          <div className='card-body text-center py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <div className='mt-3'>Loading exercise result...</div>
          </div>
        </KTCard>
      </StudentRouteGuard>
    )
  }

  if (error || !result) {
    return (
      <StudentRouteGuard>
        <PageTitle breadcrumbs={[
          {
            title: 'Dashboard',
            path: '/exercises/dashboard',
            isSeparator: false,
            isActive: false,
          },
          {
            title: 'Exercise Result',
            path: '#',
            isSeparator: false,
            isActive: true,
          }
        ]}>
          Exercise Result
        </PageTitle>
        <KTCard>
          <div className='card-body text-center py-10'>
            <div className='text-danger mb-3'>
              <i className='fas fa-exclamation-triangle fs-2x'></i>
            </div>
            <h4 className='text-danger mb-3'>Error Loading Result</h4>
            <p className='text-muted mb-4'>{error || 'Unable to load exercise result'}</p>
            <button 
              className='btn btn-primary'
              onClick={() => navigate('/exercises/dashboard')}
            >
              <i className='fas fa-arrow-left me-2'></i>
              Back to Dashboard
            </button>
          </div>
        </KTCard>
      </StudentRouteGuard>
    )
  }

  return (
    <StudentRouteGuard>
      <div className='exercise-result-page'>
      <PageTitle breadcrumbs={[
        {
          title: 'Dashboard',
          path: '/exercises/dashboard',
          isSeparator: false,
          isActive: false,
        },
        {
          title: result.exercise.title,
          path: '#',
          isSeparator: false,
          isActive: true,
        }
      ]}>
        Exercise Result
      </PageTitle>

      {/* Profile Card Style Header */}
      <div className='profile-card-header'>
        <div className='profile-card'>
          {/* Exercise Info Section */}
          <div className='exercise-info'>
            <div className='exercise-name-section'>
              <h1 className='exercise-name'>{result.exercise.title}</h1>
            </div>
            
            {/* Stats Cards */}
            <div className='stats-cards'>
              <div className='stat-card submitted'>
                <div className='stat-content'>
                  <div className='stat-value'>{formatApiTimestamp(result.submitted_at, { format: 'custom' })}</div>
                  <div className='stat-label'>Submitted</div>
                </div>
              </div>
              
              <div className='stat-card status'>
                <div className='stat-content'>
                  <div className='stat-value'>{result.status === 3 ? 'Graded' : 'Submitted'}</div>
                  <div className='stat-label'>Status</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Score Avatar Section - Far Right */}
          <div className='score-avatar'>
            <div className='score-display'>
              <div className='score-percentage'>{result.score.percentage.toFixed(1)}%</div>
              <div className='score-points'>{result.score.total_score}/{result.score.max_total_score} points</div>
            </div>
          </div>
        </div>
      </div>


      {/* MC Questions Table */}
      <KTCard>
        <div className='card-header border-0 pt-5'>
          <h3 className='card-title align-items-start flex-column'>
            <span className='card-label fw-bold fs-3 mb-1'>{mcQuestions.length} questions</span>
            <span className='text-muted mt-1 fw-semibold fs-7'></span>
          </h3>
        </div>
        <div className='card-body py-3'>
            <div className='table-responsive' style={{maxHeight: '800px', overflowY: 'auto'}}>
              <table className='table align-middle gs-0 gy-4'>
                <thead style={{position: 'sticky', top: 0, zIndex: 10}}>
                  <tr className='fw-bold text-muted bg-light'>
                    <th className='ps-4 min-w-20px rounded-start'>#</th>
                    <th className='min-w-300px'>Question</th>
                    <th className='min-w-200px'>Model Answer</th>
                    <th className='min-w-200px rounded-end'>Your Answer</th>
                  </tr>
                </thead>
              <tbody>
                {mcQuestions.map((question, index) => {
                  const isAnswered = question.student_answer !== null
                  const isCorrect = question.student_answer?.is_correct || false
                  
                  return (
                    <tr key={question.question_id}>
                      <td>
                        <div className='ps-4'>
                          <span className='text-gray-900 fw-bold d-block fs-6'>{index + 1}</span>
                        </div>
                      </td>
                      <td>
                        <div className='d-flex justify-content-start flex-column'>
                          <div 
                            className='text-gray-900 mb-1'
                            style={{
                              maxWidth: '500px',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal'
                            }}
                            dangerouslySetInnerHTML={{__html: renderHtmlSafely(question.question_content, { maxImageWidth: 400, maxImageHeight: 240 })}} 
                          />
                        </div>
                      </td>
                      <td>
                        <div 
                          className='text-gray-900'
                          style={{
                            maxWidth: '300px',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal'
                          }}
                          dangerouslySetInnerHTML={{__html: renderHtmlSafely(getModelAnswerDisplay(question), { maxImageWidth: 400, maxImageHeight: 240 })}}
                        />
                      </td>
                      <td>
                        <div 
                          className={isAnswered ? (isCorrect ? 'text-success' : 'text-danger') : 'text-danger'}
                          style={{
                            maxWidth: '300px',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal'
                          }}
                          dangerouslySetInnerHTML={{__html: renderHtmlSafely(getAnswerDisplay(question, true), { maxImageWidth: 400, maxImageHeight: 240 })}}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </KTCard>

      {/* Back Button */}
      <div className='mt-6 text-center'>
        <button 
          className='btn btn-primary btn-lg'
          onClick={() => navigate('/exercises/dashboard')}
        >
          <i className='fas fa-arrow-left me-2'></i>
          Back to Dashboard
        </button>
      </div>
      </div>
    </StudentRouteGuard>
  )
}

export default ExerciseMyResultPage
