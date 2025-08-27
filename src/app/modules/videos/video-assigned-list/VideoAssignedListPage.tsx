import React, {FC, useState, useEffect, useMemo, useRef, useCallback, memo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {AppDispatch, RootState, store} from '../../../../store'
import {fetchAssignedVideos, setPage, setFilters, setLoadingFilters, clearCache, AssignedVideo, VideoPackage, type AssignedVideosFilters} from '../../../../store/videos/assignedVideosSlice'

import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, AssignmentStatus} from '../../../constants/assignmentStatus'
import {useNavigate} from 'react-router-dom'
import {KTIcon} from '../../../../_metronic/helpers'
import {useAuth} from '../../../../app/modules/auth'
import {isTeachingStaff} from '../../../constants/roles'
import VideoPreview from '../../../../components/Video/VideoPreview'
import VideoDetailModal from '../../../../components/Video/VideoDetailModal'
import {DatePicker} from '../../../../_metronic/helpers/components/DatePicker'
import Select from 'react-select'
import {ROLES} from '../../../constants/roles'
import {fetchUsers} from '../../../../store/user/userSlice'
import {toast} from '../../../../_metronic/helpers/toast'
import {formatApiTimestamp} from '../../../../_metronic/helpers/dateUtils'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import {ConfirmationDialog} from '../../../../_metronic/helpers/ConfirmationDialog'

import './VideoAssignedListPage.scss'

const API_URL = import.meta.env.VITE_APP_API_URL

interface StudentOption {
  value: string
  label: string
  data: any
}

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

// Filters component
interface AssignedVideosFiltersProps {
  onClearFilters: () => void
  clearTrigger?: number // Add a trigger to force clearing
}

