import {FC, useState, useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useParams, useNavigate} from 'react-router-dom'
import {PageTitle} from '../../../../_metronic/layout/core'
import {AppDispatch, RootState} from '../../../../store'
import {fetchExerciseProgress, fetchExerciseWithQuestions} from '../../../../store/exercises/exercisesSlice'
import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, getStatusIcon} from '../../../constants/assignmentStatus'
import {KTCard, KTCardBody} from '../../../../_metronic/helpers'
import {toast} from '../../../../_metronic/helpers/toast'
import {hasImages, renderHtmlSafely, getTextPreview} from '../../../../_metronic/helpers/htmlRenderer'
import './ExerciseProgressPage.scss'
import QuestionsView from './QuestionsView';
import StudentsView from './StudentsView';
import GridView from './GridView';

// Mock data for demonstration
// Question types: 1, 3, 4 are MC (Multiple Choice), 2, 5, 6 are LQ (Long Question)

interface StudentProgress {
  user_id: string
  name: string
  email: string
  assignment_id: string
  status: number
  started_at?: string
  submitted_at?: string
  graded_at?: string
  score?: number
  total_questions: number
  completed_questions: number
  question_progress: Array<{
    question_id: string
    question_name: string
    question_type: 'mc' | 'lq'
    status: number
    score?: number
    answered_at?: string
    student_answer?: string
    student_option?: string
    correct_answer?: string
  }>
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

  const {
    exerciseProgress: apiExerciseProgress,
    fetchingExerciseProgress,
    exerciseProgressTotal: apiExerciseProgressTotal,
    currentExercise,
    linkedQuestions,
    fetchingExercise
  } = useSelector((state: RootState) => state.exercises)

  // Get all questions from the exercise
  const getAllQuestions = () => {
    const baseQuestions = [
      {
        question_id: 'q1',
        question_name: 'What is the capital of France?',
        question_type: 'mc' as const,
        correct_answer: 'Paris',
        correct_option: 'A',
        options: [
          { letter: 'A', text: 'Paris' },
          { letter: 'B', text: 'London' },
          { letter: 'C', text: 'Berlin' },
          { letter: 'D', text: 'Madrid' }
        ],
        tags: [
          { name: 'Geography', maxScore: 2 },
          { name: 'Europe', maxScore: 1 }
        ]
      },
      {
        question_id: 'q2',
        question_name: 'Explain the process of photosynthesis.',
        question_type: 'lq' as const,
        correct_answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water.',
        tags: [
          { name: 'Biology', maxScore: 2 },
          { name: 'Process', maxScore: 1 }
        ]
      },
      {
        question_id: 'q3',
        question_name: 'Which planet is closest to the Sun?',
        question_type: 'mc' as const,
        correct_answer: 'Mercury',
        correct_option: 'B',
        options: [
          { letter: 'A', text: 'Venus' },
          { letter: 'B', text: 'Mercury' },
          { letter: 'C', text: 'Earth' },
          { letter: 'D', text: 'Mars' }
        ],
        tags: [
          { name: 'Astronomy', maxScore: 2 },
          { name: 'Planets', maxScore: 1 }
        ]
      },
      {
        question_id: 'q4',
        question_name: '<img src="https://app.myplp.io/landclc_chem/spacex/lqquestionimg/96ea64f3a1aa2fd00c72faacf0cb8ac9/7ec3446769907603a5d6e0074eb7d059.png">',
        question_type: 'mc' as const,
        correct_answer: 'H2O',
        correct_option: 'C',
        options: [
          { letter: 'A', text: 'CO2' },
          { letter: 'B', text: 'O2' },
          { letter: 'C', text: 'H2O' },
          { letter: 'D', text: 'N2' }
        ],
        tags: [
          { name: 'Chemistry', maxScore: 2 },
          { name: 'Formula', maxScore: 1 }
        ]
      },
      {
        question_id: 'q5',
        question_name: 'Describe the main differences between mitosis and meiosis.',
        question_type: 'lq' as const,
        correct_answer: 'Mitosis produces two diploid daughter cells identical to the parent, while meiosis produces four haploid daughter cells with genetic variation through crossing over and independent assortment.',
        tags: [
          { name: 'Biology', maxScore: 2 },
          { name: 'Cell Division', maxScore: 1 }
        ]
      },
      {
        question_id: 'q6',
        question_name: 'What are the three branches of government in the United States?',
        question_type: 'lq' as const,
        correct_answer: 'The three branches are Executive (President), Legislative (Congress), and Judicial (Supreme Court and federal courts).',
        tags: [
          { name: 'Civics', maxScore: 2 },
          { name: 'Government', maxScore: 1 }
        ]
      }
    ];
    const questions: any[] = [...baseQuestions];
    for (let i = 7; i <= 50; ++i) {
      if (i % 2 === 1) {
        // MC
        questions.push({
          question_id: `q${i}`,
          question_name: `Auto MC Question ${i}: What is option ${String.fromCharCode(65 + (i % 4))}?`,
          question_type: 'mc',
          correct_answer: `Option ${String.fromCharCode(65 + (i % 4))}`,
          correct_option: String.fromCharCode(65 + (i % 4)),
          options: [
            { letter: 'A', text: `Option A` },
            { letter: 'B', text: `Option B` },
            { letter: 'C', text: `Option C` },
            { letter: 'D', text: `Option D` }
          ],
          tags: [
            { name: i % 3 === 0 ? 'Math' : 'Science', maxScore: 2 },
            { name: i % 5 === 0 ? 'Logic' : 'General', maxScore: 1 }
          ]
        });
      } else {
        // LQ
        questions.push({
          question_id: `q${i}`,
          question_name: `Auto LQ Question ${i}: Explain concept ${i}.`,
          question_type: 'lq',
          correct_answer: `This is the correct answer for LQ ${i}.`,
          tags: [
            { name: i % 3 === 0 ? 'Essay' : 'Theory', maxScore: 2 },
            { name: i % 5 === 0 ? 'Critical Thinking' : 'General', maxScore: 1 }
          ]
        });
      }
    }
    return questions;
  }
  const allQuestions = getAllQuestions();
  
