import {FC, useState, useEffect, useMemo, useRef, useCallback, memo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {AppDispatch, RootState} from '../../../../store'
import {fetchAssignedExercises, setPage, setFilters, setLoadingFilters, clearCache, deleteAssignment} from '../../../../store/exercises/assignedExercisesSlice'
import {submitExerciseByTeacher} from '../../../../store/exercises/exercisesSlice'
import AssignedExercisesFilters from './components/AssignedExercisesFilters'
import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, AssignmentStatus} from '../../../constants/assignmentStatus'
import {useNavigate} from 'react-router-dom'
import {toast} from '../../../../_metronic/helpers/toast'
import {ConfirmationDialog} from '../../../../_metronic/helpers/ConfirmationDialog'
import {formatApiTimestamp} from '../../../../_metronic/helpers/dateUtils'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import './ExerciseAssignedListPage.scss'

const API_URL = import.meta.env.VITE_APP_API_URL

// Completely isolated filters component that doesn't re-render with parent
const IsolatedFilters = memo(() => {
  return <AssignedExercisesFilters />
})

// Reusable Submit for Student Button component
const SubmitForStudentButton: FC<{
  assignmentId: string
  studentName: string
  onSubmit: (assignmentId: string, studentName: string) => Promise<void>
  className?: string
}> = memo(({ assignmentId, studentName, onSubmit, className = '' }) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(assignmentId, studentName)
      setShowConfirmation(false)
    } catch (error) {
      // Error is already handled by the parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        className={`btn btn-icon btn-sm btn-light-primary btn-submit-for-student ${className}`}
        onClick={() => setShowConfirmation(true)}
        title={`Submit exercise for ${studentName}`}
        style={{ width: '32px', height: '32px' }}
      >
        <i className='fas fa-check text-primary'></i>
      </button>
      
      <ConfirmationDialog
        show={showConfirmation}
        onHide={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        title={`Submit Exercise for ${studentName}`}
        message={`Are you sure you want to submit the exercise for ${studentName}? This action cannot be undone.`}
        confirmText="Submit"
        cancelText="Cancel"
        variant="danger"
        loading={isSubmitting}
        loadingText="Submitting..."
      />
    </>
  )
})