const AssignedVideosFilters: FC<AssignedVideosFiltersProps> = ({ onClearFilters, clearTrigger }) => {
  const dispatch = useDispatch<AppDispatch>()
  const {filters, loadingFilters, pagination} = useSelector((state: RootState) => state.assignedVideos)
  const {users, loading: usersLoading} = useSelector((state: RootState) => state.users)
  const [localFilters, setLocalFilters] = useState(filters)
  
  // Date state for DatePicker components
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(
    filters.due_date_from ? new Date(filters.due_date_from) : null
  )
  const [dueDateTo, setDueDateTo] = useState<Date | null>(
    filters.due_date_to ? new Date(filters.due_date_to) : null
  )
  const [assignedDateFrom, setAssignedDateFrom] = useState<Date | null>(
    filters.assigned_date_from ? new Date(filters.assigned_date_from) : null
  )
  const [assignedDateTo, setAssignedDateTo] = useState<Date | null>(
    filters.assigned_date_to ? new Date(filters.assigned_date_to) : null
  )
  
  // Student selection state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const isForceClearingRef = useRef(false)

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  // Helper function to format date with timezone for API (following app pattern)
  const formatDateForAPI = (date: Date | null, isEndOfDay: boolean = false): string => {
    if (!date) return ''
    // Use same pattern as AssignToStudentsModal
    const hours = isEndOfDay ? 23 : 0
    const minutes = isEndOfDay ? 59 : 0  
    const seconds = isEndOfDay ? 59 : 0
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds).toISOString()
  }

  const handleDateChange = (key: string, date: Date | null) => {
    // For "to" dates, use end of day (23:59:59), for "from" dates use start of day (00:00:00)
    const isEndOfDay = key.includes('_to')
    const dateString = formatDateForAPI(date, isEndOfDay)
    setLocalFilters(prev => ({ ...prev, [key]: dateString }))
    
    // Update local date state
    switch(key) {
      case 'due_date_from':
        setDueDateFrom(date)
        break
      case 'due_date_to':
        setDueDateTo(date)
        break
      case 'assigned_date_from':
        setAssignedDateFrom(date)
        break
      case 'assigned_date_to':
        setAssignedDateTo(date)
        break
    }
  }

  const handleApplyFilters = () => {
    dispatch(setLoadingFilters(true))
    dispatch(setFilters(localFilters))
    dispatch(setPage(1))
    dispatch(clearCache())
    
    // Always fetch data after applying filters, even if filters haven't changed
    setTimeout(() => {
      dispatch(fetchAssignedVideos({
        page: 1,
        items_per_page: pagination.items_per_page,
        filters: localFilters
      }))
    }, 0)
  }

  const handleStudentSelection = (selectedOptions: any) => {
    if (!selectedOptions) {
      setSelectedStudents([])
      setLocalFilters(prev => ({ ...prev, student_ids: '' }))
      return
    }
    const selected = selectedOptions.map((option: any) => option.value)
    setSelectedStudents(selected)
    
    const studentIds = selected.join(',')
    setLocalFilters(prev => ({ ...prev, student_ids: studentIds }))
  }



  // Load students when component mounts
  useEffect(() => {
    dispatch(fetchUsers({
      page: 1,
      items_per_page: 1000, // Get all students
      role_type: ROLES.STUDENT.toString(),
      all: 1 // Get all students without pagination
    }))
  }, [dispatch])

  // Student options for react-select (API already filters by role_type)
  const studentOptions = useMemo(() => {
    if (!Array.isArray(users)) {
      return []
    }
    
    return users.map(user => ({
      value: user.user_id,
      label: user.name,
      data: user
    }))
  }, [users])

  // Update selected students when student_ids filter changes
  useEffect(() => {
    if (filters.student_ids) {
      const selectedIds = filters.student_ids.split(',').filter(id => id.trim())
      setSelectedStudents(selectedIds)
    } else {
      setSelectedStudents([])
    }
  }, [filters.student_ids])

  // Force clear all local states when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      isForceClearingRef.current = true
      setLocalFilters({})
      setDueDateFrom(null)
      setDueDateTo(null)
      setAssignedDateFrom(null)
      setAssignedDateTo(null)
      setSelectedStudents([])
      // Reset flag after a brief delay
      setTimeout(() => {
        isForceClearingRef.current = false
      }, 50)
    }
  }, [clearTrigger])

  // Sync local filters and date states when filters change
  useEffect(() => {
    // Don't sync if we're in the middle of force clearing
    if (isForceClearingRef.current) {
      return
    }
    
    setLocalFilters(filters)
    
    // Parse dates more safely
    const dueDateFromParsed = filters.due_date_from && filters.due_date_from !== '' ? new Date(filters.due_date_from) : null
    const dueDateToParsed = filters.due_date_to && filters.due_date_to !== '' ? new Date(filters.due_date_to) : null
    const assignedDateFromParsed = filters.assigned_date_from && filters.assigned_date_from !== '' ? new Date(filters.assigned_date_from) : null
    const assignedDateToParsed = filters.assigned_date_to && filters.assigned_date_to !== '' ? new Date(filters.assigned_date_to) : null
    
    setDueDateFrom(dueDateFromParsed)
    setDueDateTo(dueDateToParsed)
    setAssignedDateFrom(assignedDateFromParsed)
    setAssignedDateTo(assignedDateToParsed)
  }, [filters])

  return (
    <div className='card mb-5'>
      <div className='card-header'>
        <h3 className='card-title'>Filters</h3>
      </div>
      <div className='card-body'>
        <div className='row g-3'>
          <div className='col-md-3'>
            <label className='form-label'>Search</label>
            <input
              type='text'
              className='form-control'
              placeholder='Search videos, students...'
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className='col-md-3'>
            <label className='form-label'>Assigned To</label>
            <Select
              options={studentOptions}
              isMulti
              onChange={handleStudentSelection}
              placeholder="Select students to filter..."
              isLoading={usersLoading}
              isClearable
              isSearchable
              value={studentOptions.filter(option => 
                selectedStudents.includes(option.value)
              )}
              noOptionsMessage={() => "No students found"}
              loadingMessage={() => "Loading students..."}
            />
            {selectedStudents.length > 0 && (
              <div className="mt-1">
                <small className="text-muted">
                  {selectedStudents.length} student(s) selected
                </small>
              </div>
            )}
          </div>

        </div>
        
        <div className='row g-3 mb-3'>
          <div className='col-md-3'>
            <label className='form-label'>Assigned Date From</label>
            <DatePicker
              selected={assignedDateFrom}
              onChange={(date) => handleDateChange('assigned_date_from', date)}
              placeholderText="Select start date"
              isClearable={true}
              maxDate={assignedDateTo || new Date()}
            />
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Assigned Date To</label>
            <DatePicker
              selected={assignedDateTo}
              onChange={(date) => handleDateChange('assigned_date_to', date)}
              placeholderText="Select end date"
              isClearable={true}
              minDate={assignedDateFrom || undefined}
              maxDate={new Date()}
            />
          </div>

          <div className='col-md-3'>
            <label className='form-label'>Due Date From</label>
            <DatePicker
              selected={dueDateFrom}
              onChange={(date) => handleDateChange('due_date_from', date)}
              placeholderText="Select start date"
              isClearable={true}
              maxDate={dueDateTo || undefined}
            />
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Due Date To</label>
            <DatePicker
              selected={dueDateTo}
              onChange={(date) => handleDateChange('due_date_to', date)}
              placeholderText="Select end date"
              isClearable={true}
              minDate={dueDateFrom || undefined}
            />
          </div>
        </div>
        <div className='d-flex justify-content-end mt-3'>
          <button
            type='button'
            className='btn btn-secondary me-2'
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
          <button
            type='button'
            className='btn btn-primary'
            onClick={handleApplyFilters}
            disabled={loadingFilters}
          >
            {loadingFilters ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                Applying...
              </>
            ) : (
              'Apply Filters'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const VideoAssignedListPage: FC = () => {
  const intl = useIntl()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const {currentUser} = useAuth()
  
  const { 
    packages, 
    summary, 
    pagination, 
    loading, 
    loadingFilters,
    error, 
    filters,
    lastFetchTime 
  } = useSelector((state: RootState) => state.assignedVideos)
  
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null)
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [clearTrigger, setClearTrigger] = useState(0)
  
  // Confirmation dialog state
  const [showDeleteVideoDialog, setShowDeleteVideoDialog] = useState(false)
  const [showDeleteStudentDialog, setShowDeleteStudentDialog] = useState(false)
  const [showDeletePackageDialog, setShowDeletePackageDialog] = useState(false)
  const [deleteVideoData, setDeleteVideoData] = useState<{packageId: string, videoId: string, videoTitle: string} | null>(null)
  const [deleteStudentData, setDeleteStudentData] = useState<{packageId: string, studentId: string, studentName: string} | null>(null)
  const [deletePackageData, setDeletePackageData] = useState<{packageId: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Video modal state
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)





  // Get progress bar color based on percentage
  const getProgressBarColor = (progress: number) => {
    if (progress === 0) return 'secondary'
    if (progress >= 50) return 'success'
    if (progress >= 30) return 'warning'
    return 'secondary'
  }

  // Get status color and icon
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
      case 'in_progress': return 'fas fa-play-circle'
      case 'not_started': return 'fas fa-clock'
      case 'overdue': return 'fas fa-exclamation-triangle'
      default: return 'fas fa-question-circle'
    }
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get platform icon
  const getPlatformIcon = (source: number) => {
    if (source === 1) {
      return 'fab fa-youtube text-danger'
    } else if (source === 2) {
      return 'fab fa-vimeo-v text-primary'
    }
    return 'fas fa-video'
  }

  // Fetch data
  const fetchData = useCallback((customFilters?: AssignedVideosFilters) => {
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }

    const filtersToUse = customFilters !== undefined ? customFilters : filters

    apiTimeoutRef.current = setTimeout(() => {
      dispatch(fetchAssignedVideos({
        page: pagination.page,
        items_per_page: pagination.items_per_page,
        filters: filtersToUse
      }))
    }, 300)
  }, [dispatch, pagination.page, pagination.items_per_page, filters])

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchData()
      setIsInitialLoad(false)
    }
  }, [isInitialLoad, fetchData])

  // Fetch when filters or page changes
  useEffect(() => {
    if (!isInitialLoad) {
      fetchData(filters)
    }
  }, [filters, pagination.page, fetchData])

  // Handle card expansion based on filter state when packages are loaded
  useEffect(() => {
    if (packages.length > 0) {
      if (hasActiveFilters(filters)) {
        // Expand all cards when filters are active
        setCollapsedCards(new Set())
      } else {
        // Collapse all cards by default when no filters are active
        setCollapsedCards(new Set(packages.map(pkg => `details-${pkg.package_id}`)))
      }
    }
  }, [packages.length, packages.map(pkg => pkg.package_id).join(','), filters]) // Depend on package IDs and filters

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current)
      }
    }
  }, [])

  // Helper function to check if filters have actual values
  const hasActiveFilters = (filters: AssignedVideosFilters): boolean => {
    return Boolean(
      (filters.search && filters.search.trim() !== '') ||
      (filters.student_ids && filters.student_ids.trim() !== '') ||
      (filters.due_date_from && filters.due_date_from.trim() !== '') ||
      (filters.due_date_to && filters.due_date_to.trim() !== '') ||
      (filters.assigned_date_from && filters.assigned_date_from.trim() !== '') ||
      (filters.assigned_date_to && filters.assigned_date_to.trim() !== '')
    )
  }

  // Toggle card collapse
  const toggleCard = (id: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setPage(page))
  }

  // Handle clear filters
  const handleClearFilters = () => {
    // Trigger force clear in filters component first
    setClearTrigger(prev => prev + 1)
    // Clear Redux state
    dispatch(setFilters({}))
    dispatch(setPage(1))
    dispatch(clearCache())
  }

  // API function to delete a video from assignment
  const deleteVideoFromAssignment = async (packageId: string, videoId: string) => {
    setIsDeleting(true)
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assignments/video`)
      await axios.delete(`${API_URL}/videos/assignments/video`, {
        data: {
          package_id: packageId,
          video_id: videoId
        },
        headers,
        withCredentials: true
      })
      toast.success('Video removed from assignment successfully', 'Success')
      // Refresh the data
      dispatch(fetchAssignedVideos({
        page: pagination.page,
        items_per_page: pagination.items_per_page,
        filters
      }))
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to remove video from assignment'
      toast.error(errorMessage, 'Error')
    } finally {
      setIsDeleting(false)
    }
  }

  // API function to delete students from assignment
  const deleteStudentsFromAssignment = async (packageId: string, studentIds: string[]) => {
    setIsDeleting(true)
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assignments/package`)
      await axios.delete(`${API_URL}/videos/assignments/package`, {
        data: {
          package_id: packageId,
          student_ids: studentIds
        },
        headers,
        withCredentials: true
      })
      toast.success('Student(s) removed from assignment successfully', 'Success')
      // Refresh the data
      dispatch(fetchAssignedVideos({
        page: pagination.page,
        items_per_page: pagination.items_per_page,
        filters
      }))
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to remove student(s) from assignment'
      toast.error(errorMessage, 'Error')
    } finally {
      setIsDeleting(false)
    }
  }

  // API function to delete entire assignment package
  const deleteEntirePackage = async (packageId: string) => {
    setIsDeleting(true)
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assignments/package`)
      await axios.delete(`${API_URL}/videos/assignments/package`, {
        data: {
          package_id: packageId
        },
        headers,
        withCredentials: true
      })
      toast.success('Assignment package deleted successfully', 'Success')
      // Refresh the data
      dispatch(fetchAssignedVideos({
        page: pagination.page,
        items_per_page: pagination.items_per_page,
        filters
      }))
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete assignment package'
      toast.error(errorMessage, 'Error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle video deletion - show confirmation dialog
  const handleDeleteVideo = (packageId: string, videoId: string, videoTitle: string) => {
    setDeleteVideoData({ packageId, videoId, videoTitle })
    setShowDeleteVideoDialog(true)
  }

  // Handle student deletion - show confirmation dialog
  const handleDeleteStudent = (packageId: string, studentId: string, studentName: string) => {
    setDeleteStudentData({ packageId, studentId, studentName })
    setShowDeleteStudentDialog(true)
  }

  // Handle package deletion - show confirmation dialog
  const handleDeletePackage = (packageId: string) => {
    setDeletePackageData({ packageId })
    setShowDeletePackageDialog(true)
  }

  // Confirm video deletion
  const confirmDeleteVideo = () => {
    if (deleteVideoData) {
      deleteVideoFromAssignment(deleteVideoData.packageId, deleteVideoData.videoId)
    }
  }

  // Confirm student deletion
  const confirmDeleteStudent = () => {
    if (deleteStudentData) {
      deleteStudentsFromAssignment(deleteStudentData.packageId, [deleteStudentData.studentId])
    }
  }

  // Confirm package deletion
  const confirmDeletePackage = () => {
    if (deletePackageData) {
      deleteEntirePackage(deletePackageData.packageId)
    }
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }
  
  // Handle video click to open modal
  const handleVideoClick = (assignment: any) => {
    setSelectedVideoId(assignment.video_id)
    setShowVideoModal(true)
  }

  const sortedPackages = useMemo(() => {
    if (!sortConfig) return packages
    
    return [...packages].sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortConfig.key) {
        case 'package_id':
          aValue = a.package_id
          bValue = b.package_id
          break
        case 'unique_videos':
          aValue = a.unique_videos
          bValue = b.unique_videos
          break
        case 'unique_students':
          aValue = a.unique_students
          bValue = b.unique_students
          break
        case 'total_assignments':
          aValue = a.total_assignments
          bValue = b.total_assignments
          break
        case 'assigned_at':
          aValue = new Date(a.assigned_at).getTime()
          bValue = new Date(b.assigned_at).getTime()
          break
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0
          break
        default:
          return 0
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [packages, sortConfig])

  if (loading && isInitialLoad) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{height: '50vh'}}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={[
        {
          title: 'Home',
          path: '/',
          isActive: false,
        },
        {
          title: 'Video Management',
          path: '/videos/list',
          isActive: false,
        },
        {
          title: 'Assigned Videos',
          path: '/videos/assignedlist',
          isActive: true,
        },
      ]}>
        Assigned Videos
      </PageTitle>

      {/* Welcome Section */}
      <div className='assigned-videos-welcome-section'>
        <div className='assigned-videos-welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>Welcome to Your Assigned Videos Hub! 🎬</h2>
            <p className='welcome-subtitle'>Monitor video assignments, track student progress, and manage video packages</p>
          </div>
          <div className='welcome-actions'>
            <button 
              className='btn btn-light-primary me-3 btn-sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className='fas fa-filter me-1'></i>
              {showFilters ? 'Hide Filters' : 'Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && <AssignedVideosFilters onClearFilters={handleClearFilters} clearTrigger={clearTrigger} />}

      {/* Summary Cards */}
      <div className='row g-5 g-xl-8 mb-5'>
        <div className='col-xl-4'>
          <div className='card bg-light-success'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-3'>
                  <div className='symbol-label bg-success'>
                    <i className='fas fa-tasks text-white'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-bold'>Total Assignments</div>
                  <div className='fs-2 fw-bold text-success'>{summary.total_assignments}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xl-4'>
          <div className='card bg-light-primary'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-3'>
                  <div className='symbol-label bg-primary'>
                    <i className='fas fa-users text-white'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-bold'>Unique Students</div>
                  <div className='fs-2 fw-bold text-primary'>{summary.unique_students}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xl-4'>
          <div className='card bg-light-info'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-3'>
                  <div className='symbol-label bg-info'>
                    <i className='fas fa-video text-white'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-bold'>Unique Videos</div>
                  <div className='fs-2 fw-bold text-info'>{summary.unique_videos}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className='card mb-5'>
        <div className='card-header'>
          <div className='d-flex justify-content-between align-items-center'>
            <h3 className='card-title'>Assigned Videos</h3>
          </div>
        </div>
        <div className='card-body'>
          {loading && !isInitialLoad && (
            <div className='d-flex justify-content-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          )}

          {!loading && packages.length === 0 && (
            <div className='text-center py-5'>
              <i className='fas fa-video text-muted fs-1 mb-3'></i>
              <h4>No Assigned Videos</h4>
              <p className='text-muted'>No videos have been assigned yet.</p>
            </div>
          )}

          {!loading && packages.length > 0 && (
            // List View - Horizontal compact layout
            <div className='list-view-container'>
              {sortedPackages.map((videoPackage) => (
                <div key={videoPackage.package_id} className='list-item-card card mb-3 shadow-sm'>
                  <div className='card-body p-3'>
                    <div className='row align-items-center'>
                      {/* Package Info */}
                      <div className='col'>
                        <div className='d-flex flex-column'>
                          <div className='d-flex align-items-center mb-1'>
                            <h5 className='mb-0 me-3'>
                              {(() => {
                                const assignedDate = new Date(videoPackage.assigned_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                                const uniqueVideos = new Map(videoPackage.assignments.map(assignment => [assignment.video_id, assignment]))
                                const firstVideoTitle = Array.from(uniqueVideos.values())[0]?.video_title
                                const videoCount = uniqueVideos.size
                                
                                if (firstVideoTitle && videoCount === 1) {
                                  return firstVideoTitle
                                } else if (firstVideoTitle && videoCount > 1) {
                                  return `${firstVideoTitle} + ${videoCount - 1} more`
                                } else {
                                  return `Video Assignment - ${assignedDate}`
                                }
                              })()}
                            </h5>
                          </div>
                          <div className='text-muted small mb-2'>
                            Assigned on {formatApiTimestamp(videoPackage.assigned_at, { format: 'date' })}
                            {videoPackage.due_date && (
                              <> • Due: {formatApiTimestamp(videoPackage.due_date, { format: 'date' })}</>
                            )}
                          </div>
                          {videoPackage.message_for_student && (
                            <div className='alert alert-light-info p-2 mb-2'>
                              <i className='fas fa-comment me-2 text-info'></i>
                              <span className='small' dangerouslySetInnerHTML={{ __html: videoPackage.message_for_student }}></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className='col-auto'>
                        <div className='d-flex gap-4'>
                          <div className='text-center'>
                            <div className='fs-3 fw-bold text-primary'>{videoPackage.unique_videos}</div>
                            <div className='text-muted small'>Videos</div>
                          </div>
                          <div className='text-center'>
                            <div className='fs-3 fw-bold text-success'>{videoPackage.unique_students}</div>
                            <div className='text-muted small'>Students</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='col-auto'>
                        <div className='d-flex gap-2'>
                          <button
                            type='button'
                            className='btn btn-sm btn-light-primary'
                            onClick={() => toggleCard(`details-${videoPackage.package_id}`)}
                            title={collapsedCards.has(`details-${videoPackage.package_id}`) ? 'Show Details' : 'Hide Details'}
                          >
                            <i className={`fas fa-chevron-${collapsedCards.has(`details-${videoPackage.package_id}`) ? 'down' : 'up'}`}></i>
                          </button>
                         
                          {isTeachingStaff(currentUser?.role?.role_type) && (
                            <button
                              type='button'
                              className='btn btn-sm btn-danger'
                              onClick={() => handleDeletePackage(videoPackage.package_id)}
                              title='Delete Assignment Package'
                            >
                              <i className='fas fa-trash'></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {!collapsedCards.has(`details-${videoPackage.package_id}`) && (
                      <div className='mt-3 pt-3 border-top'>
                        <div className='row'>
                          {/* Videos */}
                          <div className='col-md-6'>
                            <h6 className='text-primary mb-3'>
                              <i className='fas fa-video me-2'></i>
                              Videos ({new Map(videoPackage.assignments.map(assignment => [assignment.video_id, assignment])).size})
                            </h6>
                            <div className='list-videos-horizontal'>
                              {Array.from(new Map(videoPackage.assignments.map(assignment => [assignment.video_id, assignment])).values()).slice(0, 3).map((assignment) => {
                                const uniqueVideos = new Map(videoPackage.assignments.map(a => [a.video_id, a])).size
                                return (
                                  <div 
                                    key={assignment.video_id} 
                                    className='d-flex align-items-center p-2 bg-light rounded mb-2 video-card-clickable'
                                    onClick={() => handleVideoClick(assignment)}
                                    style={{cursor: 'pointer'}}
                                  >
                                    <img
                                      src={assignment.video_thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                                      alt={assignment.video_title}
                                      className='rounded me-3'
                                      style={{width: '50px', height: '35px', objectFit: 'cover'}}
                                    />
                                    <div className='flex-grow-1'>
                                      <div className='fw-semibold small text-truncate' title={assignment.video_title}>
                                        {assignment.video_title}
                                      </div>
                                    </div>
                                    {uniqueVideos > 1 && isTeachingStaff(currentUser?.role?.role_type) && (
                                      <button
                                        type='button'
                                        className='btn btn-sm btn-light-danger ms-2'
                                        onClick={() => handleDeleteVideo(videoPackage.package_id, assignment.video_id, assignment.video_title)}
                                        title='Remove video from assignment'
                                      >
                                        <i className='fas fa-trash'></i>
                                      </button>
                                    )}
                                  </div>
                                )
                              })}
                              {new Map(videoPackage.assignments.map(assignment => [assignment.video_id, assignment])).size > 3 && (
                                <div className='text-muted small'>
                                  + {new Map(videoPackage.assignments.map(assignment => [assignment.video_id, assignment])).size - 3} more videos
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Students */}
                          <div className='col-md-6'>
                            <h6 className='text-success mb-3'>
                              <i className='fas fa-users me-2'></i>
                              Students ({Array.from(new Set(videoPackage.assignments.map(a => a.student_name))).length})
                            </h6>
                            <div className='list-students-horizontal'>
                              {Array.from(new Map(videoPackage.assignments.map(a => [a.student_id, {id: a.student_id, name: a.student_name}])).values()).slice(0, 4).map((student, index) => {
                                const uniqueStudents = Array.from(new Set(videoPackage.assignments.map(a => a.student_id))).length
                                return (
                                  <div key={student.id} className='d-flex align-items-center p-2 bg-light rounded mb-2'>
                                    <div className='symbol symbol-35px me-3'>
                                      <div className='symbol-label bg-light-success'>
                                        <i className='fas fa-user text-success'></i>
                                      </div>
                                    </div>
                                    <div className='flex-grow-1'>
                                      <div className='fw-semibold small'>{student.name}</div>
                                      <div className='text-muted smaller'>Student {index + 1}</div>
                                    </div>
                                    {uniqueStudents > 1 && isTeachingStaff(currentUser?.role?.role_type) && (
                                      <button
                                        type='button'
                                        className='btn btn-sm btn-light-danger ms-2'
                                        onClick={() => handleDeleteStudent(videoPackage.package_id, student.id, student.name)}
                                        title='Remove student from assignment'
                                      >
                                        <i className='fas fa-trash'></i>
                                      </button>
                                    )}
                                  </div>
                                )
                              })}
                              {Array.from(new Set(videoPackage.assignments.map(a => a.student_name))).length > 4 && (
                                <div className='text-muted small'>
                                  + {Array.from(new Set(videoPackage.assignments.map(a => a.student_name))).length - 4} more students
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className='d-flex justify-content-center'>
          <nav>
            <ul className='pagination'>
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className='page-link'
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <i className='fas fa-angle-left'></i>
                </button>
              </li>
              
              {Array.from({length: Math.min(5, pagination.total_pages)}, (_, i) => {
                const page = i + 1
                return (
                  <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                    <button
                      className='page-link'
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              })}
              
              <li className={`page-item ${pagination.page === pagination.total_pages ? 'disabled' : ''}`}>
                <button
                  className='page-link'
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                >
                  <i className='fas fa-angle-right'></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        show={showDeleteVideoDialog}
        onHide={() => {
          setShowDeleteVideoDialog(false)
          setDeleteVideoData(null)
        }}
        onConfirm={confirmDeleteVideo}
        title="Remove Video from Assignment"
        message={`Are you sure you want to remove "${deleteVideoData?.videoTitle}" from this assignment package? This action cannot be undone.`}
        confirmText="Remove Video"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        loadingText="Removing video..."
      />

      <ConfirmationDialog
        show={showDeleteStudentDialog}
        onHide={() => {
          setShowDeleteStudentDialog(false)
          setDeleteStudentData(null)
        }}
        onConfirm={confirmDeleteStudent}
        title="Remove Student from Assignment"
        message={`Are you sure you want to remove "${deleteStudentData?.studentName}" from this assignment package? This action cannot be undone.`}
        confirmText="Remove Student"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        loadingText="Removing student..."
      />

      <ConfirmationDialog
        show={showDeletePackageDialog}
        onHide={() => {
          setShowDeletePackageDialog(false)
          setDeletePackageData(null)
        }}
        onConfirm={confirmDeletePackage}
        title="Delete Assignment Package"
        message="Are you sure you want to delete this entire assignment package? This will remove all videos and students from this assignment. This action cannot be undone."
        confirmText="Delete Package"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        loadingText="Deleting package..."
      />

      {/* Video Detail Modal */}
      <VideoDetailModal
        videoId={selectedVideoId}
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false)
          setSelectedVideoId(null)
        }}
        isTeachingStaff={isTeachingStaff(currentUser?.role?.role_type)}
      />

    </>
  )
}

export default VideoAssignedListPage 