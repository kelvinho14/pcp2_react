import { FC, useEffect, useState, useCallback, useMemo } from 'react'
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
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

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
  const [questionDistributionTab, setQuestionDistributionTab] = useState<'table' | 'chart'>('table')
  
  // Student Result Modal state
  const [showStudentResultModal, setShowStudentResultModal] = useState(false)
  const [studentResult, setStudentResult] = useState<any>(null)
  const [studentResultLoading, setStudentResultLoading] = useState(false)
  const [currentStudentIndex, setCurrentStudentIndex] = useState<number>(0)

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

  const fetchStudentResult = useCallback(async (assignmentId: string, studentId: string, studentIndex?: number) => {
    setStudentResultLoading(true)
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL
      const response = await axios.get(
        `${API_URL}/exercises/assignments/${assignmentId}/students/${studentId}/result`,
        {
          headers: getHeadersWithSchoolSubject(`${API_URL}/exercises/assignments/${assignmentId}/students/${studentId}/result`),
          withCredentials: true
        }
      )
      
      setStudentResult(response.data.data)
      if (studentIndex !== undefined) {
        setCurrentStudentIndex(studentIndex)
      }
      setShowStudentResultModal(true)
    } catch (err: any) {
      console.error('Error fetching student result:', err)
      setError(err.response?.data?.message || 'Failed to fetch student result')
    } finally {
      setStudentResultLoading(false)
    }
  }, [])

  // Add global function for chart label clicks
  useEffect(() => {
    (window as any).openQuestionDetails = (questionId: string) => {
      fetchQuestionDetails(questionId)
    }
    
    return () => {
      delete (window as any).openQuestionDetails
    }
  }, [fetchQuestionDetails])

  // Student navigation functions
  const navigateToStudent = useCallback((direction: 'prev' | 'next') => {
    if (!stats || !stats.students || !stats.students.items || stats.students.items.length <= 1) return
    
    const students = stats.students.items
    let newIndex: number
    
    if (direction === 'prev') {
      newIndex = currentStudentIndex > 0 ? currentStudentIndex - 1 : students.length - 1
    } else {
      newIndex = currentStudentIndex < students.length - 1 ? currentStudentIndex + 1 : 0
    }
    
    const student = students[newIndex]
    fetchStudentResult(student.assignment_id, student.student_id, newIndex)
  }, [stats, currentStudentIndex, fetchStudentResult])

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

  // Chart: Question Performance
  const questionPerformanceChartOptions = useMemo(() => {
    if (!stats || !stats.question_statistics || stats.question_statistics.length === 0) {
      return null
    }

    const sortedQuestions = [...stats.question_statistics].sort((a, b) => a.position - b.position)

    return {
      chart: {
        type: 'column',
        height: 400,
        events: {
          load: function(this: any) {
            // Add click listeners to x-axis labels after chart loads
            const chart = this
            const xAxis = chart.xAxis[0]
            
            // Wait for labels to be rendered
            setTimeout(() => {
              const ticks = xAxis.ticks
              Object.keys(ticks).forEach(key => {
                const tick = ticks[key]
                if (tick && tick.label && tick.label.element) {
                  const labelElement = tick.label.element
                  const categoryText = tick.label.textStr
                  const questionNumber = parseInt(categoryText.replace('Q', ''))
                  const questionData = sortedQuestions.find(q => q.position === questionNumber)
                  
                  if (questionData) {
                    labelElement.style.cursor = 'pointer'
                    labelElement.style.color = '#009ef7'
                    labelElement.style.textDecoration = 'underline'
                    
                    labelElement.addEventListener('click', function() {
                      if ((window as any).openQuestionDetails) {
                        (window as any).openQuestionDetails(questionData.question_id)
                      }
                    })
                  }
                }
              })
            }, 100)
          }
        }
      },
      title: {
        text: '',
        align: 'left',
      },
      subtitle: {
        text: 'Correct answer percentage per question',
        align: 'left',
      },
      xAxis: {
        categories: sortedQuestions.map(q => `Q${q.position}`),
        crosshair: true,
        title: {
          text: 'Question Number',
        },
        labels: {
          style: {
            cursor: 'pointer',
            color: '#009ef7',
            textDecoration: 'underline',
          },
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        title: {
          text: 'Correct Percentage (%)',
        },
        plotLines: [{
          value: 50,
          color: '#ff6b6b',
          dashStyle: 'ShortDash',
          width: 2,
          label: {
            text: '50% threshold',
            align: 'right',
          },
        }],
      },
      tooltip: {
        shared: true,
        formatter: function(this: any) {
          const point = this.points[0]
          const questionData = sortedQuestions[point.point.index]
          return `<b>Q${point.x+1}</b><br/>` +
                 `Correct: ${point.y.toFixed(1)}%<br/>` +
                 `Attempts: ${questionData.total_attempts}<br/>` +
                 `<i>Click on label to view details</i>`
        },
      },
      plotOptions: {
        column: {
          colorByPoint: false,
          zones: [{
            value: 50,
            color: '#f1416c',
          }, {
            value: 70,
            color: '#ffc700',
          }, {
            color: '#50cd89',
          }],
          dataLabels: {
            enabled: true,
            format: '{y:.0f}%',
          },
          cursor: 'pointer',
          point: {
            events: {
              click: function(this: any) {
                const questionData = sortedQuestions[this.index]
                fetchQuestionDetails(questionData.question_id)
              },
            },
          },
        },
      },
      series: [{
        name: 'Correct %',
        data: sortedQuestions.map(q => parseFloat(q.correct_percentage.toFixed(1))),
      }],
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    }
  }, [stats, fetchQuestionDetails])

  // Chart: Student Score Distribution
  const studentScoreDistributionChartOptions = useMemo(() => {
    if (!stats || !stats.students || !stats.students.items || stats.students.items.length === 0) {
      return null
    }

    // Sort students by score percentage for better visualization
    // Filter out students with null scores and sort by percentage
    const sortedStudents = [...stats.students.items]
      .filter(student => student.score_percentage !== null)
      .sort((a, b) => (a.score_percentage || 0) - (b.score_percentage || 0))

    return {
      chart: {
        type: 'column',
        height: 400,
      },
      title: {
        text: 'Student Score Distribution',
        align: 'left',
      },
      subtitle: {
        text: `Individual student scores (${stats.students.pagination.total_items} students)`,
        align: 'left',
      },
      xAxis: {
        categories: sortedStudents.map(student => `${student.total_score}/${student.max_score}`),
        crosshair: true,
        title: {
          text: 'Student Scores',
        },
        labels: {
          rotation: -45,
          style: {
            fontSize: '12px',
          },
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        title: {
          text: 'Score Percentage (%)',
        },
        plotLines: [{
          value: 50,
          color: '#ff6b6b',
          dashStyle: 'ShortDash',
          width: 2,
          label: {
            text: '50% threshold',
            align: 'right',
          },
        }],
      },
      tooltip: {
        formatter: function(this: any) {
          const student = sortedStudents[this.point.index]
          return `<b>${student.student_name}</b><br/>` +
                 `Score: ${student.total_score || 0}/${student.max_score || 0}<br/>` +
                 `Percentage: ${student.score_percentage ? student.score_percentage.toFixed(1) : '0.0'}%<br/>` +
                 `Status: ${getStatusLabel(student.status as any)}`
        },
      },
      plotOptions: {
        column: {
          colorByPoint: true,
          colors: sortedStudents.map(student => {
            const percentage = student.score_percentage || 0
            if (percentage >= 80) return '#50cd89' // Green
            if (percentage >= 60) return '#ffc700' // Yellow
            if (percentage >= 40) return '#ff9f43' // Orange
            return '#f1416c' // Red
          }),
          dataLabels: {
            enabled: true,
            format: '{y:.1f}%',
            style: {
              fontSize: '11px',
              fontWeight: 'bold',
            },
          },
        },
      },
      series: [{
        name: 'Score %',
        data: sortedStudents.map(student => student.score_percentage || 0),
      }],
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    }
  }, [stats])


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

      {/* Student Statistics Cards */}
      {stats && stats.students && stats.students.items && stats.students.items.length > 0 && (() => {
        const students = stats.students.items.filter(student => student.score_percentage !== null)
        if (students.length === 0) return null
        
        const scores = students.map(student => student.score_percentage || 0)
        const totalScores = students.map(student => student.total_score || 0)
        const maxScores = students.map(student => student.max_score || 0)
        
        // Calculate average
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
        const averageTotal = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length
        const averageMax = maxScores.reduce((sum, score) => sum + score, 0) / maxScores.length
        
        // Calculate median
        const sortedScores = [...scores].sort((a, b) => a - b)
        const medianScore = sortedScores.length % 2 === 0
          ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
          : sortedScores[Math.floor(sortedScores.length / 2)]
        
        const sortedTotalScores = [...totalScores].sort((a, b) => a - b)
        const medianTotal = sortedTotalScores.length % 2 === 0
          ? (sortedTotalScores[sortedTotalScores.length / 2 - 1] + sortedTotalScores[sortedTotalScores.length / 2]) / 2
          : sortedTotalScores[Math.floor(sortedTotalScores.length / 2)]
        
        const sortedMaxScores = [...maxScores].sort((a, b) => a - b)
        const medianMax = sortedMaxScores.length % 2 === 0
          ? (sortedMaxScores[sortedMaxScores.length / 2 - 1] + sortedMaxScores[sortedMaxScores.length / 2]) / 2
          : sortedMaxScores[Math.floor(sortedMaxScores.length / 2)]
        
        // Calculate range
        const minScore = Math.min(...totalScores)
        const maxScore = Math.max(...totalScores)
        const minMaxScore = Math.min(...maxScores)
        const maxMaxScore = Math.max(...maxScores)
        
        return (
          <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
            <div className='col-md-4'>
              <KTCard className='h-100'>
                <KTCardBody className='d-flex flex-column justify-content-center'>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-50px me-5'>
                      <span className='symbol-label bg-light-success'>
                        <i className='fas fa-chart-line fs-2x text-success'></i>
                      </span>
                    </div>
                    <div className='d-flex flex-column'>
                      <span className='text-gray-800 fw-bold fs-2'>{averageScore.toFixed(1)}%</span>
                      <span className='text-muted fw-semibold'>Average</span>
                      <span className='text-gray-600 fs-7'>{averageTotal.toFixed(1)} / {averageMax.toFixed(1)}</span>
                    </div>
                  </div>
                </KTCardBody>
              </KTCard>
            </div>

            <div className='col-md-4'>
              <KTCard className='h-100'>
                <KTCardBody className='d-flex flex-column justify-content-center'>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-50px me-5'>
                      <span className='symbol-label bg-light-primary'>
                        <i className='fas fa-chart-bar fs-2x text-primary'></i>
                      </span>
                    </div>
                    <div className='d-flex flex-column'>
                      <span className='text-gray-800 fw-bold fs-2'>{medianScore.toFixed(1)}%</span>
                      <span className='text-muted fw-semibold'>Median</span>
                      <span className='text-gray-600 fs-7'>{medianTotal.toFixed(1)} / {medianMax.toFixed(1)}</span>
                    </div>
                  </div>
                </KTCardBody>
              </KTCard>
            </div>

            <div className='col-md-4'>
              <KTCard className='h-100'>
                <KTCardBody className='d-flex flex-column justify-content-center'>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-50px me-5'>
                      <span className='symbol-label bg-light-warning'>
                        <i className='fas fa-chart-area fs-2x text-warning'></i>
                      </span>
                    </div>
                    <div className='d-flex flex-column'>
                      <span className='text-gray-800 fw-bold fs-2'>{minScore} - {maxScore}</span>
                      <span className='text-muted fw-semibold'>Range</span>
                      <span className='text-gray-600 fs-7'>out of {maxMaxScore}</span>
                    </div>
                  </div>
                </KTCardBody>
              </KTCard>
            </div>
          </div>
        )
      })()}

      {/* Student Score Distribution Chart */}
      <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
        <div className='col-xl-12'>
          <KTCard>
            <KTCardBody>
              {studentScoreDistributionChartOptions ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={studentScoreDistributionChartOptions}
                />
              ) : (
                <div className='text-center py-5'>
                  <i className='fas fa-chart-bar fs-3x text-muted mb-3'></i>
                  <p className='text-muted'>No student data available for chart</p>
                </div>
              )}
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
              <div className='d-flex justify-content-between align-items-center mb-5'>
                <h3 className='card-title align-items-start flex-column mb-0'>
                  <span className='card-label fw-bold fs-3'>Question distribution</span>
                </h3>
                
                {/* Tabs */}
                <div className='d-flex'>
                  <ul className='nav nav-tabs nav-line-tabs nav-line-tabs-2x border-transparent fs-4 fw-bold flex-nowrap'>
                    <li className='nav-item'>
                      <button
                        className={`nav-link text-active-primary ms-0 ${
                          questionDistributionTab === 'table' ? 'active' : ''
                        }`}
                        onClick={() => setQuestionDistributionTab('table')}
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <i className='fas fa-table me-2'></i>
                        Table
                      </button>
                    </li>
                    <li className='nav-item'>
                      <button
                        className={`nav-link text-active-primary ${
                          questionDistributionTab === 'chart' ? 'active' : ''
                        }`}
                        onClick={() => setQuestionDistributionTab('chart')}
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <i className='fas fa-chart-bar me-2'></i>
                        Chart
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className='tab-content'>
                {/* Table Tab */}
                {questionDistributionTab === 'table' && (
                  <div className='tab-pane fade show active'>
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
                )}

                {/* Chart Tab */}
                {questionDistributionTab === 'chart' && (
                  <div className='tab-pane fade show active'>
                    {questionPerformanceChartOptions ? (
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={questionPerformanceChartOptions}
                      />
                    ) : (
                      <div className='text-center py-5'>
                        <i className='fas fa-chart-bar fs-3x text-muted mb-3'></i>
                        <p className='text-muted'>No question performance data available</p>
                      </div>
                    )}
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
                                  <span 
                                    className='text-primary fw-bold fs-6 cursor-pointer text-hover-primary'
                                    
                                    onClick={() => fetchStudentResult(student.assignment_id, student.student_id, index)}
                                    title='View student result'
                                  >
                                    {student.student_name}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                            <div className='d-flex flex-column gap-2 align-items-start'>
                                <span className='text-gray-800 fw-bold fs-6'>
                                  {student.total_score || 0} / {student.max_score || 0}
                                </span>
                                <span className={`badge badge-primary py-1 px-2 fs-7 fw-bold d-inline-block w-auto`}>
                                  {student.score_percentage ? student.score_percentage.toFixed(1) : '0.0'}%
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

      {/* Student Result Modal */}
      <BaseModal
        show={showStudentResultModal}
        onHide={() => setShowStudentResultModal(false)}
        title={studentResult ? studentResult.exercise.title : "Student Result"}
        size="xl"
      >
        <div className="p-4">
          {studentResultLoading ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fs-2x text-primary mb-3"></i>
              <p className="text-muted">Loading student result...</p>
            </div>
          ) : studentResult ? (
            <div>

              {/* Student Info Card */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border border-gray-300">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="symbol symbol-50px me-4">
                            <span className="symbol-label bg-light-primary">
                              <i className="fas fa-user text-primary fs-2x"></i>
                            </span>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-1">{studentResult.student.name}</h5>
                          </div>
                        </div>
                        {studentResult.submitted_at && (
                          <div className="text-end">
                            <div className="text-muted small">Submitted</div>
                            <div className="fw-bold">
                              {formatApiTimestamp(studentResult.submitted_at, { format: 'custom' })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score and Progress Cards */}
              <div className="row mb-5">
                <div className="col-md-6">
                  <div className="card bg-light-success border-0">
                    <div className="card-body text-center">
                      <h6 className="text-muted mb-2">Score</h6>
                      <h3 className="text-success fw-bold mb-0">
                        {studentResult.score.total_score} / {studentResult.score.max_total_score}
                      </h3>
                      <span className="badge badge-success mt-2">
                        {studentResult.score.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light-primary border-0">
                    <div className="card-body text-center">
                      <h6 className="text-muted mb-2">Progress</h6>
                      <h3 className="text-primary fw-bold mb-0">
                        {studentResult.progress.answered_questions} / {studentResult.progress.total_questions}
                      </h3>
                      <span className="badge badge-primary mt-2">
                        {studentResult.progress.percentage.toFixed(1)}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Feedback */}
              {studentResult.feedback && (
                <div className="bg-light-info rounded p-4 mb-5">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-comment-dots text-info me-3 mt-1"></i>
                    <div className="flex-grow-1">
                      <h6 className="text-info fw-bold mb-2">Overall Feedback</h6>
                      <div className="text-gray-800">{studentResult.feedback}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions and Answers */}
              <div className="mb-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-question-circle me-2"></i>
                  Questions & Answers
                </h5>
                
                {studentResult.questions && studentResult.questions.length > 0 ? (
                  studentResult.questions.map((question: any, index: number) => (
                    <div key={question.question_id} className="card border border-gray-300 mb-4">
                      <div className="card-body">
                        {/* Question Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-start flex-grow-1">
                            <span className="badge badge-primary me-3 mt-1">Q{index + 1}</span>
                            <div 
                              className="flex-grow-1"
                              dangerouslySetInnerHTML={{ 
                                __html: renderHtmlSafely(question.question_content, {
                                  maxImageWidth: 600,
                                  maxImageHeight: 400
                                })
                              }}
                            />
                          </div>
                          <span className="badge badge-secondary ms-2">
                            {question.question_type === 'mc' ? 'MC' : 
                             question.question_type === 'lq' ? 'LQ' : 
                             question.question_type === 'tf' ? 'True/False' : 
                             question.question_type === 'matching' ? 'Matching' : 'Unknown'}
                          </span>
                        </div>

                        {/* Multiple Choice Questions */}
                        {question.question_type === 'mc' && question.model_answer && (
                          <div>
                            <div className="row mb-3">
                              {question.model_answer.options?.map((option: any) => {
                                const isCorrect = question.model_answer.correct_option === option.option_letter
                                const isStudentAnswer = question.student_answer?.your_answer === option.option_letter
                                const studentAnsweredCorrectly = question.student_answer?.is_correct
                                
                                // If student answered correctly, only show the correct answer
                                // If student answered incorrectly, show both student's answer and correct answer
                                let shouldShow = false
                                if (studentAnsweredCorrectly) {
                                  shouldShow = isCorrect
                                } else {
                                  shouldShow = isCorrect || isStudentAnswer
                                }
                                
                                if (!shouldShow) return null
                                
                                return (
                                  <div key={option.option_letter} className="col-md-6 mb-2">
                                    <div className={`border rounded p-3 ${
                                      isCorrect ? ' bg-light-success' : 
                                      isStudentAnswer && !isCorrect ? ' bg-light-danger' : 
                                      'bg-light'
                                    }`}>
                                      <div className="d-flex align-items-start">
                                        <span className={`badge me-2 ${
                                          isCorrect ? 'badge-success' : 
                                          isStudentAnswer && !isCorrect ? 'badge-danger' : 'badge-secondary'
                                        }`}>
                                          {option.option_letter}
                                        </span>
                                        <div 
                                          className="flex-grow-1"
                                          dangerouslySetInnerHTML={{ 
                                            __html: renderHtmlSafely(option.option_text || '', {
                                              maxImageWidth: 400,
                                              maxImageHeight: 300
                                            })
                                          }}
                                        />
                                        {isCorrect && (
                                          <i className="fas fa-check-circle text-success ms-2 mt-1"></i>
                                        )}
                                        {isStudentAnswer && !isCorrect && (
                                          <i className="fas fa-times-circle text-danger ms-2 mt-1"></i>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {question.model_answer.answer_content && (
                              <div className="bg-light-info rounded p-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-lightbulb text-info me-2 mt-1"></i>
                                  <div className="flex-grow-1">
                                    <strong className="text-info">Explanation:</strong>
                                    <div 
                                      className="mt-2"
                                      dangerouslySetInnerHTML={{ 
                                        __html: renderHtmlSafely(question.model_answer.answer_content, {
                                          maxImageWidth: 600,
                                          maxImageHeight: 400
                                        })
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* True/False Questions */}
                        {question.question_type === 'tf' && question.model_answer && (
                          <div>
                            {/* Show what student answered only if incorrect */}
                            {question.student_answer && !question.student_answer.is_correct && (
                              <div className="mb-3 p-3 border rounded bg-light">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div>
                                    <strong className="me-2">Student's Answer:</strong>
                                    <span className="badge badge-danger">
                                      {question.student_answer.your_answer ? String(question.student_answer.your_answer).toUpperCase() : 'No answer'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-danger fw-bold">
                                      <i className="fas fa-times-circle me-1"></i>Incorrect
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="row mb-3">
                              {['true', 'false'].map((option) => {
                                const isCorrect = question.model_answer.correct_answer === option
                                const isStudentAnswer = question.student_answer?.your_answer === option
                                const studentAnsweredCorrectly = question.student_answer?.is_correct
                                
                                // If student answered correctly, only show the correct answer
                                // If student answered incorrectly, show both student's answer and correct answer
                                let shouldShow = false
                                if (studentAnsweredCorrectly) {
                                  shouldShow = isCorrect
                                } else {
                                  shouldShow = isCorrect || isStudentAnswer
                                }
                                
                                if (!shouldShow) return null
                                
                                return (
                                  <div key={option} className="col-md-6 mb-2">
                                    <div className={`border rounded p-3 ${
                                      isCorrect ? 'border-success bg-light-success' : 
                                      isStudentAnswer && !isCorrect ? 'border-danger bg-light-danger' : 
                                      'bg-light'
                                    }`}>
                                      <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                          <i className={`fas ${option === 'true' ? 'fa-check' : 'fa-times'} fs-4 me-3 ${
                                            isCorrect ? 'text-success' : isStudentAnswer ? 'text-danger' : 'text-muted'
                                          }`}></i>
                                          <span className="fw-bold text-capitalize">{option}</span>
                                        </div>
                                        {isCorrect && (
                                          <i className="fas fa-check-circle text-success"></i>
                                        )}
                                        {isStudentAnswer && !isCorrect && (
                                          <i className="fas fa-times-circle text-danger"></i>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {question.model_answer.answer_content && (
                              <div className="bg-light-info rounded p-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-lightbulb text-info me-2 mt-1"></i>
                                  <div className="flex-grow-1">
                                    <strong className="text-info">Explanation:</strong>
                                    <div 
                                      className="mt-2"
                                      dangerouslySetInnerHTML={{ 
                                        __html: renderHtmlSafely(question.model_answer.answer_content, {
                                          maxImageWidth: 600,
                                          maxImageHeight: 400
                                        })
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Long Questions */}
                        {question.question_type === 'lq' && (
                          <div>
                            {question.student_answer?.your_answer ? (
                              <div className="mb-3">
                                <strong className="text-muted">Student Answer:</strong>
                                <div 
                                  className="border rounded p-3 bg-light mt-2"
                                  dangerouslySetInnerHTML={{ 
                                    __html: renderHtmlSafely(question.student_answer.your_answer, {
                                      maxImageWidth: 600,
                                      maxImageHeight: 400
                                    })
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="alert alert-warning">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                No answer provided
                              </div>
                            )}

                            {question.model_answer?.answer_content && (
                              <div className="mb-3">
                                <strong className="text-muted">Model Answer:</strong>
                                <div 
                                  className="border rounded p-3 bg-light-success mt-2"
                                  dangerouslySetInnerHTML={{ 
                                    __html: renderHtmlSafely(question.model_answer.answer_content, {
                                      maxImageWidth: 600,
                                      maxImageHeight: 400
                                    })
                                  }}
                                />
                              </div>
                            )}

                            {question.model_answer?.rubric_content && (
                              <div className="alert alert-info">
                                <strong><i className="fas fa-list-check me-2"></i>Rubric:</strong>
                                <div 
                                  className="mt-2"
                                  dangerouslySetInnerHTML={{ 
                                    __html: renderHtmlSafely(question.model_answer.rubric_content, {
                                      maxImageWidth: 600,
                                      maxImageHeight: 400
                                    })
                                  }}
                                />
                              </div>
                            )}

                            {question.student_answer?.is_graded && question.student_answer?.graded_at && (
                              <div className="alert alert-success">
                                <i className="fas fa-check-circle me-2"></i>
                                Graded on {formatApiTimestamp(question.student_answer.graded_at, { format: 'custom' })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Matching Questions */}
                        {question.question_type === 'matching' && question.model_answer && (
                          <div>
                            <div className="row">
                              <div className="col-md-6">
                                <h6 className="text-muted mb-3">Left Items</h6>
                                {question.model_answer.left_items?.map((item: string, idx: number) => (
                                  <div key={idx} className="border rounded p-2 bg-light mb-2">
                                    <span className="badge badge-secondary me-2">{idx + 1}</span>
                                    {item}
                                  </div>
                                ))}
                              </div>
                              <div className="col-md-6">
                                <h6 className="text-muted mb-3">Right Items</h6>
                                {question.model_answer.right_items?.map((item: string, idx: number) => (
                                  <div key={idx} className="border rounded p-2 bg-light mb-2">
                                    <span className="badge badge-secondary me-2">{String.fromCharCode(65 + idx)}</span>
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="d-flex justify-content-between mb-2">
                                <strong className="text-success">Correct Pairs:</strong>
                                <div>
                                  {question.model_answer.correct_pairs?.map((pairIdx: number, idx: number) => (
                                    <span key={idx} className="badge badge-success me-1">
                                      {idx + 1} → {String.fromCharCode(65 + pairIdx)}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {question.student_answer?.your_answer && (
                                <div className="d-flex justify-content-between">
                                  <strong className={question.student_answer.is_correct ? 'text-success' : 'text-danger'}>
                                    Student Pairs:
                                  </strong>
                                  <div>
                                    {question.student_answer.your_answer.map((pairIdx: number, idx: number) => (
                                      <span key={idx} className={`badge me-1 ${
                                        pairIdx === question.model_answer.correct_pairs[idx] 
                                          ? 'badge-success' 
                                          : 'badge-danger'
                                      }`}>
                                        {idx + 1} → {String.fromCharCode(65 + pairIdx)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {question.model_answer.answer_content && (
                              <div className="bg-light-info rounded p-3 mt-3">
                                <div className="d-flex align-items-start">
                                  <i className="fas fa-lightbulb text-info me-2 mt-1"></i>
                                  <div className="flex-grow-1">
                                    <strong className="text-info">Explanation:</strong>
                                    <div 
                                      className="mt-2"
                                      dangerouslySetInnerHTML={{ 
                                        __html: renderHtmlSafely(question.model_answer.answer_content, {
                                          maxImageWidth: 600,
                                          maxImageHeight: 400
                                        })
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Score and Feedback Section */}
                        <div className="mt-4 pt-3 border-top">
                          <div className="row">
                            <div className="col-md-6">
                              {question.student_answer && (
                                <div className="d-flex align-items-center">
                                  <strong className="me-3">Score:</strong>
                                  <span className={`badge fs-6 ${
                                    (question.student_answer.score || 0) >= (question.student_answer.max_score || 0) * 0.8
                                      ? 'badge-success'
                                      : (question.student_answer.score || 0) >= (question.student_answer.max_score || 0) * 0.5
                                      ? 'badge-warning'
                                      : 'badge-danger'
                                  }`}>
                                    {question.student_answer.score || 0} / {question.student_answer.max_score || 0}
                                  </span>
                                  {question.student_answer.is_correct !== undefined && question.student_answer.is_correct !== null && (
                                    <span className="ms-3">
                                      {question.student_answer.is_correct ? (
                                        <i className="fas fa-check-circle text-success fs-4"></i>
                                      ) : (
                                        <i className="fas fa-times-circle text-danger fs-4"></i>
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="col-md-6">
                              {question.student_answer?.feedback && question.student_answer.feedback !== "No scoring tags available" && (
                                <div>
                                  <strong className="text-muted">Feedback:</strong>
                                  <div className="text-muted mt-1">{question.student_answer.feedback}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-question-circle fs-3x text-muted mb-3"></i>
                    <p className="text-muted">No questions available</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-exclamation-triangle fs-2x text-warning mb-3"></i>
              <p className="text-muted">No student result available</p>
            </div>
          )}

          {/* Student Navigation */}
          {stats && stats.students && stats.students.items && stats.students.items.length > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4 pt-3 border-top">
              <button
                className="btn btn-light me-3"
                onClick={() => navigateToStudent('prev')}
                title="Previous Student"
              >
                <i className="fas fa-chevron-left me-2"></i>
                Previous
              </button>
              
              <div className="d-flex align-items-center mx-3">
                <select
                  className="form-select form-select-sm me-2"
                  style={{ width: 'auto' }}
                  value={currentStudentIndex}
                  onChange={(e) => {
                    const selectedIndex = parseInt(e.target.value)
                    if (selectedIndex !== currentStudentIndex) {
                      const student = stats.students.items[selectedIndex]
                      fetchStudentResult(student.assignment_id, student.student_id, selectedIndex)
                    }
                  }}
                >
                  {stats.students.items.map((student, index) => (
                    <option key={student.student_id} value={index}>
                      {student.student_name}
                    </option>
                  ))}
                </select>
                <span className="text-muted">of {stats.students.items.length}</span>
              </div>

              <button
                className="btn btn-light ms-3"
                onClick={() => navigateToStudent('next')}
                title="Next Student"
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