// Reusable Delete Assignment Button component
const DeleteAssignmentButton: FC<{
  assignmentId: string
  studentName: string
  onDelete: (assignmentId: string, studentName: string) => Promise<void>
  className?: string
}> = memo(({ assignmentId, studentName, onDelete, className = '' }) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onDelete(assignmentId, studentName)
      setShowConfirmation(false)
    } catch (error) {
      // Error is already handled by the parent component
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        className={`btn btn-icon btn-sm btn-light-danger btn-delete-assignment ${className}`}
        onClick={() => setShowConfirmation(true)}
        title={`Delete assignment for ${studentName}`}
        style={{ width: '32px', height: '32px' }}
      >
        <i className='fas fa-trash text-danger'></i>
      </button>
      
      <ConfirmationDialog
        show={showConfirmation}
        onHide={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        title={`Delete Assignment for ${studentName}`}
        message={`Are you sure you want to delete the assignment for ${studentName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        loadingText="Deleting..."
      />
    </>
  )
})

// Custom tooltip component
const Tooltip: FC<{message: string, children: React.ReactNode}> = memo(({message, children}) => {
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
})

const ExerciseAssignedListPage: FC = () => {
  const intl = useIntl()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { 
    assignmentGroups,
    exercises, // Keep for backward compatibility
    summary, 
    pagination, 
    loading, 
    loadingFilters,
    error, 
    filters,
    lastFetchTime 
  } = useSelector((state: RootState) => state.assignedExercises)
  
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const filtersRef = useRef(filters)
  const hasInitializedCollapse = useRef(false)
  
  // State for loaded student assignments
  const [loadedStudents, setLoadedStudents] = useState<Record<string, any[]>>({})
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({})

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

  // Handle submitting exercise for a student
  const handleSubmitForStudent = async (assignmentId: string, studentName: string) => {
    try {
      await dispatch(submitExerciseByTeacher(assignmentId)).unwrap()
      toast.success(`Exercise submitted successfully for ${studentName}`, 'Success')
      // Refresh the data to show updated status
      dispatch(fetchAssignedExercises(filters))
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit exercise for student'
      toast.error(errorMessage, 'Error')
    }
  }

  // Handle deleting assignment for a student
  const handleDeleteAssignment = async (assignmentId: string, studentName: string) => {
    try {
      await dispatch(deleteAssignment(assignmentId)).unwrap()
      // The assignment is automatically removed from the state by the reducer
      // No need to refetch data - the reducer handles the state update
      // This prevents the card from collapsing and maintains the current view state
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete assignment'
      toast.error(errorMessage, 'Error')
    }
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

  // Fetch students for a specific assign_key
  const fetchStudents = useCallback(async (assignKey: string) => {
    // If already loaded or currently loading, skip
    if (loadedStudents[assignKey] || loadingStudents[assignKey]) {
      return
    }

    setLoadingStudents(prev => ({ ...prev, [assignKey]: true }))
    
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/student-exercises/assignments/${assignKey}/students`)
      const response = await axios.get(`${API_URL}/student-exercises/assignments/${assignKey}/students`, {
        headers,
        withCredentials: true
      })
      
      if (response.data.success) {
        // Flatten the students array to get all assignments with student info
        const students = response.data.data?.students || []
        const flattenedAssignments = students.flatMap((student: any) => 
          student.assignments.map((assignment: any) => ({
            ...assignment,
            student: {
              id: student.student_id,
              name: student.name,
              email: student.email
            },
            exercise: {
              exercise_id: assignment.exercise_id,
              title: assignment.exercise_title
            }
          }))
        )
        
        setLoadedStudents(prev => ({
          ...prev,
          [assignKey]: flattenedAssignments
        }))
      }
    } catch (error: any) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load student assignments', 'Error')
    } finally {
      setLoadingStudents(prev => ({ ...prev, [assignKey]: false }))
    }
  }, [loadedStudents, loadingStudents])

  const toggleCardCollapse = useCallback((assignKey: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev)
      const isCurrentlyCollapsed = newSet.has(assignKey)
      
      if (isCurrentlyCollapsed) {
        newSet.delete(assignKey)
        // Fetch students when expanding
        fetchStudents(assignKey)
      } else {
        newSet.add(assignKey)
      }
      return newSet
    })
  }, [fetchStudents])

  const handleExerciseClick = useCallback((exerciseId: string) => {
    navigate(`/exercises/edit/${exerciseId}`)
  }, [navigate])

  // Helper function to check if a status filter is active
  const isStatusFilterActive = useCallback((statusToCheck: string) => {
    if (!filters.status) return false
    if (Array.isArray(filters.status)) {
      return filters.status.includes(statusToCheck)
    }
    return filters.status === statusToCheck
  }, [filters.status])

  const handleStatusFilter = useCallback((status: string) => {
    // Set loading state for filters
    dispatch(setLoadingFilters(true))
    
    // Clear cache to force fresh API call
    dispatch(clearCache())
    
    let statusToSend: string | string[]
    
    // Special case: when "Submitted" is selected, include both SUBMITTED and SUBMITTEDBYTEACHER
    if (status === ASSIGNMENT_STATUS.SUBMITTED.toString()) {
      statusToSend = [
        ASSIGNMENT_STATUS.SUBMITTED.toString(),
        ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER.toString()
      ]
    } else {
      statusToSend = status
    }
    
    // Update filters with status
    dispatch(setFilters({ ...filtersRef.current, status: statusToSend }))
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

  // Set cards to collapsed by default when assignment groups are first loaded
  useEffect(() => {
    if (assignmentGroups.length > 0 && !hasInitializedCollapse.current) {
      // Set all cards to collapsed by default on initial load
      setCollapsedCards(new Set(assignmentGroups.map(group => group.assign_key)))
      hasInitializedCollapse.current = true
    }
  }, [assignmentGroups.length])

  // Memoized assignment group cards to prevent unnecessary re-renders
  const assignmentGroupCards = useMemo(() => {
    return assignmentGroups.map((assignmentGroup) => {
      // Get students for this assignment group (if loaded)
      const students = loadedStudents[assignmentGroup.assign_key] || []
      const isLoadingStudentsForThisGroup = loadingStudents[assignmentGroup.assign_key] || false
      
      // Group students by due date
      const studentsByDueDate = students.reduce((groups: Record<string, any[]>, student: any) => {
        let dueDateKey = 'No Due Date'
        if (student.due_date) {
          const dueDate = new Date(student.due_date)
          if (!isNaN(dueDate.getTime())) {
            dueDateKey = dueDate.toLocaleDateString()
          }
        }
        
        if (!groups[dueDateKey]) {
          groups[dueDateKey] = []
        }
        groups[dueDateKey].push(student)
        return groups
      }, {})

      return (
        <div key={assignmentGroup.assign_key} className='col-lg-4 col-md-6 col-sm-12'>
          <div className='card h-100 shadow-sm border-0'>
            <div className='card-header border-0 pt-6'>
              <div className='card-title'>
                <div className='d-flex align-items-center'>
                  <div>
                    <h5 
                      className='mb-1 text-hover-primary exercise-title-ellipsis'
                    >
                      {assignmentGroup.exercises[0]?.title || 'Assignment Group'}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
            
            <div className='card-body pt-0'>
              <div className='row text-center mb-4'>
                <div className='col-4'>
                  <div className='d-flex align-items-center justify-content-start'>
                    <span className='text-muted fs-7 me-2'>Students:</span>
                    <span className='fw-bold fs-4'>{assignmentGroup.student_stats.total}</span>
                  </div>
                </div>
                <div className='col-4'>
                  <div className='d-flex align-items-center justify-content-center'>
                    <span className='text-muted fs-7 me-2'>Completed:</span>
                    <span className='fw-bold fs-4'>{assignmentGroup.student_stats.completed}</span>
                  </div>
                </div>
                <div className='col-4'>
                  <div className='d-flex align-items-center justify-content-end'>
                    <span className='text-muted fs-7 me-2'>Assigned:</span>
                    <span className='fw-bold fs-6'>{formatApiTimestamp(assignmentGroup.assigned_at, { format: 'dateOnly' })}</span>
                  </div>
                </div>
              </div>
              
              {/* Assignments grouped by due date */}
              <div className='mb-4 border rounded p-3'>
                <div 
                  className='d-flex align-items-center justify-content-between cursor-pointer'
                  onClick={() => toggleCardCollapse(assignmentGroup.assign_key)}
                  style={{ cursor: 'pointer' }}
                >
                  <h6 className='fw-bold mb-0'>Students</h6>
                  <i className={`fas fa-chevron-${collapsedCards.has(assignmentGroup.assign_key) ? 'down' : 'up'} text-muted`}></i>
                </div>
                
                {!collapsedCards.has(assignmentGroup.assign_key) && (
                  <div className='mt-3'>
                    {isLoadingStudentsForThisGroup ? (
                      <div className='text-center py-3'>
                        <div className='spinner-border spinner-border-sm text-primary' role='status'>
                          <span className='visually-hidden'>Loading...</span>
                        </div>
                        <span className='ms-2 text-muted'>Loading students...</span>
                      </div>
                    ) : students.length === 0 ? (
                      <div className='text-center py-3 text-muted'>
                        No students assigned
                      </div>
                    ) : (
                      Object.entries(studentsByDueDate).map(([dueDate, assignments]) => {
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
                                    {(parseInt(assignment.status, 10) === ASSIGNMENT_STATUS.ASSIGNED || 
                                      parseInt(assignment.status, 10) === ASSIGNMENT_STATUS.IN_PROGRESS || 
                                      parseInt(assignment.status, 10) === ASSIGNMENT_STATUS.OVERDUE) && 
                                      parseInt(assignment.status, 10) !== ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER && (
                                      <SubmitForStudentButton
                                        assignmentId={assignment.assignment_id}
                                        studentName={assignment.student.name}
                                        onSubmit={handleSubmitForStudent}
                                        className="ms-2"
                                      />
                                    )}
                                    <DeleteAssignmentButton
                                      assignmentId={assignment.assignment_id}
                                      studentName={assignment.student.name}
                                      onDelete={handleDeleteAssignment}
                                      className="ms-2"
                                    />
                                    {assignment.message_for_student && (
                                      <i 
                                        className='fas fa-comment text-muted cursor-pointer ms-2' 
                                        title={assignment.message_for_student}
                                        style={{ cursor: 'pointer' }}
                                      ></i>
                                    )}
                                  </div>
                                </div>
                                <div className='d-flex align-items-center justify-content-between'>
                                  <div className='progress-container flex-grow-1 me-2' style={{ minWidth: '60px' }}>
                                    <div className='progress' style={{ height: '6px' }}>
                                      <div 
                                        className={`progress-bar bg-${getProgressBarColor(assignment.progress)}`}
                                        style={{ width: `${assignment.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className='fs-7 text-muted text-nowrap' style={{ minWidth: '90px' }}>
                                    {assignment.answered_questions}/{assignment.total_questions} questions
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })
                    )}
                  </div>
                )}
              </div>
              
              <div className='d-flex align-items-center justify-content-center'>
                <button 
                  className='btn btn-sm btn-light-primary' 
                  onClick={() => navigate(`/exercises/progress/${assignmentGroup.assign_key}`)}
                >
                  <i className='fas fa-eye me-1'></i>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    })
  }, [assignmentGroups, collapsedCards, toggleCardCollapse, handleSubmitForStudent, loadedStudents, loadingStudents, navigate])

  // Memoized assignment group list rows for list view
  const assignmentGroupListRows = useMemo(() => {
    return (
      <div className='exercise-list'>
        {assignmentGroups.map((assignmentGroup) => {
          // Get students for this assignment group (if loaded)
          const students = loadedStudents[assignmentGroup.assign_key] || []
          const isLoadingStudentsForThisGroup = loadingStudents[assignmentGroup.assign_key] || false
          
          // Group students by due date (same logic as card view)
          const studentsByDueDate = students.reduce((groups: Record<string, any[]>, student: any) => {
            let dueDateKey = 'No Due Date'
            if (student.due_date) {
              const dueDate = new Date(student.due_date)
              if (!isNaN(dueDate.getTime())) {
                dueDateKey = dueDate.toLocaleDateString()
              }
            }
            
            if (!groups[dueDateKey]) {
              groups[dueDateKey] = []
            }
            groups[dueDateKey].push(student)
            return groups
          }, {})

          return (
            <div key={assignmentGroup.assign_key} className={`exercise-list-item`}>
              <div className='list-item-header' onClick={() => toggleCardCollapse(assignmentGroup.assign_key)} style={{cursor: 'pointer', flex: 1}}>
                <div className='item-content'>
                  <div className='item-title'>
                    <div className='d-flex align-items-center'>
                      <div>
                        <h6 
                          className='mb-1 text-hover-primary exercise-title-ellipsis'
                        >
                          {assignmentGroup.exercises[0]?.title || 'Assignment Group'}
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className='item-progress'>
                    <div className='progress-info'>
                      <span className='progress-text'>
                        Assigned: {formatApiTimestamp(assignmentGroup.assigned_at, { format: 'dateOnly' })}
                      </span>
                      {assignmentGroup.due_date && (
                        <span className='progress-text'>
                          Due: {formatApiTimestamp(assignmentGroup.due_date, { format: 'custom' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className='item-stats'>
                  <div className='stat-item'>
                    <div className='stat-number'>{assignmentGroup.student_stats.total}</div>
                    <div className='stat-label'>Students</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number text-success'>{assignmentGroup.student_stats.completed}</div>
                    <div className='stat-label'>Completed</div>
                  </div>
                  <div className='stat-item'>
                    <div className='stat-number text-warning'>{assignmentGroup.student_stats.in_progress}</div>
                    <div className='stat-label'>
                      {assignmentGroup.student_stats.total > 0 && assignmentGroup.student_stats.in_progress > 0
                        ? 'In Progress'
                        : assignmentGroup.student_stats.total > 0 && assignmentGroup.student_stats.completed === 0 && assignmentGroup.student_stats.in_progress === 0
                          ? 'In Progress'
                          : assignmentGroup.student_stats.total > 0 && assignmentGroup.student_stats.completed > 0
                            ? `${Math.round((assignmentGroup.student_stats.in_progress / assignmentGroup.student_stats.total) * 100)}%`
                            : '0%'}
                    </div>
                  </div>
                </div>
                
                <div className='item-actions'>
                  <button 
                    className='btn btn-sm btn-light-primary'
                    onClick={e => { e.stopPropagation(); navigate(`/exercises/progress/${assignmentGroup.assign_key}`); }}
                  >
                    <i className='fas fa-eye me-1'></i>
                    View Details
                  </button>
                </div>
              </div>
              
              {/* Assignments Section */}
              {!collapsedCards.has(assignmentGroup.assign_key) && (
                <div className='list-item-assignments'>
                  <div className='assignments-header'>
                    <h6 className='mb-0'>Students</h6>
                  </div>
                  <div className='assignments-content'>
                    {isLoadingStudentsForThisGroup ? (
                      <div className='text-center py-3'>
                        <div className='spinner-border spinner-border-sm text-primary' role='status'>
                          <span className='visually-hidden'>Loading...</span>
                        </div>
                        <span className='ms-2 text-muted'>Loading students...</span>
                      </div>
                    ) : students.length === 0 ? (
                      <div className='text-center py-3 text-muted'>
                        No students assigned
                      </div>
                    ) : (
                      Object.entries(studentsByDueDate).map(([dueDate, assignments]) => (
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
                                <div style={{minWidth: 180, flex: '1 1 180px'}} className='d-flex flex-column align-items-start'>
                                  <div className='d-flex align-items-center mb-1'>
                                    <span className='fw-bold fs-7 me-2'>{assignment.progress}%</span>
                                    <div className='progress h-3px' style={{width: 80}}>
                                      <div 
                                        className={`progress-bar bg-${getProgressBarColor(assignment.progress)}`}
                                        style={{width: `${assignment.progress}%`}}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className='fw-bold fs-7 text-nowrap'>{assignment.answered_questions}/{assignment.total_questions} Questions</span>
                                </div>
                                {/* Status Label */}
                                <div style={{minWidth: 100, flex: '0 0 100px'}} className='d-flex align-items-center'>
                                  <span className={`badge badge-light-${getStatusColor(parseInt(assignment.status, 10) as AssignmentStatus)}`}>
                                    {getStatusLabel(parseInt(assignment.status, 10) as AssignmentStatus)}
                                  </span>
                                  {(parseInt(assignment.status, 10) === ASSIGNMENT_STATUS.ASSIGNED || 
                                    parseInt(assignment.status, 10) === ASSIGNMENT_STATUS.IN_PROGRESS || 
                                    parseInt(assignment.status, 10) === ASSIGNMENT_STATUS.OVERDUE) && 
                                    parseInt(assignment.status, 10) !== ASSIGNMENT_STATUS.SUBMITTEDBYTEACHER && (
                                    <SubmitForStudentButton
                                      assignmentId={assignment.assignment_id}
                                      studentName={assignment.student.name}
                                      onSubmit={handleSubmitForStudent}
                                      className="ms-2"
                                    />
                                  )}
                                  <DeleteAssignmentButton
                                    assignmentId={assignment.assignment_id}
                                    studentName={assignment.student.name}
                                    onDelete={handleDeleteAssignment}
                                    className="ms-2"
                                  />
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
                    ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }, [assignmentGroups, collapsedCards, toggleCardCollapse, handleSubmitForStudent, loadedStudents, loadingStudents, navigate])

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
      <div className='assigned-exercises-welcome-section'>
        <div className='assigned-exercises-welcome-content'>
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
      <div className='assigned-exercises-progress-overview'>
        <div className='assigned-exercises-status-cards-grid'>
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
              className={`progress-card completed ${isStatusFilterActive(ASSIGNMENT_STATUS.SUBMITTED.toString()) ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.SUBMITTED.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center'>
                <div className='card-icon me-3'>
                  <i className='fas fa-check-circle text-white fs-2'></i>
                </div>
                <div className='card-content'>
                  <div className='card-number'>{(summary.submitted || 0) + (summary.submitted_by_teacher || 0)}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.SUBMITTED)}</div>
                </div>
              </div>
              {isStatusFilterActive(ASSIGNMENT_STATUS.SUBMITTED.toString()) && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>

          <div>
            <div 
              className={`progress-card in-progress ${isStatusFilterActive(ASSIGNMENT_STATUS.IN_PROGRESS.toString()) ? 'active' : ''}`}
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
              {isStatusFilterActive(ASSIGNMENT_STATUS.IN_PROGRESS.toString()) && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>
          <div>
            <div 
              className={`progress-card overdue ${isStatusFilterActive(ASSIGNMENT_STATUS.OVERDUE.toString()) ? 'active' : ''}`}
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
              {isStatusFilterActive(ASSIGNMENT_STATUS.OVERDUE.toString()) && (
                <div className='active-indicator'>
                  <i className='fas fa-check-circle text-white'></i>
                </div>
              )}
            </div>
          </div>
          <div>
            <div 
              className={`progress-card not-started ${isStatusFilterActive(ASSIGNMENT_STATUS.ASSIGNED.toString()) ? 'active' : ''}`}
              onClick={() => handleStatusFilter(ASSIGNMENT_STATUS.ASSIGNED.toString())}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex align-items-center'>
                <div className='card-icon me-3'>
                  <i className='fas fa-hourglass-start text-white fs-2'></i>
                </div>
                <div className='card-content'>
                  <div className='card-number'>{typeof summary.not_started !== 'undefined' ? summary.not_started : summary.total - ((summary.submitted || 0) + (summary.submitted_by_teacher || 0)) - summary.in_progress - summary.overdue}</div>
                  <div className='card-label'>{getStatusLabel(ASSIGNMENT_STATUS.ASSIGNED)}</div>
                </div>
              </div>
              {isStatusFilterActive(ASSIGNMENT_STATUS.ASSIGNED.toString()) && (
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
          {assignmentGroupCards}
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
          {assignmentGroupListRows}
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
      {assignmentGroups.length === 0 && !loading && !isInitialLoad && (
        <div className='card mt-8'>
          <div className='card-body text-center py-10'>
            <i className='fas fa-search fs-3x text-muted mb-4'></i>
            <h4 className='text-muted mb-2'>No assignments found</h4>
            <p className='text-muted'>Try adjusting your filters or search terms.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default ExerciseAssignedListPage 