import {FC, useState, useEffect, useMemo, useRef, useCallback, memo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {AppDispatch, RootState} from '../../../../store'
import {fetchAssignedExercises, setPage, setFilters, setLoadingFilters} from '../../../../store/exercises/assignedExercisesSlice'
import AssignedExercisesFilters from './components/AssignedExercisesFilters'

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
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const filtersRef = useRef(filters)

  // Keep filters ref updated
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'not_started': return 'warning'
      case 'overdue': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
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

  const handleStatusFilter = useCallback((status: string) => {
    // Map status to API values
    let statusValue = ''
    switch (status) {
      case 'completed':
        statusValue = '2'
        break
      case 'in_progress':
        statusValue = '1'
        break
      case 'overdue':
        statusValue = '4'
        break
      default:
        statusValue = ''
    }
    
    // Update filters with status
    dispatch(setFilters({ ...filtersRef.current, status: statusValue }))
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
        const dueDate = new Date(assignment.due_date).toLocaleDateString()
        if (!groups[dueDate]) {
          groups[dueDate] = []
        }
        groups[dueDate].push(assignment)
        return groups
      }, {} as Record<string, typeof exercise.assignments>)

      return (
        <div key={exercise.id} className='col-xl-6 col-xxl-4'>
          <div className='card h-100 shadow-sm border-0'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <div className='d-flex align-items-center'>
                  <div className='symbol symbol-40px me-3'>
                    <div className={`symbol-label bg-light-${getStatusColor(exercise.status)}`}>
                      <i className={`${getStatusIcon(exercise.status)} text-${getStatusColor(exercise.status)}`}></i>
                    </div>
                  </div>
                  <div>
                    <h5 className='mb-1'>{exercise.title}</h5>
                    <span className='badge badge-light-primary fs-7'>Question #{exercise.question_no}</span>
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
                    className={`progress-bar bg-${getStatusColor(exercise.status)}`}
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
                    <i className='fas fa-check text-success me-2'></i>
                    <div>
                      <div className='text-muted fs-7'>Completed</div>
                      <div className='fw-bold'>{exercise.student_stats.completed}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assignments grouped by due date */}
              <div className='mb-4'>
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
                      // Skip if dueDate is invalid (null, undefined, or invalid date)
                      if (!dueDate || dueDate === 'Invalid Date' || dueDate === '12/31/1969') {
                        return null
                      }
                      
                      return (
                        <div key={dueDate} className='mb-3'>
                          <div className='d-flex align-items-center mb-2'>
                            <i className='fas fa-calendar text-primary me-2'></i>
                            <span className='fw-bold fs-7 text-primary'>Due: {dueDate}</span>
                          </div>
                          <div className='ms-4'>
                            {assignments.map((assignment) => (
                              <div key={assignment.assignment_id} className='d-flex align-items-center justify-content-between mb-2 p-2 bg-light rounded'>
                                <div className='d-flex align-items-center'>
                                  <i className='fas fa-user text-muted me-2'></i>
                                  <span className='fs-7'>{assignment.student.name}</span>
                                </div>
                                <div className='d-flex align-items-center'>
                                  <span className={`badge badge-sm badge-light-${assignment.status === '1' ? 'success' : 'warning'} me-2`}>
                                    {assignment.status === '1' ? 'Completed' : 'Pending'}
                                  </span>
                                  {assignment.message_for_student && (
                                    <Tooltip message={assignment.message_for_student}>
                                      <i className='fas fa-comment text-muted'></i>
                                    </Tooltip>
                                  )}
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
                <button className='btn btn-sm btn-light-primary'>
                  <i className='fas fa-eye me-1'></i>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    })
  }, [exercises, collapsedCards, toggleCardCollapse])

  // Show full-page loading only for initial load or errors
  if (isInitialLoad && loading) {
    return (
      <>
        <PageTitle breadcrumbs={[]}>
          {intl.formatMessage({id: 'MENU.EXERCISES.ASSIGNED_LIST'})}
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
        <PageTitle breadcrumbs={[]}>
          {intl.formatMessage({id: 'MENU.EXERCISES.ASSIGNED_LIST'})}
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
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({id: 'MENU.EXERCISES.ASSIGNED_LIST'})}
      </PageTitle>
      
      {/* Filters */}
      <IsolatedFilters />

      {/* Loading overlay for filter changes */}
      {loadingFilters && !isInitialLoad && (
        <div className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center' 
             style={{backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9999}}>
          <div className='bg-white rounded shadow-lg p-4 d-flex align-items-center'>
            <div className='spinner-border text-primary me-3' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <span className='text-muted'>Updating results...</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className='row g-5 g-xl-8 mb-8'>
        <div className='col-xl-3'>
          <div 
            className={`card border-0 cursor-pointer ${!filters.status ? 'bg-light-primary border-primary' : 'bg-light-primary'}`}
            onClick={() => handleStatusFilter('')}
            style={{ cursor: 'pointer' }}
          >
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-4'>
                  <div className='symbol-label bg-primary'>
                    <i className='fas fa-tasks text-white fs-2'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-semibold'>Total Assigned</div>
                  <div className='fs-2 fw-bold text-gray-800 d-flex align-items-center'>
                    {summary.total}
                    {loadingFilters && !isInitialLoad && (
                      <div className='spinner-border spinner-border-sm text-primary ms-2' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!filters.status && (
                <div className='position-absolute top-0 end-0 mt-2 me-2'>
                  <i className='fas fa-check-circle text-primary fs-5'></i>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className='col-xl-3'>
          <div 
            className={`card border-0 cursor-pointer ${filters.status === '2' ? 'bg-light-success border-success' : 'bg-light-success'}`}
            onClick={() => handleStatusFilter('completed')}
            style={{ cursor: 'pointer' }}
          >
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-4'>
                  <div className='symbol-label bg-success'>
                    <i className='fas fa-check-circle text-white fs-2'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-semibold'>Completed</div>
                  <div className='fs-2 fw-bold text-gray-800 d-flex align-items-center'>
                    {summary.completed}
                    {loadingFilters && !isInitialLoad && (
                      <div className='spinner-border spinner-border-sm text-success ms-2' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {filters.status === '2' && (
                <div className='position-absolute top-0 end-0 mt-2 me-2'>
                  <i className='fas fa-check-circle text-success fs-5'></i>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className='col-xl-3'>
          <div 
            className={`card border-0 cursor-pointer ${filters.status === '1' ? 'bg-light-warning border-warning' : 'bg-light-warning'}`}
            onClick={() => handleStatusFilter('in_progress')}
            style={{ cursor: 'pointer' }}
          >
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-4'>
                  <div className='symbol-label bg-warning'>
                    <i className='fas fa-clock text-white fs-2'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-semibold'>In Progress</div>
                  <div className='fs-2 fw-bold text-gray-800 d-flex align-items-center'>
                    {summary.in_progress}
                    {loadingFilters && !isInitialLoad && (
                      <div className='spinner-border spinner-border-sm text-warning ms-2' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {filters.status === '1' && (
                <div className='position-absolute top-0 end-0 mt-2 me-2'>
                  <i className='fas fa-check-circle text-warning fs-5'></i>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className='col-xl-3'>
          <div 
            className={`card border-0 cursor-pointer ${filters.status === '4' ? 'bg-light-danger border-danger' : 'bg-light-danger'}`}
            onClick={() => handleStatusFilter('overdue')}
            style={{ cursor: 'pointer' }}
          >
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-4'>
                  <div className='symbol-label bg-danger'>
                    <i className='fas fa-exclamation-triangle text-white fs-2'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-semibold'>Overdue</div>
                  <div className='fs-2 fw-bold text-gray-800 d-flex align-items-center'>
                    {summary.overdue}
                    {loadingFilters && !isInitialLoad && (
                      <div className='spinner-border spinner-border-sm text-danger ms-2' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {filters.status === '4' && (
                <div className='position-absolute top-0 end-0 mt-2 me-2'>
                  <i className='fas fa-check-circle text-danger fs-5'></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className='row g-6'>
        {exerciseCards}
      </div>

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