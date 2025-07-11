import {FC, useState, useEffect, useMemo, useCallback, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {AppDispatch, RootState} from '../../../../store'
import {fetchStudentExercises, setPage, setFilters, setLoadingFilters, clearCache} from '../../../../store/exercises/studentExercisesSlice'
import {DatePicker} from '../../../../_metronic/helpers/components/DatePicker'
import Select from 'react-select'
import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, getStatusIcon, getStatusHexColor, getStatusBackgroundColor, AssignmentStatus} from '../../../constants/assignmentStatus'
import './ExerciseDashboardPage.scss'

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

const ExerciseDashboardPage: FC = () => {
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
  } = useSelector((state: RootState) => state.studentExercises)
  
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [showFilters, setShowFilters] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<{title: string, message: string} | null>(null)
  const hasInitialized = useRef(false)
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const filtersRef = useRef(filters)

  // Status options for filter


  // Helper function to get student status from assignment
  const getStudentStatus = (exercise: any): string => {
    if (exercise.assignments.length === 0) {
      return 'not_started'
    }
    
    const assignmentStatus = exercise.assignments[0].status
    const daysRemaining = getDaysRemaining(exercise.assignments[0].due_date)
    
    // Check if exercise is overdue based on due date
    if (daysRemaining !== null && daysRemaining < 0) {
      return 'overdue'
    }
    
    // Map assignment status to student status
    switch (assignmentStatus) {
      case '0': return 'not_started'
      case '1': return 'in_progress'
      case '2': return 'completed'
      case '4': return 'overdue'
      default: return 'not_started'
    }
  }

  // Helper function to map API status strings to constants
  const getStatusFromApi = (apiStatus: string): number => {
    switch (apiStatus) {
      case 'completed': return ASSIGNMENT_STATUS.SUBMITTED
      case 'in_progress': return ASSIGNMENT_STATUS.IN_PROGRESS
      case 'not_started': return ASSIGNMENT_STATUS.ASSIGNED
      case 'overdue': return ASSIGNMENT_STATUS.OVERDUE
      default: return ASSIGNMENT_STATUS.ASSIGNED
    }
  }

  // Helper functions for string status values from API
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'warning'
      case 'not_started': return 'secondary'
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-light-success'
      case 'in_progress': return 'badge-light-warning'
      case 'not_started': return 'badge-light-secondary'
      case 'overdue': return 'badge-light-danger'
      default: return 'badge-light-secondary'
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return '-'
    }
    
    const date = new Date(dateString)
    
    // Check if the date is valid (not Invalid Date or Dec 31, 1969)
    if (isNaN(date.getTime()) || date.getFullYear() === 1969) {
      return '-'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (dueDate: string | null | undefined) => {
    if (!dueDate) {
      return null
    }
    
    const today = new Date()
    const due = new Date(dueDate)
    
    // Check if the date is valid (not Invalid Date or Dec 31, 1969)
    if (isNaN(due.getTime()) || due.getFullYear() === 1969) {
      return null
    }
    
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPriorityLevel = (dueDate: string | null | undefined) => {
    const daysRemaining = getDaysRemaining(dueDate)
    if (daysRemaining === null) return 'low'
    if (daysRemaining < 0) return 'critical'
    if (daysRemaining <= 1) return 'high'
    if (daysRemaining <= 3) return 'medium'
    return 'low'
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
    
    // Clear existing timeout
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }
    
    // Set new timeout for API call
    apiTimeoutRef.current = setTimeout(() => {
      dispatch(setFilters({ search: value }))
    }, 500) // 500ms delay for search
  }, [dispatch])

  const handleStatusFilter = useCallback((status: string) => {
    // Set loading state for filters
    dispatch(setLoadingFilters(true))
    
    // Clear cache to force fresh API call
    dispatch(clearCache())
    
    // Update filters immediately (no debouncing for status clicks)
    dispatch(setFilters({ status }))
  }, [dispatch])

  const handleDateChange = useCallback((field: string, date: Date | null) => {
    let dateString = ''
    if (date) {
      if (field === 'due_to' || field === 'assigned_to') {
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
        dateString = localDate.toISOString()
      } else {
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        dateString = localDate.toISOString()
      }
    }
    dispatch(setFilters({ [field]: dateString }))
  }, [dispatch])

  const clearFilters = useCallback(() => {
    setSearchValue('')
    dispatch(setFilters({ 
      search: '', 
      status: '', 
      due_from: '', 
      due_to: '', 
      assigned_from: '', 
      assigned_to: '',
      order_by: 'due_date',
      order: 'asc'
    }))
  }, [dispatch])

  const handleOpenMessageModal = useCallback((title: string, message: string) => {
    setSelectedMessage({ title, message })
    setShowMessageModal(true)
  }, [])

  const handleCloseMessageModal = useCallback(() => {
    setShowMessageModal(false)
    setSelectedMessage(null)
  }, [])

  const handleSortChange = useCallback((field: string, value: string) => {
    dispatch(setFilters({ [field]: value }))
  }, [dispatch])

  // Update filtersRef when filters change
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Watch for filter changes and debounce API calls
  useEffect(() => {
    // Clear any existing timeout
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }
    
    // Set new timeout for API call
    apiTimeoutRef.current = setTimeout(() => {
      dispatch(fetchStudentExercises(filtersRef.current))
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
    if (!hasInitialized.current) {
      dispatch(fetchStudentExercises(filters))
      setIsInitialLoad(false)
      hasInitialized.current = true
    }
  }, [dispatch]) // Only run on mount

  // Memoized exercise cards for grid view
  const exerciseGridCards = useMemo(() => {
    return exercises.map((exercise) => {
      const daysRemaining = exercise.assignments.length > 0 
        ? getDaysRemaining(exercise.assignments[0].due_date)
        : null
      const priorityLevel = exercise.assignments.length > 0 
        ? getPriorityLevel(exercise.assignments[0].due_date)
        : 'low'
      const studentStatus = getStudentStatus(exercise)

      return (
        <div key={exercise.id} className='col-xl-6 col-xxl-4 exercise-card'>
          <div className={`student-exercise-card priority-${priorityLevel} status-${studentStatus}`}>
            <div className='card-header'>
              <div className='exercise-info'>
                <h5 className='exercise-title'>{exercise.title}</h5>
                <span className='exercise-number'>Question #{exercise.question_no}</span>
              </div>
              <div className='status-badge'>
                <span className={`badge ${getStatusBadgeColor(studentStatus)}`}>
                  {getStatusLabel(getStatusFromApi(studentStatus) as AssignmentStatus)}
                </span>
              </div>
            </div>
            
            <div className='card-body'>
              {/* Progress Section */}
              <div className='progress-section'>
                <div className='progress-info'>
                  <span className='progress-label'>My Progress</span>
                  <span className='progress-value'>{exercise.progress}%</span>
                </div>
                <div className='progress-bar-container'>
                                  <div className='progress-bar'>
                  <div 
                    className={`progress-fill bg-${getStatusColor(studentStatus)}`}
                    style={{width: `${exercise.progress}%`}}
                  ></div>
                </div>
                </div>
              </div>
              
              {/* Due Date Section */}
              {exercise.assignments.length > 0 && (
                <div className='due-date-section'>
                  <div className='due-date-info'>
                    <i className='fas fa-calendar-alt text-primary'></i>
                    <div className='due-details'>
                      <div className='due-label'>Due Date</div>
                      <div className='due-value'>{formatDate(exercise.assignments[0].due_date)}</div>
                    </div>
                    <div className='time-left-info'>
                      <div className='days-label'>Time Left</div>
                      <div className={`days-value ${
                        daysRemaining === null ? 'normal' :
                        daysRemaining < 0 ? 'overdue' :
                        daysRemaining === 0 ? 'due-today' :
                        daysRemaining === 1 ? 'due-tomorrow' :
                        'normal'
                      }`}>
                        {daysRemaining === null ? '-' :
                         daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` :
                         daysRemaining === 0 ? 'Due today!' :
                         daysRemaining === 1 ? 'Due tomorrow!' :
                         `${daysRemaining} days left`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Teacher Message Section */}
              {exercise.assignments.length > 0 && exercise.assignments[0].message_for_student && (
                <div 
                  className='teacher-message-section clickable'
                  onClick={() => handleOpenMessageModal(exercise.title, exercise.assignments[0].message_for_student)}
                >
                  <div className='message-header'>
                    <i className='fas fa-comment-dots text-info'></i>
                    <span className='message-label'>Teacher's Note</span>
                    <i className='fas fa-external-link-alt text-info ms-auto'></i>
                  </div>
                  <div className='message-content'>
                    {exercise.assignments[0].message_for_student}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className='action-buttons'>
                <button className='btn btn-primary btn-sm'>
                  <i className='fas fa-play me-1'></i>
                  Start Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    })
  }, [exercises])

  // Memoized exercise list view
  const exerciseListView = useMemo(() => {
    return exercises.map((exercise) => {
      const daysRemaining = exercise.assignments.length > 0 
        ? getDaysRemaining(exercise.assignments[0].due_date)
        : null
      const priorityLevel = exercise.assignments.length > 0 
        ? getPriorityLevel(exercise.assignments[0].due_date)
        : 'low'
      const studentStatus = getStudentStatus(exercise)

      return (
        <div key={exercise.id} className={`exercise-list-item status-${studentStatus}`}>
          <div className='list-item-header'>
            <div className='item-content'>
              <div className='item-title'>
                <h6 className='mb-1'>{exercise.title}</h6>
                <span className='text-muted fs-7'>Question #{exercise.question_no}</span>
              </div>
              <div className='item-progress'>
                <div className='progress-info'>
                  <span className='progress-text'>{exercise.progress}% Complete</span>
                  <div className='mini-progress'>
                    <div 
                      className={`progress-fill bg-${getStatusColor(studentStatus)}`}
                      style={{width: `${exercise.progress}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='item-due-date'>
              {exercise.assignments.length > 0 && (
                <div className='due-info'>
                  <div className='due-date'>{formatDate(exercise.assignments[0].due_date)}</div>
                  <div className={`days-left ${
                    daysRemaining === null ? 'normal' :
                    daysRemaining < 0 ? 'overdue' :
                    daysRemaining === 0 ? 'due-today' :
                    daysRemaining === 1 ? 'due-tomorrow' :
                    'normal'
                  }`}>
                    {daysRemaining === null ? '-' :
                     daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` :
                     daysRemaining === 0 ? 'Due today!' :
                     daysRemaining === 1 ? 'Due tomorrow!' :
                     `${daysRemaining} days left`}
                  </div>
                </div>
              )}
            </div>
            <div className='item-status'>
              <span className={`badge ${getStatusBadgeColor(studentStatus)}`}>
                {getStatusLabel(getStatusFromApi(studentStatus) as AssignmentStatus)}
              </span>
            </div>
            <div className='item-actions'>
              <button className='btn btn-sm btn-primary'>
                <i className='fas fa-play'></i>
              </button>
            </div>
          </div>
          
          {/* Teacher Message Section for List View */}
          {exercise.assignments.length > 0 && exercise.assignments[0].message_for_student && (
            <div 
              className='list-item-message clickable'
              onClick={() => handleOpenMessageModal(exercise.title, exercise.assignments[0].message_for_student)}
            >
              <div className='message-header'>
                <i className='fas fa-comment-dots text-info'></i>
                <span className='message-label'>Teacher's Note</span>
                <i className='fas fa-external-link-alt text-info ms-auto'></i>
              </div>
              <div className='message-content'>
                {exercise.assignments[0].message_for_student}
              </div>
            </div>
          )}
        </div>
      )
    })
  }, [exercises])

  // Show loading state
  if (isInitialLoad && loading) {
    return (
      <div className='exercise-dashboard'>
        <PageTitle breadcrumbs={[]}>
          My Exercise Hub
        </PageTitle>
        <div className='card'>
          <div className='card-body text-center py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <div className='mt-3'>Loading your exercises...</div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className='exercise-dashboard'>
        <PageTitle breadcrumbs={[]}>
          My Exercise Hub
        </PageTitle>
        <div className='card'>
          <div className='card-body text-center py-10'>
            <i className='fas fa-exclamation-triangle fs-3x text-danger mb-4'></i>
            <h4 className='text-danger mb-2'>Oops! Something went wrong</h4>
            <p className='text-muted'>{error}</p>
            <button 
              className='btn btn-primary'
              onClick={() => dispatch(fetchStudentExercises(filters))}
            >
              <i className='fas fa-redo me-1'></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='exercise-dashboard'>
      <PageTitle breadcrumbs={[]}>
        My Exercise Hub
      </PageTitle>
      
      {/* Welcome Section */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>Welcome to Your Exercise Hub! 🎓</h2>
            <p className='welcome-subtitle'>Track your progress, meet deadlines, and ace your assignments</p>
          </div>
          <div className='welcome-actions'>
            <button 
              className='btn btn-light-primary me-3'
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className='fas fa-filter me-1'></i>
              {showFilters ? 'Hide Filters' : 'Filter My Work'}
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

      {/* Filters Section */}
      {showFilters && (
        <div className='filters-section'>
          <div className='filters-content'>
            <div className='row g-4'>
              {/* Search */}
              <div className='col-md-4'>
                <label className='form-label fw-bold'>Find My Exercises</label>
                <div className='position-relative'>
                  <i className='fas fa-search position-absolute top-50 translate-middle-y ms-3 text-muted'></i>
                  <input
                    type='text'
                    className='form-control form-control-solid ps-10'
                    placeholder='Search by title...'
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>



              {/* Due Date Range */}
              <div className='col-md-4'>
                <label className='form-label fw-bold'>Due Date Range</label>
                <div className='row g-2'>
                  <div className='col-6'>
                    <DatePicker
                      selected={filters.due_from ? new Date(filters.due_from) : null}
                      onChange={(date) => handleDateChange('due_from', date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="From"
                      isClearable={true}
                      className="form-control form-control-solid"
                      wrapperClassName="w-100"
                    />
                  </div>
                  <div className='col-6'>
                    <DatePicker
                      selected={filters.due_to ? new Date(filters.due_to) : null}
                      onChange={(date) => handleDateChange('due_to', date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="To"
                      isClearable={true}
                      className="form-control form-control-solid"
                      wrapperClassName="w-100"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className='col-md-4'>
                <label className='form-label fw-bold'>Sort By</label>
                <div className='row g-2'>
                  <div className='col-6'>
                    <Select
                      value={{
                        value: filters.order_by || 'due_date',
                        label: filters.order_by === 'title' ? 'Exercise Name' : 
                               filters.order_by === 'due_date' ? 'Due Date' : 'Due Date'
                      }}
                      onChange={(option) => handleSortChange('order_by', option?.value || 'due_date')}
                      options={[
                        { value: 'due_date', label: 'Due Date' },
                        { value: 'title', label: 'Exercise Name' }
                      ]}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Sort by..."
                      isClearable={false}
                    />
                  </div>
                  <div className='col-6'>
                    <Select
                      value={{
                        value: filters.order || 'asc',
                        label: filters.order === 'asc' ? 'Ascending' : 'Descending'
                      }}
                      onChange={(option) => handleSortChange('order', option?.value || 'asc')}
                      options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' }
                      ]}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Order..."
                      isClearable={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='filters-footer'>
              <button 
                className='btn btn-secondary btn-sm'
                onClick={clearFilters}
              >
                <i className='fas fa-times me-1'></i>
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

            {/* My Progress Overview */}
      <div className='progress-overview'>
        <div className='row g-4'>
          <div className='col-xl-3'>
            <div 
              className={`progress-card total ${!filters.status ? 'active' : ''}`}
              onClick={() => handleStatusFilter('')}
              style={{ cursor: 'pointer' }}
            >
              <div className='card-icon'>
                <i className='fas fa-book-open text-white fs-2'></i>
              </div>
              <div className='card-content'>
                <div className='card-number'>{summary.total}</div>
                <div className='card-label'>Total Assignments</div>
              </div>
              {!filters.status && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle'></i>
                </div>
              )}
            </div>
          </div>
          
          <div className='col-xl-3'>
            <div 
              className={`progress-card completed ${filters.status === ASSIGNMENT_STATUS.SUBMITTED.toString() ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.SUBMITTED.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='card-icon'>
                <i className='fas fa-check-circle text-white fs-2'></i>
              </div>
                              <div className='card-content'>
                  <div className='card-number'>{summary.completed}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.SUBMITTED)}</div>
                </div>
              {filters.status === ASSIGNMENT_STATUS.SUBMITTED.toString() && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle'></i>
                </div>
              )}
            </div>
          </div>
          
          <div className='col-xl-3'>
            <div 
              className={`progress-card in-progress ${filters.status === ASSIGNMENT_STATUS.IN_PROGRESS.toString() ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.IN_PROGRESS.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='card-icon'>
                <i className='fas fa-clock text-white fs-2'></i>
              </div>
                              <div className='card-content'>
                  <div className='card-number'>{summary.in_progress}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.IN_PROGRESS)}</div>
                </div>
              {filters.status === ASSIGNMENT_STATUS.IN_PROGRESS.toString() && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle'></i>
                </div>
              )}
            </div>
          </div>
          
          <div className='col-xl-3'>
            <div 
              className={`progress-card overdue ${filters.status === ASSIGNMENT_STATUS.OVERDUE.toString() ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.OVERDUE.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='card-icon'>
                <i className='fas fa-exclamation-triangle text-white fs-2'></i>
              </div>
                              <div className='card-content'>
                  <div className='card-number'>{summary.overdue}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.OVERDUE)}</div>
                </div>
              {filters.status === ASSIGNMENT_STATUS.OVERDUE.toString() && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle'></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay for filter changes */}
      {loadingFilters && !isInitialLoad && (
        <div className='loading-overlay'>
          <div className='loading-content'>
            <div className='spinner-border text-primary me-3' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <span className='text-muted'>Updating your exercises...</span>
          </div>
        </div>
      )}

      {/* Exercise Content */}
      {selectedView === 'grid' ? (
        <div className='exercise-grid'>
          <div className='row g-4'>
            {exerciseGridCards}
          </div>
        </div>
      ) : (
        <div className='exercise-list'>
          {exerciseListView}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className='pagination-section'>
          <div className='pagination-info'>
            <span className='text-muted'>
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} exercises
            </span>
          </div>
          <nav>
            <ul className='pagination'>
              <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                <button 
                  className='page-link'
                  onClick={() => {
                                            dispatch(setPage(pagination.current_page - 1))
                        dispatch(fetchStudentExercises(filters))
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
                            dispatch(fetchStudentExercises(filters))
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
                        dispatch(fetchStudentExercises(filters))
                  }}
                  disabled={pagination.current_page === pagination.total_pages}
                >
                  <i className='fas fa-chevron-right'></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* No results message */}
      {exercises.length === 0 && !loading && !isInitialLoad && (
        <div className='empty-state'>
          <div className='empty-content'>
            <i className='fas fa-book-open fs-3x text-muted mb-4'></i>
            <h4 className='text-muted mb-2'>No exercises found</h4>
            <p className='text-muted'>Great job! You might be all caught up, or try adjusting your filters.</p>
          </div>
        </div>
      )}
      
      {/* Teacher Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <i className='fas fa-comment-dots text-info me-2'></i>
                  Teacher's Note
                </h5>
                <button 
                  type='button' 
                  className='btn-close' 
                  onClick={handleCloseMessageModal}
                ></button>
              </div>
              <div className='modal-body'>
                <div className='mb-3'>
                  <strong className='text-muted'>Exercise:</strong>
                  <div className='mt-1'>{selectedMessage.title}</div>
                </div>
                <div>
                  <strong className='text-muted'>Message:</strong>
                  <div className='mt-2 p-3 bg-light rounded'>
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
              <div className='modal-footer'>
                <button 
                  type='button' 
                  className='btn btn-secondary' 
                  onClick={handleCloseMessageModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExerciseDashboardPage 