import {FC, useState, useEffect, useMemo, useRef, useCallback, memo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {AppDispatch, RootState} from '../../../../store'
import {fetchAssignedExercises, setPage, setFilters, setLoadingFilters, clearCache} from '../../../../store/exercises/assignedExercisesSlice'
import AssignedExercisesFilters from './components/AssignedExercisesFilters'
import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, AssignmentStatus} from '../../../constants/assignmentStatus'
import {useNavigate} from 'react-router-dom'
import './ExerciseAssignedListPage.scss'

// Completely isolated filters component that doesn't re-render with parent
const IsolatedFilters = memo(() => {
  return <AssignedExercisesFilters />
})

// Custom tooltip component
const Tooltip: FC<{message: string, children: React.ReactNode}> = ({message, children}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className='position-relative d-inline-block'>
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div 
          className='position-absolute bg-dark text-white p-2 rounded fs-7'
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            maxWidth: '200px',
            wordWrap: 'break-word'
          }}
        >
          {message}
          <div 
            className='position-absolute'
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '4px solid transparent',
              borderTopColor: '#212529'
            }}
          ></div>
        </div>
      )}
    </div>
  )
}

const ExerciseAssignedListPage: FC = () => {
  const intl = useIntl()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { 
    exercises, 
    summary, 
    pagination, 
    loading, 
    loadingFilters,
    error, 
    filters,
    lastFetchTime 
  } = useSelector((state: RootState) => state.assignedExercises)
  
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set(exercises.map(exercise => exercise.id)))
  const [showFilters, setShowFilters] = useState(false)
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const filtersRef = useRef(filters)

  // Keep filters ref updated
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Get progress bar color based on percentage
  const getProgressBarColor = (progress: number) => {
    if (progress === 0) return 'secondary'
    if (progress >= 50) return 'success'
    if (progress >= 30) return 'warning'
    return 'secondary'
  }

  // Rename local status helpers for exercises
  const getExerciseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'not_started': return 'warning'
      case 'overdue': return 'danger'
      default: return 'secondary'
    }
  }

  const getExerciseStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'fas fa-check-circle'
      case 'in_progress': return 'fas fa-clock'
      case 'not_started': return 'fas fa-hourglass-start'
      case 'overdue': return 'fas fa-exclamation-triangle'
      default: return 'fas fa-circle'
    }
  }

  const toggleCardCollapse = useCallback((exerciseId: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId)
      } else {
        newSet.add(exerciseId)
      }
      return newSet
    })
  }, [])

  const handleExerciseClick = useCallback((exerciseId: string) => {
    navigate(`/exercises/edit/${exerciseId}`)
  }, [navigate])

  const handleStatusFilter = useCallback((status: string) => {
    // Set loading state for filters
    dispatch(setLoadingFilters(true))
    
    // Clear cache to force fresh API call
    dispatch(clearCache())
    
    // Update filters with status (status is already the correct ASSIGNMENT_STATUS value)
    dispatch(setFilters({ ...filtersRef.current, status }))
  }, [dispatch])

  // Optimized debounced fetch function
  const debouncedFetch = useCallback((filtersToUse: any) => {
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }
    
    // Set loading state for filters
    dispatch(setLoadingFilters(true))
    
    apiTimeoutRef.current = setTimeout(() => {
      dispatch(fetchAssignedExercises(filtersToUse))
    }, 300) // 300ms delay
  }, [dispatch])

  // Watch for filter changes and debounce API calls
  useEffect(() => {
    // Clear any existing timeout
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }
    
    // Set new timeout for API call
    apiTimeoutRef.current = setTimeout(() => {
      dispatch(fetchAssignedExercises(filters))
    }, 300)
    
    // Cleanup function
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current)
      }
    }
  }, [dispatch, filters])

  // Initial load
  useEffect(() => {
    dispatch(fetchAssignedExercises(filters))
    setIsInitialLoad(false)
  }, [dispatch]) // Only run on mount

  // Update collapsed cards when exercises are loaded
  useEffect(() => {
    if (exercises.length > 0) {
      setCollapsedCards(new Set(exercises.map(exercise => exercise.id)))
    }
  }, [exercises])

  // Memoized exercise cards to prevent unnecessary re-renders
  const exerciseCards = useMemo(() => {
    return exercises.map((exercise) => {
      // Group assignments by due date
      const assignmentsByDueDate = exercise.assignments.reduce((groups, assignment) => {
        let dueDateKey = 'No Due Date'
        if (assignment.due_date) {
          const dueDate = new Date(assignment.due_date)
          if (!isNaN(dueDate.getTime())) {
            dueDateKey = dueDate.toLocaleDateString()
          }
        }
        
        if (!groups[dueDateKey]) {
          groups[dueDateKey] = []
        }
        groups[dueDateKey].push(assignment)
        return groups
      }, {} as Record<string, typeof exercise.assignments>)

      return (
        <div key={exercise.id} className='col-lg-4 col-md-6 col-sm-12'>
          <div className='card h-100 shadow-sm border-0'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <div className='d-flex align-items-center'>
                  <div>
                    <h5 
                      className='mb-1 cursor-pointer text-hover-primary exercise-title-ellipsis'
                      onClick={() => navigate(`/exercises/progress/${exercise.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {exercise.title}
                    </h5>
                    <span className='badge badge-light-primary fs-7'>{exercise.question_no} Question{exercise.question_no !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className='card-body pt-0'>
              <div className='mb-4'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <span className='text-muted fs-7'>Progress</span>
                  <span className='fw-bold fs-6'>{exercise.progress}%</span>
                </div>
                <div className='progress h-8px'>
                  <div 
                    className={`progress-bar bg-${getProgressBarColor(exercise.progress)}`}
                    style={{width: `${exercise.progress}%`}}
                  ></div>
                </div>
              </div>
              
              <div className='row g-3 mb-4'>
                <div className='col-6'>
                  <div className='d-flex align-items-center'>
                    <i className='fas fa-user-graduate text-muted me-2'></i>
                    <div>
                      <div className='text-muted fs-7'>Students</div>
                      <div className='fw-bold'>{exercise.student_stats.total}</div>
                    </div>
                  </div>
                </div>
                <div className='col-6'>
                  <div className='d-flex align-items-center'>
                    <div>
                      <div className='text-muted fs-7'>Completed</div>
                      <div className='fw-bold'>{exercise.student_stats.completed}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assignments grouped by due date */}
              <div className='mb-4 border rounded p-3'>
                <div 
                  className='d-flex align-items-center justify-content-between cursor-pointer'
                  onClick={() => toggleCardCollapse(exercise.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <h6 className='fw-bold mb-0'>Assignments by Due Date</h6>
                  <i className={`fas fa-chevron-${collapsedCards.has(exercise.id) ? 'down' : 'up'} text-muted`}></i>
                </div>
                
                {!collapsedCards.has(exercise.id) && (
                  <div className='mt-3'>
                    {Object.entries(assignmentsByDueDate).map(([dueDate, assignments]) => {
                      return (
                        <div key={dueDate} className='mb-3'>
                          <div className='d-flex align-items-center mb-2'>
                            <i className='fas fa-calendar text-primary me-2'></i>
                            <span className='fw-bold fs-7 text-primary'>
                              {dueDate === 'No Due Date' ? 'No Due Date' : `Due: ${dueDate}`}
                            </span>
                          </div>
                          <div className='ms-4'>
                            {assignments.map((assignment) => (
                              <div key={assignment.assignment_id} className='d-flex flex-column mb-2 p-2 bg-light rounded'>
                                <div className='d-flex align-items-center justify-content-between mb-1'>
                                  <div className='d-flex align-items-center'>
                                    <i className='fas fa-user text-muted me-2'></i>
                                    <span className='fs-7 fw-medium'>{assignment.student.name}</span>
                                  </div>
                                  <div className='d-flex align-items-center'>
                                    <span className={`badge badge-light-${getStatusColor(parseInt(assignment.status, 10) as AssignmentStatus)} fs-7 me-2`}>
                                      {getStatusLabel(parseInt(assignment.status, 10) as AssignmentStatus)}
                                    </span>
                                    {assignment.message_for_student && (
                                      <i 
                                        className='fas fa-comment text-muted cursor-pointer' 
                                        title={assignment.message_for_student}
                                        style={{ cursor: 'pointer' }}
                                      ></i>
                                    )}
                                  </div>
                                </div>
                                <div className='d-flex align-items-center justify-content-between'>
                                  <div className='progress-container flex-grow-1 me-2'>
                                    <div className='progress' style={{ height: '6px' }}>
                                      <div 
                                        className={`progress-bar bg-${getStatusColor(parseInt(assignment.status, 10) as AssignmentStatus)}`}
                                        style={{ width: `${assignment.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className='fs-7 text-muted'>
                                    {assignment.answered_questions}/{assignment.total_questions} questions
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              <div className='d-flex align-items-center justify-content-end'>
                <button className='btn btn-sm btn-light-primary' onClick={() => navigate(`/exercises/progress/${exercise.id}`)}>
                  <i className='fas fa-eye me-1'></i>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    })
  }, [exercises, collapsedCards, toggleCardCollapse, handleExerciseClick])

  // Memoized exercise list rows for list view
  const exerciseListRows = useMemo(() => {
    return (
      <div className='exercise-list'>
        {exercises.map((exercise) => {
          // Group assignments by due date (same logic as card view)
          const assignmentsByDueDate = exercise.assignments.reduce((groups, assignment) => {
            let dueDateKey = 'No Due Date'
            if (assignment.due_date) {
              const dueDate = new Date(assignment.due_date)
              if (!isNaN(dueDate.getTime())) {
                dueDateKey = dueDate.toLocaleDateString()
              }
            }
            
            if (!groups[dueDateKey]) {
              groups[dueDateKey] = []
            }
            groups[dueDateKey].push(assignment)
            return groups
          }, {} as Record<string, typeof exercise.assignments>)

          return (
            <div key={exercise.id} className={`exercise-list-item status-${exercise.status}`}>
              <div className='list-item-header' onClick={() => toggleCardCollapse(exercise.id)} style={{cursor: 'pointer', flex: 1}}>
                <div className='item-content'>
                  <div className='item-title'>
                    <div className='d-flex align-items-center'>
                      <div>
                        <h6 
                          className='mb-1 cursor-pointer text-hover-primary exercise-title-ellipsis'
                          onClick={e => { e.stopPropagation(); navigate(`/exercises/progress/${exercise.id}`); }}
                          style={{ cursor: 'pointer' }}
                        >
                          {exercise.title}
                        </h6>
                        <span className='badge badge-light-primary fs-7'>{exercise.question_no} Question{exercise.question_no !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className='item-progress'>
                    <div className='progress-info'>
                      <span className='progress-text'>{exercise.progress}% Complete</span>
                      <div className='mini-progress'>
                        <div 
                          className={`progress-fill bg-${getProgressBarColor(exercise.progress)}`}
                          style={{width: `${exercise.progress}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className='item-stats'>
                  <div className='stat-item'>
                    <div className='stat-number'>{exercise.student_stats.total}</div>
                    <div className='stat-label'>Students</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number text-success'>{exercise.student_stats.completed}</div>
                    <div className='stat-label'>Completed</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number text-warning'>{exercise.student_stats.in_progress}</div>
                    <div className='stat-label'>
                      {exercise.student_stats.total > 0 && exercise.student_stats.in_progress > 0
                        ? 'In Progress'
                        : exercise.student_stats.total > 0 && exercise.student_stats.completed === 0 && exercise.student_stats.in_progress === 0
                          ? 'In Progress'
                          : exercise.student_stats.total > 0 && exercise.student_stats.completed > 0
                            ? `${Math.round((exercise.student_stats.in_progress / exercise.student_stats.total) * 100)}%`
                            : '0%'}
                    </div>
                  </div>
                </div>
                
                <div className='item-actions'>
                  <button 
                    className='btn btn-sm btn-light-primary'
                    onClick={e => { e.stopPropagation(); navigate(`/exercises/progress/${exercise.id}`); }}
                  >
                    <i className='fas fa-eye me-1'></i>
                    View Details
                  </button>
                </div>
              </div>
              
              {/* Assignments Section */}
              {!collapsedCards.has(exercise.id) && (
                <div className='list-item-assignments'>
                  <div className='assignments-header'>
                    <h6 className='mb-0'>Assignments by Due Date</h6>
                  </div>
                  <div className='assignments-content'>
                    {Object.entries(assignmentsByDueDate).map(([dueDate, assignments]) => (
                      <div key={dueDate} className='assignment-group'>
                        <div className='due-date-header'>
                          <i className='fas fa-calendar text-primary me-2'></i>
                          <span className='fw-bold fs-7 text-primary'>
                            {dueDate === 'No Due Date' ? 'No Due Date' : `Due: ${dueDate}`}
                          </span>
                        </div>
                        <div className='assignments-list'>
                          {assignments.map((assignment) => (
                            <div key={assignment.assignment_id} className='assignment-item'>
                              <div className='d-flex align-items-center' style={{gap: 16, minHeight: 40}}>
                                {/* Student Name */}
                                <div style={{minWidth: 180, flex: '0 0 180px'}} className='d-flex align-items-center'>
                                  <i className='fas fa-user text-muted me-2'></i>
                                  <span className='fw-medium'>{assignment.student.name}</span>
                                </div>
                                {/* Progress */}
                                <div style={{minWidth: 160, flex: '1 1 160px'}} className='d-flex flex-column align-items-start'>
                                  <div className='d-flex align-items-center mb-1'>
                                    <span className='fw-bold fs-7 me-2'>{assignment.progress}%</span>
                                    <div className='progress h-3px' style={{width: 80}}>
                                      <div 
                                        className={`progress-bar bg-${getStatusColor(parseInt(assignment.status, 10) as AssignmentStatus)}`}
                                        style={{width: `${assignment.progress}%`}}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className='fw-bold fs-7'>{assignment.answered_questions}/{assignment.total_questions} Questions</span>
                                </div>
                                {/* Status Label */}
                                <div style={{minWidth: 100, flex: '0 0 100px'}} className='d-flex align-items-center'>
                                  <span className={`badge badge-light-${getStatusColor(parseInt(assignment.status, 10) as AssignmentStatus)}`}>
                                    {getStatusLabel(parseInt(assignment.status, 10) as AssignmentStatus)}
                                  </span>
                                  {assignment.message_for_student && (
                                    <Tooltip message={assignment.message_for_student}>
                                      <i className='fas fa-comment text-muted ms-2'></i>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }, [exercises, collapsedCards, toggleCardCollapse, handleExerciseClick])

  // Show full-page loading only for initial load or errors
  if (isInitialLoad && loading) {
    return (
      <>
        <PageTitle breadcrumbs={[
          { title: 'Home', path: '/dashboard', isSeparator: false, isActive: false },
          { title: 'Assigned Exercises', path: '', isSeparator: false, isActive: true }
        ]}>
          Assigned Exercises
        </PageTitle>
        <div className='card'>
          <div className='card-body text-center py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <div className='mt-3'>Loading assigned exercises...</div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle breadcrumbs={[
          { title: 'Home', path: '/dashboard', isSeparator: false, isActive: false },
          { title: 'Assigned Exercises', path: '', isSeparator: false, isActive: true }
        ]}>
          Assigned Exercises
        </PageTitle>
        <div className='card'>
          <div className='card-body text-center py-10'>
            <i className='fas fa-exclamation-triangle fs-3x text-danger mb-4'></i>
            <h4 className='text-danger mb-2'>Error Loading Exercises</h4>
            <p className='text-muted'>{error}</p>
            <button 
              className='btn btn-primary'
              onClick={() => dispatch(fetchAssignedExercises(filters))}
            >
              <i className='fas fa-redo me-1'></i>
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Home', path: '/dashboard', isSeparator: false, isActive: false },
        { title: 'Assigned Exercises', path: '', isSeparator: false, isActive: true }
      ]}>
        Assigned Exercises
      </PageTitle>
      
      {/* Welcome Section */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>Welcome to Your Assigned Exercises Hub! 📚</h2>
            <p className='welcome-subtitle'>Track student progress, manage assignments, and monitor completion rates</p>
          </div>
          <div className='welcome-actions'>
            <button 
              className='btn btn-light-primary me-3 btn-sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className='fas fa-filter me-1'></i>
              {showFilters ? 'Hide Filters' : 'Filter'}
            </button>
            <div className='view-toggle'>
              <button 
                className={`btn btn-sm ${selectedView === 'grid' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setSelectedView('grid')}
              >
                <i className='fas fa-th-large'></i>
              </button>
              <button 
                className={`btn btn-sm ${selectedView === 'list' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setSelectedView('list')}
              >
                <i className='fas fa-list'></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && <IsolatedFilters />}

      {/* Stats Cards */}
      <div className='progress-overview'>
        <div className='status-cards-grid'>
          <div>
            <div 
              className={`progress-card total ${!filters.status ? 'active' : ''}`}
              onClick={() => handleStatusFilter('')}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center'>
                <div className='card-icon me-3'>
                  <i className='fas fa-book-open text-white fs-2'></i>
                </div>
                <div className='card-content'>
                  <div className='card-number'>{summary.total}</div>
                  <div className='card-label'>Total</div>
                </div>
              </div>
              {!filters.status && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>
          <div>
            <div 
              className={`progress-card completed ${filters.status === ASSIGNMENT_STATUS.SUBMITTED.toString() ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.SUBMITTED.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center'>
                <div className='card-icon me-3'>
                  <i className='fas fa-check-circle text-white fs-2'></i>
                </div>
                <div className='card-content'>
                  <div className='card-number'>{summary.completed}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.SUBMITTED)}</div>
                </div>
              </div>
              {filters.status === ASSIGNMENT_STATUS.SUBMITTED.toString() && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>
          <div>
            <div 
              className={`progress-card in-progress ${filters.status === ASSIGNMENT_STATUS.IN_PROGRESS.toString() ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.IN_PROGRESS.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center'>
                <div className='card-icon me-3'>
                  <i className='fas fa-clock text-white fs-2'></i>
                </div>
                <div className='card-content'>
                  <div className='card-number'>{summary.in_progress}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.IN_PROGRESS)}</div>
                </div>
              </div>
              {filters.status === ASSIGNMENT_STATUS.IN_PROGRESS.toString() && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>
          <div>
            <div 
              className={`progress-card overdue ${filters.status === ASSIGNMENT_STATUS.OVERDUE.toString() ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.OVERDUE.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center'>
                <div className='card-icon me-3'>
                  <i className='fas fa-exclamation-triangle text-white fs-2'></i>
                </div>
                <div className='card-content'>
                  <div className='card-number'>{summary.overdue}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.OVERDUE)}</div>
                </div>
              </div>
              {filters.status === ASSIGNMENT_STATUS.OVERDUE.toString() && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>
          <div>
            <div 
              className={`progress-card not-started ${filters.status === ASSIGNMENT_STATUS.ASSIGNED.toString() ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.ASSIGNED.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center'>
                <div className='card-icon me-3'>
                  <i className='fas fa-hourglass-start text-white fs-2'></i>
                </div>
                <div className='card-content'>
                  <div className='card-number'>{typeof summary.not_started !== 'undefined' ? summary.not_started : summary.total - summary.completed - summary.in_progress - summary.overdue}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.ASSIGNED)}</div>
                </div>
              </div>
              {filters.status === ASSIGNMENT_STATUS.ASSIGNED.toString() && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Cards or List */}
      {selectedView === 'grid' ? (
        <div className='row g-6 position-relative'>
          {loadingFilters && !isInitialLoad && (
            <div className='loading-overlay' style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.7)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className='loading-content'>
                <div className='spinner-border text-primary me-3' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
                <span className='text-muted'>Updating results...</span>
              </div>
            </div>
          )}
          {exerciseCards}
        </div>
      ) : (
        <div className='mt-6 position-relative'>
          {loadingFilters && !isInitialLoad && (
            <div className='loading-overlay' style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.7)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className='loading-content'>
                <div className='spinner-border text-primary me-3' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
                <span className='text-muted'>Updating results...</span>
              </div>
            </div>
          )}
          {exerciseListRows}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className='card mt-8'>
          <div className='card-body'>
            <div className='d-flex justify-content-between align-items-center'>
              <div className='text-muted'>
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
              </div>
              <nav>
                <ul className='pagination'>
                  <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                    <button 
                      className='page-link'
                      onClick={() => {
                        dispatch(setPage(pagination.current_page - 1))
                        dispatch(fetchAssignedExercises(filters))
                      }}
                      disabled={pagination.current_page === 1}
                    >
                      <i className='fas fa-chevron-left'></i>
                    </button>
                  </li>
                  
                  {Array.from({length: Math.min(5, pagination.total_pages)}, (_, i) => {
                    const page = i + 1
                    return (
                      <li key={page} className={`page-item ${page === pagination.current_page ? 'active' : ''}`}>
                        <button 
                          className='page-link'
                          onClick={() => {
                            dispatch(setPage(page))
                            dispatch(fetchAssignedExercises(filters))
                          }}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  })}
                  
                  <li className={`page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}`}>
                    <button 
                      className='page-link'
                      onClick={() => {
                        dispatch(setPage(pagination.current_page + 1))
                        dispatch(fetchAssignedExercises(filters))
                      }}
                      disabled={pagination.current_page === pagination.total_pages}
                    >
                      <i className='fas fa-chevron-right'></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {exercises.length === 0 && !loading && !isInitialLoad && (
        <div className='card mt-8'>
          <div className='card-body text-center py-10'>
            <i className='fas fa-search fs-3x text-muted mb-4'></i>
            <h4 className='text-muted mb-2'>No exercises found</h4>
            <p className='text-muted'>Try adjusting your filters or search terms.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default ExerciseAssignedListPage 