  // Mock data for demonstration
  const getMockProgressData = (): StudentProgress[] => {
    const questions = allQuestions;
    const students = [
      { id: '1', name: 'John Smith', email: 'john.smith@example.com', status: ASSIGNMENT_STATUS.GRADED },
      { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', status: ASSIGNMENT_STATUS.SUBMITTED },
      { id: '3', name: 'Michael Brown', email: 'michael.brown@example.com', status: ASSIGNMENT_STATUS.IN_PROGRESS },
      { id: '4', name: 'Emily Davis', email: 'emily.davis@example.com', status: ASSIGNMENT_STATUS.ASSIGNED },
      { id: '5', name: 'David Wilson', email: 'david.wilson@example.com', status: ASSIGNMENT_STATUS.OVERDUE }
    ];
    return students.map((student: any, sIdx: number) => {
      const question_progress = questions.map((q: any, qIdx: number) => {
        // Use original mock for first 6 questions for first 3 students
        if (qIdx < 6 && sIdx < 3) {
          if (q.question_type === 'mc') {
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'mc' as 'mc',
              status: ASSIGNMENT_STATUS.GRADED,
              score: 100,
              answered_at: `2024-01-15T09:3${qIdx}:00Z`,
              student_answer: q.correct_answer,
              student_option: q.correct_option,
              correct_answer: q.correct_answer
            };
          } else {
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'lq' as 'lq',
              status: ASSIGNMENT_STATUS.GRADED,
              score: 90,
              answered_at: `2024-01-15T10:3${qIdx}:00Z`,
              student_answer: `Sample answer for ${q.question_name}`,
              correct_answer: q.correct_answer
            };
          }
        }
        // For the rest, alternate correct/incorrect/unanswered
        if (q.question_type === 'mc') {
          if ((sIdx + qIdx) % 3 === 0) {
            // Correct
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'mc' as 'mc',
              status: ASSIGNMENT_STATUS.GRADED,
              score: 100,
              answered_at: `2024-01-15T11:${qIdx}:00Z`,
              student_answer: q.correct_answer,
              student_option: q.correct_option,
              correct_answer: q.correct_answer
            };
          } else if ((sIdx + qIdx) % 3 === 1) {
            // Incorrect
            const wrongOption = ['A', 'B', 'C', 'D'].find(opt => opt !== q.correct_option) || 'A';
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'mc' as 'mc',
              status: ASSIGNMENT_STATUS.GRADED,
              score: 0,
              answered_at: `2024-01-15T11:${qIdx}:00Z`,
              student_answer: q.options?.find((o: any) => o.letter === wrongOption)?.text,
              student_option: wrongOption,
              correct_answer: q.correct_answer
            };
          } else {
            // Unanswered
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'mc' as 'mc',
              status: ASSIGNMENT_STATUS.ASSIGNED
            };
          }
        } else {
          // LQ
          if ((sIdx + qIdx) % 3 === 0) {
            // Graded
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'lq' as 'lq',
              status: ASSIGNMENT_STATUS.GRADED,
              score: 90,
              answered_at: `2024-01-15T12:${qIdx}:00Z`,
              student_answer: `Sample answer for ${q.question_name}`,
              correct_answer: q.correct_answer
            };
          } else if ((sIdx + qIdx) % 3 === 1) {
            // Submitted
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'lq' as 'lq',
              status: ASSIGNMENT_STATUS.SUBMITTED,
              answered_at: `2024-01-15T12:${qIdx}:00Z`,
              student_answer: `Sample answer for ${q.question_name}`,
              correct_answer: q.correct_answer
            };
          } else {
            // Not started
            return {
              question_id: q.question_id,
              question_name: q.question_name,
              question_type: 'lq' as 'lq',
              status: ASSIGNMENT_STATUS.ASSIGNED
            };
          }
        }
      });
      return {
        user_id: student.id,
        name: student.name,
        email: student.email,
        assignment_id: `assign_${student.id}`,
        status: student.status,
        started_at: '2024-01-15T09:30:00Z',
        submitted_at: '2024-01-15T11:45:00Z',
        graded_at: '2024-01-15T14:20:00Z',
        score: 85,
        total_questions: 50,
        completed_questions: question_progress.filter((q: any) => q.status !== ASSIGNMENT_STATUS.ASSIGNED).length,
        question_progress
      };
    });
  };
  
  const exerciseProgress = getMockProgressData();
  const exerciseProgressTotal = exerciseProgress.length;

  // Filter students by search term
  const filteredExerciseProgress = exerciseProgress.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get student answers for a specific question
  const getStudentAnswersForQuestion = (questionId: string) => {
    return filteredExerciseProgress.map(student => {
      const questionProgress = student.question_progress.find(q => q.question_id === questionId)
      return {
        student_id: student.user_id,
        student_name: student.name,
        student_email: student.email,
        status: questionProgress?.status || ASSIGNMENT_STATUS.ASSIGNED,
        score: questionProgress?.score,
        student_answer: questionProgress?.student_answer,
        student_option: questionProgress?.student_option, // <-- add this line
        answered_at: questionProgress?.answered_at,
        overall_status: student.status
      }
    }).filter(answer => answer.status !== ASSIGNMENT_STATUS.ASSIGNED) // Only show answered questions
  }

  // Fetch exercise details and progress data
  useEffect(() => {
    if (exerciseId) {
      dispatch(fetchExerciseWithQuestions(exerciseId))
      fetchProgressData()
    }
  }, [exerciseId, dispatch])

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

  // Refetch when pagination or filters change
  useEffect(() => {
    fetchProgressData()
  }, [currentPage, itemsPerPage, searchTerm, sortBy, sortOrder])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
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
    if (student.total_questions === 0) return 0
    return Math.round((student.completed_questions / student.total_questions) * 100)
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
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(exerciseProgressTotal / itemsPerPage)

  if (fetchingExercise) {
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
        {title: currentExercise?.title || 'Exercise Progress', path: '', isSeparator: false, isActive: true}
      ]}>
        Exercise Progress: {currentExercise?.title}
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
              
              {currentExercise && (
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
              allQuestions={allQuestions}
              getStudentAnswersForQuestion={getStudentAnswersForQuestion}
              getQuestionTypeBadge={getQuestionTypeBadge}
              getQuestionStatusBadge={getQuestionStatusBadge}
              formatDate={formatDate}
              exerciseProgress={filteredExerciseProgress}
            />
          ) : viewMode === 'grid' ? (
            <GridView
              allQuestions={allQuestions}
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
                       .find((s: StudentProgress) => s.user_id === selectedStudent)
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