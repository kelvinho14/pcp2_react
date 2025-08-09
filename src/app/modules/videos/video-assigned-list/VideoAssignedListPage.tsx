import {FC, useState, useEffect, useMemo, useRef, useCallback, memo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {AppDispatch, RootState, store} from '../../../../store'
import {fetchAssignedVideos, setPage, setFilters, setLoadingFilters, clearCache, AssignedVideo} from '../../../../store/videos/assignedVideosSlice'
import {ASSIGNMENT_STATUS, getStatusLabel, getStatusColor, AssignmentStatus} from '../../../constants/assignmentStatus'
import {useNavigate} from 'react-router-dom'
import {KTIcon} from '../../../../_metronic/helpers'
import {useAuth} from '../../../../app/modules/auth'
import {isTeachingStaff} from '../../../constants/roles'
import VideoPreview from '../../../../components/Video/VideoPreview'
import {fetchTeacherVideos, Video} from '../../../../store/videos/videosSlice'
import {StudentSelectionTable} from '../../../../app/modules/exercises/exercise-list/components/header/StudentSelectionTable'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'
import {DatePicker} from '../../../../_metronic/helpers/components/DatePicker'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import {toast} from '../../../../_metronic/helpers/toast'
import './VideoAssignedListPage.scss'

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
const AssignedVideosFilters: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {filters, loadingFilters} = useSelector((state: RootState) => state.assignedVideos)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    dispatch(setLoadingFilters(true))
    dispatch(setFilters(localFilters))
    dispatch(setPage(1))
    dispatch(clearCache())
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    dispatch(setFilters({}))
    dispatch(setPage(1))
    dispatch(clearCache())
  }

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
            <label className='form-label'>Status</label>
            <select
              className='form-select'
              value={localFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value=''>All Status</option>
              <option value='not_started'>Not Started</option>
              <option value='in_progress'>In Progress</option>
              <option value='completed'>Completed</option>
              <option value='overdue'>Overdue</option>
            </select>
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Assigned By</label>
            <input
              type='text'
              className='form-control'
              placeholder='Teacher name...'
              value={localFilters.assigned_by || ''}
              onChange={(e) => handleFilterChange('assigned_by', e.target.value)}
            />
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Assigned To</label>
            <input
              type='text'
              className='form-control'
              placeholder='Student name...'
              value={localFilters.assigned_to || ''}
              onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
            />
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Due Date From</label>
            <input
              type='date'
              className='form-control'
              value={localFilters.due_date_from || ''}
              onChange={(e) => handleFilterChange('due_date_from', e.target.value)}
            />
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Due Date To</label>
            <input
              type='date'
              className='form-control'
              value={localFilters.due_date_to || ''}
              onChange={(e) => handleFilterChange('due_date_to', e.target.value)}
            />
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Assigned Date From</label>
            <input
              type='date'
              className='form-control'
              value={localFilters.assigned_date_from || ''}
              onChange={(e) => handleFilterChange('assigned_date_from', e.target.value)}
            />
          </div>
          <div className='col-md-3'>
            <label className='form-label'>Assigned Date To</label>
            <input
              type='date'
              className='form-control'
              value={localFilters.assigned_date_to || ''}
              onChange={(e) => handleFilterChange('assigned_date_to', e.target.value)}
            />
          </div>
        </div>
        <div className='d-flex justify-content-end mt-3'>
          <button
            type='button'
            className='btn btn-secondary me-2'
            onClick={handleClearFilters}
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
    videos, 
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
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const filtersRef = useRef(filters)

  // State for video assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [assignmentDueDate, setAssignmentDueDate] = useState<Date | null>(null)
  const [assignmentMessage, setAssignmentMessage] = useState<string>('')
  const [videoSearchTerm, setVideoSearchTerm] = useState('')
  const [availableVideos, setAvailableVideos] = useState<Video[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [searchingVideos, setSearchingVideos] = useState(false)

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
  const fetchData = useCallback(() => {
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current)
    }

    apiTimeoutRef.current = setTimeout(() => {
      dispatch(fetchAssignedVideos({
        page: pagination.page,
        items_per_page: pagination.items_per_page,
        filters: filtersRef.current
      }))
    }, 300)
  }, [dispatch, pagination.page, pagination.items_per_page])

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
      fetchData()
    }
  }, [filters, pagination.page, fetchData])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current)
      }
    }
  }, [])

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

  // Handle assign modal open
  const handleAssignModalOpen = () => {
    setShowAssignModal(true)
    setSelectedStudents([])
    setAssignmentDueDate(null)
    setAssignmentMessage('')
    setVideoSearchTerm('')
    setAvailableVideos([])
    setSelectedVideos([])
  }

  // Handle student selection
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  // Handle video selection
  const handleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  // Search videos
  const handleVideoSearch = async (searchTerm: string) => {
    setVideoSearchTerm(searchTerm)
    if (searchTerm.trim()) {
      setSearchingVideos(true)
      try {
        await dispatch(fetchTeacherVideos({
          page: 1,
          items_per_page: 50,
          search: searchTerm,
        })).unwrap()
        // Get the videos from the store
        const state = store.getState()
        setAvailableVideos(state.videos.videos)
      } catch (error) {
        console.error('Error searching videos:', error)
      } finally {
        setSearchingVideos(false)
      }
    } else {
      setAvailableVideos([])
    }
  }

  // Handle video assignment
  const handleAssignVideos = async () => {
    if (selectedStudents.length === 0) {
      toast.warning('Please select at least one student', 'Warning')
      return
    }

    if (selectedVideos.length === 0) {
      toast.warning('Please select at least one video', 'Warning')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_APP_API_URL
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assign`)
      
      // Assign each video to selected students
      for (const videoId of selectedVideos) {
        const assignmentData = {
          student_ids: selectedStudents,
          video_id: videoId,
          due_date: assignmentDueDate ? new Date(assignmentDueDate.getFullYear(), assignmentDueDate.getMonth(), assignmentDueDate.getDate(), 23, 59, 59).toISOString() : undefined,
          message_for_student: assignmentMessage.trim() || undefined,
        }

        await axios.post(`${API_URL}/videos/assign`, assignmentData, {
          headers,
          withCredentials: true
        })
      }

      toast.success('Videos assigned successfully!', 'Success')
      setShowAssignModal(false)
      setSelectedStudents([])
      setAssignmentDueDate(null)
      setAssignmentMessage('')
      setVideoSearchTerm('')
      setAvailableVideos([])
      setSelectedVideos([])
      
      // Refresh the assigned videos list
      fetchData()
    } catch (error: any) {
      console.error('Error assigning videos:', error)
      const errorMessage = error.response?.data?.message || 'Failed to assign videos'
      toast.error(errorMessage, 'Error')
    }
  }

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

      {/* Summary Cards */}
      <div className='row g-5 g-xl-8 mb-5'>
        <div className='col-xl-3'>
          <div className='card bg-light-primary'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-3'>
                  <div className='symbol-label bg-primary'>
                    <i className='fas fa-video text-white'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-bold'>Total Assigned</div>
                  <div className='fs-2 fw-bold text-primary'>{summary.total}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xl-3'>
          <div className='card bg-light-warning'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-3'>
                  <div className='symbol-label bg-warning'>
                    <i className='fas fa-clock text-white'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-bold'>Not Started</div>
                  <div className='fs-2 fw-bold text-warning'>{summary.not_started}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xl-3'>
          <div className='card bg-light-info'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-3'>
                  <div className='symbol-label bg-info'>
                    <i className='fas fa-play-circle text-white'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-bold'>In Progress</div>
                  <div className='fs-2 fw-bold text-info'>{summary.in_progress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xl-3'>
          <div className='card bg-light-success'>
            <div className='card-body'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-50px me-3'>
                  <div className='symbol-label bg-success'>
                    <i className='fas fa-check-circle text-white'></i>
                  </div>
                </div>
                <div>
                  <div className='fs-6 text-muted fw-bold'>Completed</div>
                  <div className='fs-2 fw-bold text-success'>{summary.completed}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && <AssignedVideosFilters />}

      {/* Controls */}
      <div className='card mb-5'>
        <div className='card-header'>
          <div className='d-flex justify-content-between align-items-center'>
            <h3 className='card-title'>Assigned Videos</h3>
            <div className='d-flex gap-2'>
              {isTeachingStaff(currentUser?.role?.role_type) && (
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleAssignModalOpen}
                >
                  <i className='fas fa-user-plus me-2'></i>
                  Assign Video
                </button>
              )}
              <button
                type='button'
                className='btn btn-light-primary'
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className='fas fa-filter me-2'></i>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className='btn-group'>
                <button
                  type='button'
                  className={`btn btn-sm ${selectedView === 'grid' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setSelectedView('grid')}
                >
                  <i className='fas fa-th-large'></i>
                </button>
                <button
                  type='button'
                  className={`btn btn-sm ${selectedView === 'list' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setSelectedView('list')}
                >
                  <i className='fas fa-list'></i>
                </button>
              </div>
            </div>
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

          {!loading && videos.length === 0 && (
            <div className='text-center py-5'>
              <i className='fas fa-video text-muted fs-1 mb-3'></i>
              <h4>No Assigned Videos</h4>
              <p className='text-muted'>No videos have been assigned yet.</p>
            </div>
          )}

          {!loading && videos.length > 0 && (
            <div className={selectedView === 'grid' ? 'row g-4' : ''}>
              {videos.map((assignment) => (
                <div key={assignment.id} className={selectedView === 'grid' ? 'col-md-6 col-lg-4' : 'mb-4'}>
                  <div className='card h-100'>
                    <div className='card-header'>
                      <div className='d-flex justify-content-between align-items-center'>
                        <h6 className='card-title mb-0 text-truncate' title={assignment.video_title}>
                          {assignment.video_title}
                        </h6>
                        <div className='dropdown'>
                          <button
                            className='btn btn-sm btn-light'
                            type='button'
                            data-bs-toggle='dropdown'
                          >
                            <i className='fas fa-ellipsis-v'></i>
                          </button>
                          <ul className='dropdown-menu'>
                            <li>
                              <button
                                className='dropdown-item'
                                onClick={() => navigate(`/videos/${assignment.video_id}`)}
                              >
                                <i className='fas fa-eye me-2'></i>
                                View Video
                              </button>
                            </li>
                            {isTeachingStaff(currentUser?.role?.role_type) && (
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() => navigate(`/videos/${assignment.video_id}`)}
                                >
                                  <i className='fas fa-edit me-2'></i>
                                  Edit Assignment
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className='card-body'>
                      {/* Video Thumbnail */}
                      <div className='mb-3'>
                        <img
                          src={assignment.video_thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                          alt={assignment.video_title}
                          className='img-fluid rounded'
                          style={{width: '100%', height: '120px', objectFit: 'cover'}}
                        />
                      </div>

                      {/* Status and Progress */}
                      <div className='mb-3'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <span className={`badge badge-light-${getStatusColor(assignment.status)}`}>
                            <i className={`${getStatusIcon(assignment.status)} me-1`}></i>
                                                         {getStatusLabel(assignment.status as unknown as AssignmentStatus)}
                          </span>
                          <span className='text-muted small'>
                            {assignment.progress_percentage}% Complete
                          </span>
                        </div>
                        <div className='progress' style={{height: '8px'}}>
                          <div
                            className={`progress-bar bg-${getProgressBarColor(assignment.progress_percentage)}`}
                            style={{width: `${assignment.progress_percentage}%`}}
                          ></div>
                        </div>
                      </div>

                      {/* Assignment Details */}
                      <div className='mb-3'>
                        <div className='d-flex align-items-center mb-2'>
                          <i className='fas fa-user me-2 text-muted'></i>
                          <span className='small'>
                            <strong>Student:</strong> {assignment.assigned_to_name}
                          </span>
                        </div>
                        <div className='d-flex align-items-center mb-2'>
                          <i className='fas fa-user-tie me-2 text-muted'></i>
                          <span className='small'>
                            <strong>Assigned by:</strong> {assignment.assigned_by_name}
                          </span>
                        </div>
                        {assignment.due_date && (
                          <div className='d-flex align-items-center mb-2'>
                            <i className='fas fa-calendar me-2 text-muted'></i>
                            <span className='small'>
                              <strong>Due:</strong> {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className='d-flex align-items-center'>
                          <i className='fas fa-clock me-2 text-muted'></i>
                          <span className='small'>
                            <strong>Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className='mb-3'>
                        <div className='d-flex align-items-center mb-1'>
                          <i className={`${getPlatformIcon(assignment.video_source)} me-2`}></i>
                          <span className='small'>
                            {assignment.video_source === 1 ? 'YouTube' : 'Vimeo'}
                          </span>
                        </div>
                        {assignment.video_duration && (
                          <div className='d-flex align-items-center'>
                            <i className='fas fa-clock me-2 text-muted'></i>
                            <span className='small'>
                              Duration: {formatDuration(assignment.video_duration)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {assignment.message_for_student && (
                        <div className='mb-3'>
                          <div className='alert alert-info py-2'>
                            <i className='fas fa-comment me-2'></i>
                            <span className='small'>{assignment.message_for_student}</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className='d-flex gap-2'>
                        <button
                          type='button'
                          className='btn btn-primary btn-sm flex-fill'
                          onClick={() => navigate(`/videos/${assignment.video_id}`)}
                        >
                          <i className='fas fa-play me-1'></i>
                          Watch Video
                        </button>
                        {isTeachingStaff(currentUser?.role?.role_type) && (
                          <button
                            type='button'
                            className='btn btn-outline-secondary btn-sm'
                            onClick={() => navigate(`/videos/${assignment.video_id}`)}
                          >
                            <i className='fas fa-eye'></i>
                          </button>
                        )}
                      </div>
                    </div>
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

      {/* Video Assignment Modal */}
      {showAssignModal && (
        <div className='modal fade show d-block' style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Videos to Students</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className='row'>
                  {/* Video Selection */}
                  <div className='col-md-6'>
                    <div className='mb-4'>
                      <label className='form-label fw-bold'>Search and Select Videos</label>
                      <div className='input-group mb-3'>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Search videos...'
                          value={videoSearchTerm}
                          onChange={(e) => handleVideoSearch(e.target.value)}
                        />
                        <button
                          className='btn btn-outline-secondary'
                          type='button'
                          onClick={() => handleVideoSearch(videoSearchTerm)}
                          disabled={searchingVideos}
                        >
                          {searchingVideos ? (
                            <span className='spinner-border spinner-border-sm' role='status'></span>
                          ) : (
                            <i className='fas fa-search'></i>
                          )}
                        </button>
                      </div>
                      
                      {availableVideos.length > 0 && (
                        <div className='border rounded p-3' style={{maxHeight: '300px', overflowY: 'auto'}}>
                          <h6 className='mb-3'>Available Videos</h6>
                          {availableVideos.map((video) => (
                            <div key={video.video_id} className='d-flex align-items-center mb-2 p-2 border rounded'>
                              <input
                                type='checkbox'
                                className='form-check-input me-2'
                                checked={selectedVideos.includes(video.video_id)}
                                onChange={() => handleVideoSelection(video.video_id)}
                              />
                              <div className='flex-grow-1'>
                                <div className='fw-bold small'>{video.title}</div>
                                <div className='text-muted small'>
                                  {video.source === 1 ? 'YouTube' : 'Vimeo'} • {video.duration ? formatDuration(video.duration) : 'Unknown duration'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {selectedVideos.length > 0 && (
                        <div className='mt-3'>
                          <h6 className='text-success'>Selected Videos: {selectedVideos.length}</h6>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Selection */}
                  <div className='col-md-6'>
                    <div className='mb-4'>
                      <label className='form-label fw-bold'>Select Students</label>
                      <div style={{position: 'relative', zIndex: 2000}}>
                        <StudentSelectionTable 
                          exerciseIds={selectedVideos} // Pass selected video IDs as exercise IDs for compatibility
                          search="" 
                          selectedUsers={selectedStudents}
                          onUserSelectionChange={handleStudentSelection}
                        />
                      </div>
                    </div>

                    <div className='mb-4'>
                      <label className='form-label fw-bold'>Due Date (Optional)</label>
                      <div style={{position: 'relative', zIndex: 1000}}>
                        <DatePicker
                          selected={assignmentDueDate}
                          onChange={(date: Date | null) => setAssignmentDueDate(date)}
                          placeholderText="Select due date"
                          minDate={new Date()}
                          isClearable={true}
                          dayClassName={(date) => 
                            date.getTime() === assignmentDueDate?.getTime() ? 'bg-primary text-white' : ''
                          }
                        />
                      </div>
                    </div>

                    <div className='mb-4'>
                      <label className='form-label fw-bold'>Message for Students (Optional)</label>
                      <div style={{position: 'relative', zIndex: 1}}>
                        <TinyMCEEditor
                          value={assignmentMessage}
                          onChange={setAssignmentMessage}
                          placeholder='Enter a message for your students...'
                          height={200}
                        />
                      </div>
                      <div className='form-text'>This message will be shown to students when they access the videos</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowAssignModal(false)
                  setSelectedStudents([])
                  setAssignmentDueDate(null)
                  setAssignmentMessage('')
                  setVideoSearchTerm('')
                  setAvailableVideos([])
                  setSelectedVideos([])
                }}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAssignVideos}>
                  Assign Videos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoAssignedListPage 