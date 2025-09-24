import {FC, useEffect, useState, useCallback, useRef} from 'react'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState, store} from '../../../../store'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../../../app/modules/auth'
import {isTeachingStaff} from '../../../../app/constants/roles'
import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import {
  fetchTeacherVideos,
  createVideo,
  createMultipleVideos,
  updateVideo,
  deleteVideo,
  fetchVimeoFolders,
  fetchVimeoFolderContents,
  toggleVimeoFolder,
  fetchYouTubeMetadata,
  clearMessages,
  clearVimeoData,
  Video,
  VideoFormData,
  VideoTag,
  VimeoFolder,
  VimeoVideo,
  extractVideoId,
  assignVideosToStudents,
  fetchVideos,
  fetchVideoTags,
} from '../../../../store/videos/videosSlice'
import {fetchTags} from '../../../../store/tags/tagsSlice'
import {fetchGroups} from '../../../../store/groups/groupsSlice'
import VideoTagInput, {VideoTagData} from '../../../../components/Video/VideoTagInput'
import {toast} from '../../../../_metronic/helpers/toast'
import {KTIcon} from '../../../../_metronic/helpers'
import {formatApiTimestamp} from '../../../../_metronic/helpers/dateUtils'
import {ConfirmationDialog} from '../../../../_metronic/helpers/ConfirmationDialog'
import VideoDetailModal from '../../../../components/Video/VideoDetailModal'
import {StudentSelectionTable} from '../../../../app/modules/exercises/exercise-list/components/header/StudentSelectionTable'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'
import {DatePicker} from '../../../../_metronic/helpers/components/DatePicker'
import {Modal, Button} from 'react-bootstrap'
import VimeoFolderTree from './VimeoFolderTree'
import './TeacherVideoListPage.css'
import Select from 'react-select'

// Constants for better performance

const TeacherVideoListPage: FC = () => {
  const intl = useIntl()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const {currentUser} = useAuth()
  const {
    videos, 
    loading, 
    creating, 
    updating, 
    deleting, 
    error, 
    success, 
    total,
    vimeoFolders,
    vimeoFolderContents,
    fetchingVimeoFolders,
    fetchingVimeoContents,
    youtubeMetadata,
    fetchingYouTubeMetadata,
    assigning,
    videoTags,
    fetchingVideoTags
  } = useSelector((state: RootState) => state.videos)
  
  const {tags} = useSelector((state: RootState) => state.tags)
  const {groups, loading: groupsLoading} = useSelector((state: RootState) => state.groups)

  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [platformFilter, setPlatformFilter] = useState<'youtube' | 'vimeo' | ''>('')
  const [statusFilter, setStatusFilter] = useState<1 | 2 | ''>('') // 1 = private, 2 = public
  const [tagFilter, setTagFilter] = useState<string[]>([])

  // State for modal
  const [showModal, setShowModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState<VideoFormData>({
    source: 1,
    tags: [],
    youtube_urls: [],
    vimeo_ids: [],
    status: 1,
  })
  
  // State for video detail modal
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  
  // State for step-by-step modal
  const [modalStep, setModalStep] = useState<'platform' | 'youtube' | 'vimeo'>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<'youtube' | 'vimeo' | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeTags, setYoutubeTags] = useState<VideoTagData[]>([])
  const [vimeoTags, setVimeoTags] = useState<VideoTagData[]>([])
  const [youtubeStatus, setYoutubeStatus] = useState<1 | 2>(1) // 1 = assign only, 2 = open to students
  const [vimeoStatus, setVimeoStatus] = useState<1 | 2>(1) // 1 = assign only, 2 = open to students
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedVimeoVideos, setSelectedVimeoVideos] = useState<Set<string>>(new Set())

  // State for delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)

  // State for video assignment
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [videoToAssign, setVideoToAssign] = useState<Video | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [assignmentDueDate, setAssignmentDueDate] = useState<Date | null>(null)
  const [assignmentMessage, setAssignmentMessage] = useState<string>('')

  // State for bulk video assignment
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false)
  const [bulkSelectedStudents, setBulkSelectedStudents] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [bulkAssignmentDueDate, setBulkAssignmentDueDate] = useState<Date | null>(null)
  const [bulkAssignmentMessage, setBulkAssignmentMessage] = useState<string>('')
  const [videoSearchTerm, setVideoSearchTerm] = useState('')
  const [availableVideos, setAvailableVideos] = useState<Video[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [searchingVideos, setSearchingVideos] = useState(false)

  // Fetch videos on component mount and when filters change
  useEffect(() => {
          dispatch(fetchTeacherVideos({
        page: currentPage,
        items_per_page: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
        search: debouncedSearchTerm || undefined,
        source: getSourceFromPlatform(platformFilter),
        status: statusFilter || undefined,
        tags: tagFilter.length > 0 ? tagFilter : undefined,
      }))
  }, [dispatch, currentPage, itemsPerPage, sortBy, sortOrder, debouncedSearchTerm, platformFilter, statusFilter, tagFilter])

  // Fetch tags on component mount
  useEffect(() => {
    dispatch(fetchTags())
    dispatch(fetchVideoTags())
  }, [dispatch])

  // Effect to handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Effect to fetch groups when bulk assignment modal opens
  useEffect(() => {
    if (showBulkAssignModal) {
      dispatch(fetchGroups({ page: 1, items_per_page: 1000 }))
    }
  }, [showBulkAssignModal, dispatch])

  // Effect to fetch groups when single assignment modal opens
  useEffect(() => {
    if (showAssignModal) {
      dispatch(fetchGroups({ page: 1, items_per_page: 1000 }))
    }
  }, [showAssignModal, dispatch])

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearMessages())
      dispatch(clearVimeoData())
      
      // Cleanup search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [dispatch])

  // Cleanup search timeout when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only validate URL for YouTube videos
    if (editingVideo?.source === 1 || (!editingVideo && formData.source === 1)) {
      const url = formData.youtube_urls?.[0] || ''
      const videoInfo = extractVideoId(url)
      if (!videoInfo || videoInfo.platform !== 'youtube') {
        toast.error('Please enter a valid YouTube URL', 'Error')
        return
      }
    }

    try {
      if (editingVideo) {
        await dispatch(updateVideo({
          videoId: editingVideo.video_id,
          videoData: formData,
        })).unwrap()
      } else {
        await dispatch(createVideo(formData)).unwrap()
      }
      
      setShowModal(false)
      setEditingVideo(null)
      setFormData({
        source: 1,
        tags: [],
        youtube_urls: [],
        vimeo_ids: [],
        status: 1,
      })
    } catch (error) {
      // Error is handled by the thunk
    }
  }

  // Handle platform selection
  const handlePlatformSelect = (platform: 'youtube' | 'vimeo') => {
    setSelectedPlatform(platform)
    setModalStep(platform)
    
    if (platform === 'vimeo') {
      dispatch(fetchVimeoFolders())
    }
  }

  // Handle YouTube URL change and fetch metadata
  const handleYoutubeUrlChange = async (url: string) => {
    setYoutubeUrl(url)
    
    if (url.trim()) {
      const videoInfo = extractVideoId(url)
      if (videoInfo && videoInfo.platform === 'youtube') {
        try {
          await dispatch(fetchYouTubeMetadata(url)).unwrap()
        } catch (error) {
          // Error is handled by the thunk
        }
      }
    }
  }

  // Handle YouTube URL submission
  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL', 'Error')
      return
    }

    const videoInfo = extractVideoId(youtubeUrl)
    if (!videoInfo || videoInfo.platform !== 'youtube') {
      toast.error('Please enter a valid YouTube URL', 'Error')
      return
    }

    try {
              await dispatch(createVideo({
          source: 1,
          tags: youtubeTags.map(tag => {
            // If tag has isNew flag or id starts with 'new-', it's a new tag
            if (tag.isNew || tag.id.startsWith('new-')) {
              return { name: tag.name }
            } else {
              return { tag_id: tag.id }
            }
          }),
          youtube_urls: [youtubeUrl],
          status: youtubeStatus,
        })).unwrap()
      
      // Refresh the video list to show the latest data
      dispatch(fetchTeacherVideos({
        page: currentPage,
        items_per_page: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
        search: searchTerm || undefined,
        source: getSourceFromPlatform(platformFilter),
        status: statusFilter || undefined,
        tags: tagFilter.length > 0 ? tagFilter : undefined,
      }))
      
      setShowModal(false)
      setModalStep('platform')
      setSelectedPlatform(null)
      setYoutubeUrl('')
      setYoutubeTags([])
    } catch (error) {
      // Error is handled by the thunk
    }
  }

  // Handle Vimeo folder expansion
  const handleFolderExpand = (folderUri: string) => {
    const newExpanded = new Set(expandedFolders)
    const isCurrentlyExpanded = newExpanded.has(folderUri)
    
    if (isCurrentlyExpanded) {
      // Collapsing - just remove from expanded set
      newExpanded.delete(folderUri)
    } else {
      // Expanding - add to expanded set and fetch contents if not already loaded
      newExpanded.add(folderUri)
      if (!vimeoFolderContents[folderUri]) {
        dispatch(fetchVimeoFolderContents(folderUri))
      }
    }
    
    setExpandedFolders(newExpanded)
  }

  // Handle Vimeo video selection
  const handleVimeoVideoSelect = (videoUri: string) => {
    const newSelected = new Set(selectedVimeoVideos)
    if (newSelected.has(videoUri)) {
      newSelected.delete(videoUri)
    } else {
      newSelected.add(videoUri)
    }
    setSelectedVimeoVideos(newSelected)
  }

  // Handle Vimeo videos submission
  const handleVimeoSubmit = async () => {
    if (selectedVimeoVideos.size === 0) {
      toast.error('Please select at least one video', 'Error')
      return
    }

    try {
      // Collect all selected video IDs
      const selectedVideoIds: string[] = []
      
      for (const folderUri of Object.keys(vimeoFolderContents)) {
        const contents = vimeoFolderContents[folderUri]
        const videos = contents?.videos || []
        for (const video of videos) {
          if (selectedVimeoVideos.has(video.uri)) {
            const videoId = video.uri.split('/').pop() || ''
            if (videoId) {
              selectedVideoIds.push(videoId)
            }
          }
        }
      }

      // Make single API call with all selected video IDs
      await dispatch(createVideo({
        source: 2,
        tags: vimeoTags.map(tag => {
          // If tag has isNew flag or id starts with 'new-', it's a new tag
          if (tag.isNew || tag.id.startsWith('new-')) {
            return { name: tag.name }
          } else {
            return { tag_id: tag.id }
          }
        }),
        vimeo_ids: selectedVideoIds,
        status: vimeoStatus,
      })).unwrap()
      
      // Refresh the video list to show the latest data
      dispatch(fetchTeacherVideos({
        page: currentPage,
        items_per_page: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
        search: searchTerm || undefined,
        source: getSourceFromPlatform(platformFilter),
        status: statusFilter || undefined,
        tags: tagFilter.length > 0 ? tagFilter : undefined,
      }))
      
      setShowModal(false)
      setModalStep('platform')
      setSelectedPlatform(null)
      setExpandedFolders(new Set())
      setSelectedVimeoVideos(new Set())
    } catch (error) {
      // Error is handled by the thunk
    }
  }

  // Reset modal state
  const resetModal = () => {
    setShowModal(false)
    setModalStep('platform')
    setSelectedPlatform(null)
    setYoutubeUrl('')
    setYoutubeTags([])
    setVimeoTags([])
    setYoutubeStatus(1)
    setVimeoStatus(1)
    setExpandedFolders(new Set())
    setSelectedVimeoVideos(new Set())
    setEditingVideo(null)
    setFormData({
      source: 1,
      tags: [],
      youtube_urls: [],
      vimeo_ids: [],
      status: 1,
    })
  }

  // Handle edit video
  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      source: video.source,
      tags: video.tags?.map(tag => ({ tag_id: tag.tag_id })) || [],
      youtube_urls: video.source === 1 ? [`https://www.youtube.com/watch?v=${video.video_id_external}`] : [],
      vimeo_ids: video.source === 2 ? [video.video_id_external] : [],
      status: video.status,
    })
    setModalStep('platform')
    setShowModal(true)
  }

  // Handle delete video
  const handleDelete = async () => {
    if (!videoToDelete) return
    
    try {
      await dispatch(deleteVideo(videoToDelete)).unwrap()
      setShowDeleteDialog(false)
      setVideoToDelete(null)
      // Refresh the video list to show the latest data
      dispatch(fetchTeacherVideos({
        page: currentPage,
        items_per_page: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
        search: searchTerm || undefined,
        source: getSourceFromPlatform(platformFilter),
        status: statusFilter || undefined,
        tags: tagFilter.length > 0 ? tagFilter : undefined,
      }))
    } catch (error) {
      // Error is handled by the thunk
    }
  }

  // Handle delete click
  const handleDeleteClick = (videoId: string) => {
    setVideoToDelete(videoId)
    setShowDeleteDialog(true)
  }

  // Handle assign click
  const handleAssignClick = (video: Video) => {
    setVideoToAssign(video)
    setSelectedStudents([])
    setAssignmentDueDate(null)
    setAssignmentMessage('')
    setShowAssignModal(true)
  }

  // Handle student selection
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  // Shared function for assigning videos
  const assignVideos = async (videoIds: string[], studentIds: string[], groupIds: string[], dueDate: Date | null, message: string) => {
    try {
      await dispatch(assignVideosToStudents({
        videoIds,
        studentIds,
        groupIds,
        dueDate: dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59).toISOString() : undefined,
        messageForStudent: message.trim() || undefined,
      })).unwrap()
      return true
    } catch (error: any) {
      console.error('Error assigning videos:', error)
      const errorMessage = error.response?.data?.message || 'Failed to assign videos'
      toast.error(errorMessage, 'Error')
      return false
    }
  }

  // Handle single video assignment
  const handleAssignVideo = async () => {
    if (selectedStudents.length === 0 && selectedGroups.length === 0) {
      toast.warning('Please select at least one student or group', 'Warning')
      return
    }

    if (!videoToAssign) return

    const success = await assignVideos(
      [videoToAssign.video_id],
      selectedStudents,
      selectedGroups,
      assignmentDueDate,
      assignmentMessage
    )

    if (success) {
      setShowAssignModal(false)
      setVideoToAssign(null)
      setSelectedStudents([])
      setAssignmentDueDate(null)
      setAssignmentMessage('')
    }
  }

  // Handle view video
  const handleViewVideo = (video: Video) => {
    setSelectedVideoId(video.video_id)
    setShowDetailModal(true)
  }

  // Handle bulk assign modal open
  const handleBulkAssignModalOpen = () => {
    setShowBulkAssignModal(true)
    setBulkSelectedStudents([])
    setBulkAssignmentDueDate(null)
    setBulkAssignmentMessage('')
    setVideoSearchTerm('')
    setAvailableVideos([])
    setSelectedVideos([])
    // Clear any existing modal search timeout
    if (modalSearchTimeoutRef.current) {
      clearTimeout(modalSearchTimeoutRef.current)
    }
  }

  // Handle bulk student selection
  const handleBulkStudentSelection = (studentId: string) => {
    setBulkSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleGroupSelection = (selectedOptions: any) => {
    if (!selectedOptions) {
      setSelectedGroups([])
      return
    }
    const selected = selectedOptions.map((option: any) => option.value)
    setSelectedGroups(selected)
  }

  // Handle video selection for bulk assign
  const handleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  // Refs for debouncing - separate for main page and modal
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const modalSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Actual search function that makes the API call for modal - separate from main page
  const performVideoSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim()) {
      setSearchingVideos(true)
      
      try {
        // Use the same API URL construction as the Redux slice but don't dispatch
        const API_URL = import.meta.env.VITE_APP_API_URL
        const response = await axios.get(`${API_URL}/videos`, {
          params: {
            page: 1,
            items_per_page: 50,
            search: searchTerm,
          },
          headers: getHeadersWithSchoolSubject(`${API_URL}/videos`),
          withCredentials: true
        })
        
        // Extract data in the same format as the Redux thunk
        const items = response.data.data || []
        setAvailableVideos(items)
      } catch (error: any) {
        console.error('Error searching videos in modal:', error)
        setAvailableVideos([])
      } finally {
        setSearchingVideos(false)
      }
    } else {
      setAvailableVideos([])
      setSearchingVideos(false)
    }
  }, [])

  // Debounced search function for modal - separate from main page search
  const handleVideoSearch = useCallback((searchTerm: string) => {
    setVideoSearchTerm(searchTerm)
    
    // Clear existing modal search timeout
    if (modalSearchTimeoutRef.current) {
      clearTimeout(modalSearchTimeoutRef.current)
    }
    
    // Set new timeout for debounced modal search
    modalSearchTimeoutRef.current = setTimeout(() => {
      performVideoSearch(searchTerm)
    }, 500)
  }, [performVideoSearch])

  // Handle bulk video assignment
  const handleBulkAssignVideos = async () => {
    if (selectedVideos.length === 0) {
      toast.error('Please select at least one video', 'Error')
      return
    }

    if (bulkSelectedStudents.length === 0 && selectedGroups.length === 0) {
      toast.error('Please select at least one student or group', 'Error')
      return
    }

    const success = await assignVideos(
      selectedVideos,
      bulkSelectedStudents,
      selectedGroups,
      bulkAssignmentDueDate,
      bulkAssignmentMessage
    )

    if (success) {
      setShowBulkAssignModal(false)
      setBulkSelectedStudents([])
      setSelectedGroups([])
      setBulkAssignmentDueDate(null)
      setBulkAssignmentMessage('')
      setVideoSearchTerm('')
      setAvailableVideos([])
      setSelectedVideos([])
      // Clear modal search timeout
      if (modalSearchTimeoutRef.current) {
        clearTimeout(modalSearchTimeoutRef.current)
      }
    }
  }

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for debounced search - 1 second delay
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value)
    }, 1000)
  }

  // Handle platform filter
  const handlePlatformFilter = (platform: 'youtube' | 'vimeo' | '') => {
    setPlatformFilter(platform)
    setCurrentPage(1)
  }

  // Handle status filter
  const handleStatusFilter = (status: '1' | '2' | '') => {
    setStatusFilter(status === '' ? '' : parseInt(status) as 1 | 2)
    setCurrentPage(1)
  }

  // Handle tag filter
  const handleTagFilter = (tagIds: string[]) => {
    setTagFilter(tagIds)
    setCurrentPage(1)
  }

  // Convert platform filter to source value
  const getSourceFromPlatform = (platform: string): number | undefined => {
    if (platform === 'youtube') return 1
    if (platform === 'vimeo') return 2
    return undefined
  }

  // Get embed URL for video
  const getEmbedUrl = (video: Video) => {
    if (video.source === 1) {
      return `https://www.youtube.com/embed/${video.video_id_external}`
    } else if (video.source === 2) {
      return `https://player.vimeo.com/video/${video.video_id_external}`
    }
    return ''
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

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get privacy label for video (different for teachers vs students)
  const getPrivacyLabel = (video: Video) => {
    
    // For public videos, show no label regardless of user role
    if (video.status === 2) {
      return null
    }
    
    // If user is a student, show "Assigned to You" for private videos
    if (!isTeachingStaff(currentUser?.role?.role_type)) {
      return {
        text: 'Assigned to You',
        icon: 'fas fa-user-check',
        badgeClass: 'badge-light-success'
      }
    }
    
    // For teachers, show private for private videos
    return {
      text: 'Private',
      icon: 'fas fa-lock',
      badgeClass: 'badge-light-warning'
    }
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
          title: isTeachingStaff(currentUser?.role?.role_type) ? 'Video Management' : 'Videos',
          path: '/videos/list',
          isActive: true,
        },
      ]}>
        {isTeachingStaff(currentUser?.role?.role_type) ? 'Video Management' : 'Videos'}
      </PageTitle>
      
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h2 className='welcome-title'>
              {isTeachingStaff(currentUser?.role?.role_type) ? 'Video Management Hub! 🎬' : 'Explore Video Library! 🎬'}
            </h2>
            <p className='welcome-subtitle'>
              {isTeachingStaff(currentUser?.role?.role_type) 
                ? 'Create, manage, and assign videos to your students'
                : 'Discover content and expand your knowledge'
              }
            </p>
          </div>
          {isTeachingStaff(currentUser?.role?.role_type) && (
            <div className='welcome-actions'>
              <button 
                className='btn btn-light-primary me-3'
                onClick={() => {
                  resetModal()
                  setShowModal(true)
                }}
              >
                <i className='fas fa-plus me-1'></i>
                Add Video
              </button>
              <button 
                className='btn btn-light-success'
                onClick={handleBulkAssignModalOpen}
              >
                <i className='fas fa-user-plus me-1'></i>
                Assign Videos
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className='card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title'>
            <div className='d-flex align-items-center position-relative my-1'>
              <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
              <input
                type='text'
                data-kt-user-table-filter='search'
                className='form-control form-control-solid w-250px ps-14'
                placeholder='Search videos...'
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className='card-toolbar'>
            <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
              {/* Tag filter - available for all users */}
              <div className='me-3'>
                <div style={{minWidth: '250px'}}>
                  <Select
                    isMulti
                    options={videoTags.map(tag => ({
                      value: tag.tag_id,
                      label: tag.name
                    }))}
                    value={tagFilter.map(tagId => {
                      const tag = videoTags.find(t => t.tag_id === tagId)
                      return tag ? { value: tag.tag_id, label: tag.name } : null
                    }).filter(Boolean)}
                    onChange={(selectedOptions) => {
                      if (!selectedOptions) {
                        handleTagFilter([])
                      } else {
                        const selectedIds = selectedOptions.map((option: any) => option.value)
                        handleTagFilter(selectedIds)
                      }
                    }}
                    placeholder="Filter by tags..."
                    noOptionsMessage={() => "No tags available"}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '45px',
                        border: '1px solid #e1e3ea',
                        borderRadius: '6px',
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#f1f3f4',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#3699ff' : state.isFocused ? '#f8f9fa' : 'white',
                        color: state.isSelected ? 'white' : '#3f4254',
                        cursor: 'pointer',
                      }),
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                  />
                </div>
              </div>

              {isTeachingStaff(currentUser?.role?.role_type) && (
                <>
                  <div className='me-3'>
                    <select
                      className='form-select form-select-solid'
                      value={platformFilter}
                      onChange={(e) => handlePlatformFilter(e.target.value as 'youtube' | 'vimeo' | '')}
                    >
                      <option value=''>All Platforms</option>
                      <option value='youtube'>YouTube</option>
                      <option value='vimeo'>Vimeo</option>
                    </select>
                  </div>
                  
                  <div className='me-3'>
                    <select
                      className='form-select form-select-solid'
                      value={statusFilter}
                      onChange={(e) => handleStatusFilter(e.target.value as '1' | '2' | '')}
                    >
                      <option value=''>All Videos</option>
                      <option value='1'>Private</option>
                      <option value='2'>Public</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='card-body py-4'>
          {loading ? (
            <div className='video-loading'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          ) : (
            <div className='row g-4'>
              {videos.filter(video => video && video.video_id).map((video) => (
                <div key={video.video_id} className='col-md-3 col-lg-3'>
                  <div className='card h-100 video-card'>
                    <div className='video-thumbnail' style={{cursor: 'pointer', position: 'relative'}} onClick={() => navigate(`/videos/${video.video_id}`)}>
                      <img
                        src={video.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                        alt={video.title}
                        className='card-img-top'
                      />
                      {(() => {
                        const privacyLabel = getPrivacyLabel(video)
                        return privacyLabel ? (
                          <div className='video-private-badge' style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 2
                          }}>
                            <span className={`badge ${privacyLabel.badgeClass}`}>
                              <i className={`${privacyLabel.icon} me-1`}></i>
                              {privacyLabel.text}
                            </span>
                          </div>
                        ) : null
                      })()}
                      {isTeachingStaff(currentUser?.role?.role_type) && (
                        <div className='video-platform-badge'>
                          <span className={`badge badge-light-${video.source === 1 ? 'danger' : 'primary'}`}>
                            <i className={`${getPlatformIcon(video.source)} me-1`}></i>
                            {video.source === 1 ? 'YouTube' : 'Vimeo'}
                          </span>
                        </div>
                      )}
                      {video.duration && (
                        <div className='video-duration'>
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    
                    <div className='card-body d-flex flex-column'>
                      <h6 className='card-title text-truncate' title={video.title}>
                        {video.title}
                      </h6>
                      
                      {video.description && (
                        <p className='card-text text-muted small text-truncate' title={video.description}>
                          {video.description}
                        </p>
                      )}
                      
                      <div className='mt-auto'>
                        
                        {video.tags && video.tags.length > 0 && (
                          <div className='video-tags'>
                            {video.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index} 
                                className='badge badge-light-info me-1 cursor-pointer'
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (tag.tag_id && !tagFilter.includes(tag.tag_id)) {
                                    handleTagFilter([...tagFilter, tag.tag_id])
                                  }
                                }}
                                title={`Click to add "${tag.name}" to filter`}
                              >
                                {tag.name}
                              </span>
                            ))}
                            {video.tags.length > 3 && (
                              <span className='badge badge-light-secondary'>
                                +{video.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className='video-actions d-flex justify-content-between align-items-center'>
                          <div className='d-flex align-items-center gap-3'>
                            <small>
                              <i className='fas fa-eye me-1'></i>
                              {video.click_count || 0} views
                            </small>
                            <small>
                              {formatApiTimestamp(video.created_at, { format: 'date' })}
                            </small>
                          </div>
                          
                          {isTeachingStaff(currentUser?.role?.role_type) && (
                            <div className='d-flex gap-1'>
                              <button
                                type='button'
                                className='btn  btn-sm'
                                onClick={() => handleAssignClick(video)}
                                title='Assign to Students'
                              >
                                <i className='fas fa-user-plus'></i>
                              </button>
                              <button
                                type='button'
                                className='btn  btn-sm'
                                onClick={() => handleEdit(video)}
                                title='Edit'
                              >
                                <i className='fas fa-edit'></i>
                              </button>
                              <button
                                type='button'
                                className='btn btn-sm'
                                onClick={() => handleDeleteClick(video.video_id)}
                                title='Delete'
                                disabled={deleting}
                              >
                                <i className='fas fa-trash'></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {videos.length === 0 && !loading && (
                <div className='col-12'>
                  <div className='video-empty-state'>
                    <i className='fas fa-video'></i>
                    <h3>No videos found</h3>
                    <p>Start by adding your first video</p>
                    {isTeachingStaff(currentUser?.role?.role_type) && (
                      <button
                        type='button'
                        className='btn btn-primary'
                        onClick={() => {
                          setEditingVideo(null)
                          setFormData({
                            source: 1,
                            tags: [],
                            youtube_urls: [],
                            vimeo_ids: [],
                            status: 1,
                          })
                          setShowModal(true)
                        }}
                      >
                        <i className='fas fa-plus me-2'></i>
                        Add Your First Video
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > itemsPerPage && (
          <div className='card-footer d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center py-2'>
              <span className='text-muted'>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, total)} of {total} videos
              </span>
            </div>
            <div className='d-flex align-items-center py-2'>
              <nav aria-label='Video pagination'>
                <ul className='pagination pagination-sm mb-0'>
                  {/* First Page */}
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className='page-link'
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <i className='fas fa-angle-double-left'></i>
                    </button>
                  </li>
                  
                  {/* Previous Page */}
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className='page-link'
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className='fas fa-angle-left'></i>
                    </button>
                  </li>
                  
                  {/* Page Numbers */}
                  {(() => {
                    const totalPages = Math.ceil(total / itemsPerPage)
                    const startPage = Math.max(1, currentPage - 2)
                    const endPage = Math.min(totalPages, currentPage + 2)
                    const pages = []
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                          <button
                            className='page-link'
                            onClick={() => setCurrentPage(i)}
                          >
                            {i}
                          </button>
                        </li>
                      )
                    }
                    
                    return pages
                  })()}
                  
                  {/* Next Page */}
                  <li className={`page-item ${currentPage * itemsPerPage >= total ? 'disabled' : ''}`}>
                    <button
                      className='page-link'
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage * itemsPerPage >= total}
                    >
                      <i className='fas fa-angle-right'></i>
                    </button>
                  </li>
                  
                  {/* Last Page */}
                  <li className={`page-item ${currentPage * itemsPerPage >= total ? 'disabled' : ''}`}>
                    <button
                      className='page-link'
                      onClick={() => setCurrentPage(Math.ceil(total / itemsPerPage))}
                      disabled={currentPage * itemsPerPage >= total}
                    >
                      <i className='fas fa-angle-double-right'></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Video Modal */}
      {showModal && (
        <Modal 
          show={showModal} 
          onHide={resetModal}
          size="lg"
          centered
          dialogClassName="video-modal-lg"
          
        >
          <Modal.Header closeButton>
            <Modal.Title>{editingVideo ? 'Edit Video' : 'Add New Video'}</Modal.Title>
          </Modal.Header>
          <Modal.Body >
            {editingVideo ? (
              // Edit mode - show original form
              <form onSubmit={handleSubmit}>
                {/* Video Preview */}
                {editingVideo && (
                  <div className='mb-4 p-3 bg-light rounded'>
                    <div className='row align-items-center'>
                      <div className='col-md-3'>
                        <div className='position-relative'>
                          <img
                            src={editingVideo.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                            alt={editingVideo.title}
                            className='img-fluid rounded'
                            style={{width: '100%', maxWidth: '150px'}}
                          />
                        </div>
                      </div>
                      <div className='col-md-9'>
                        <h6 className='fw-bold mb-1 text-truncate' title={editingVideo.title}>{editingVideo.title}</h6>
                        <div className='d-flex align-items-center gap-2 flex-wrap'>
                          {isTeachingStaff(currentUser?.role?.role_type) && (
                            <span className={`badge badge-light-${editingVideo.source === 1 ? 'danger' : 'primary'} badge-sm`}>
                              <i className={`${getPlatformIcon(editingVideo.source)} me-1`}></i>
                              {editingVideo.source === 1 ? 'YouTube' : 'Vimeo'}
                            </span>
                          )}
                          {editingVideo.duration && (
                            <span className='text-muted small'>
                              <i className='fas fa-clock me-1'></i>
                              {Math.floor(editingVideo.duration / 60)}:{(editingVideo.duration % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                          <span className='text-muted small'>
                            <i className='fas fa-eye me-1'></i>
                            {editingVideo.click_count || 0} views
                          </span>
                          {editingVideo.status === 1 && (
                            <span className='badge badge-light-warning badge-sm'>
                              <i className='fas fa-lock me-1'></i>
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {editingVideo?.source === 1 && (
                  <div className='mb-4'>
                    <label className='form-label fw-bold'>Video URL *</label>
                    <input
                      type='url'
                      className='form-control'
                      placeholder='https://www.youtube.com/watch?v=...'
                      value={formData.youtube_urls?.[0] || ''}
                      onChange={(e) => {
                        const url = e.target.value
                        setFormData({...formData, youtube_urls: [url], vimeo_ids: []})
                      }}
                      required
                    />
                    <div className='form-text'>
                      YouTube video URL
                    </div>
                  </div>
                )}
                
                {/* Tags Section */}
                <div className='mb-4 p-3 bg-light rounded'>
                  <h6 className='fw-bold mb-3 text-primary'>
                    <i className='fas fa-tags me-2'></i>
                    Tags
                  </h6>
                  <VideoTagInput
                    options={tags}
                    selectedTags={formData.tags?.map(tag => ({id: tag.tag_id || '', name: tag.name || tags.find(t => t.id === tag.tag_id)?.name || ''})) || []}
                    onChange={(selectedTags) => setFormData({
                      ...formData, 
                      tags: selectedTags.map(tag => {
                        // If tag has isNew flag or id starts with 'new-', it's a new tag
                        if (tag.isNew || tag.id.startsWith('new-')) {
                          return { name: tag.name }
                        } else {
                          return { tag_id: tag.id }
                        }
                      })
                    })}
                    placeholder='Search and select tags or create new ones'
                  />
                </div>
                
                {/* Video Access Section */}
                <div className='mb-4 p-3 bg-light rounded'>
                  <h6 className='fw-bold mb-3 text-primary'>
                    <i className='fas fa-users me-2'></i>
                    Video Access
                  </h6>
                  <div className='form-check mb-3'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='editStatus'
                      id='editAssignOnly'
                      value='1'
                      checked={formData.status === 1}
                      onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                    />
                    <label className='form-check-label' htmlFor='editAssignOnly'>
                      <strong>Assign Only (Private)</strong>
                      <div className='form-text text-muted mt-1'>
                        Video will only be available when assigned to students. Students cannot browse or search for this video.
                      </div>
                    </label>
                  </div>
                  <div className='form-check'>
                    <input
                      className='form-check-input'
                      type='radio'
                      name='editStatus'
                      id='editOpenToStudents'
                      value='2'
                      checked={formData.status === 2}
                      onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                    />
                    <label className='form-check-label' htmlFor='editOpenToStudents'>
                      <strong>Open to Students</strong>
                      <div className='form-text text-muted mt-1'>
                        Video will be visible to all students. They can browse, search, and watch this video freely.
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            ) : (
              // Add mode - show step-by-step interface
              <>
                {modalStep === 'platform' && (
                  <div style={{overflowY: 'auto', flex: '1 1 auto'}}>
                    <div className='text-center mb-4'>
                      <h6 className='mb-3'>Choose a platform to add videos from:</h6>
                    </div>
                    
                    <div className='row g-3'>
                      <div className='col-6'>
                        <div 
                          className='card h-100 cursor-pointer border-2 border-hover-primary'
                          onClick={() => handlePlatformSelect('youtube')}
                          style={{cursor: 'pointer'}}
                        >
                          <div className='card-body text-center p-4'>
                            <i className='fab fa-youtube text-danger fs-1 mb-3'></i>
                            <h6 className='card-title'>YouTube</h6>
                            <p className='card-text small text-muted'>
                              Add a single video by entering its URL
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className='col-6'>
                        <div 
                          className='card h-100 cursor-pointer border-2 border-hover-primary'
                          onClick={() => handlePlatformSelect('vimeo')}
                          style={{cursor: 'pointer'}}
                        >
                          <div className='card-body text-center p-4'>
                            <i className='fab fa-vimeo-v text-primary fs-1 mb-3'></i>
                            <h6 className='card-title'>Vimeo</h6>
                            <p className='card-text small text-muted'>
                              Browse your folders and select multiple videos
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {modalStep === 'youtube' && (
                  <form onSubmit={handleYoutubeSubmit} style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{overflowY: 'auto', flex: '1 1 auto'}}>
                      <div className='mb-3'>
                        <label className='form-label'>YouTube Video URL *</label>
                        <input
                          type='url'
                          className='form-control'
                          placeholder='https://www.youtube.com/watch?v=...'
                          value={youtubeUrl}
                          onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                          required
                        />
                        <div className='form-text'>
                          Enter a valid YouTube video URL
                        </div>
                      </div>
                      
                      {/* YouTube Metadata Display */}
                      {fetchingYouTubeMetadata && (
                        <div className='mb-3'>
                          <div className='d-flex align-items-center'>
                            <div className='spinner-border spinner-border-sm me-2' role='status'>
                              <span className='visually-hidden'>Loading...</span>
                            </div>
                            <span>Fetching video information...</span>
                          </div>
                        </div>
                      )}
                      
                      {youtubeMetadata && !fetchingYouTubeMetadata && (
                        <div className='mb-3'>
                          <div className='card border'>
                            <div className='card-body p-3'>
                              <div className='row'>
                                <div className='col-md-3'>
                                  <img
                                    src={youtubeMetadata.thumbnail}
                                    alt={youtubeMetadata.title}
                                    className='img-fluid rounded'
                                    style={{ width: '100%', height: 'auto' }}
                                  />
                                </div>
                                <div className='col-md-9'>
                                  <h6 className='card-title mb-2'>{youtubeMetadata.title}</h6>
                                  <p className='card-text small text-muted mb-2'>
                                    {youtubeMetadata.description.substring(0, 150)}...
                                  </p>
                                  <div className='d-flex align-items-center'>
                                    <span className='badge badge-light-secondary me-2'>
                                      <i className='fas fa-clock me-1'></i>
                                      {youtubeMetadata.duration_formatted}
                                    </span>
                                    <span className='badge badge-light-danger'>
                                      <i className='fab fa-youtube me-1'></i>
                                      YouTube
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className='mb-3'>
                        <label className='form-label'>Tags</label>
                        <VideoTagInput
                          options={tags}
                          selectedTags={youtubeTags}
                          onChange={setYoutubeTags}
                          placeholder='Search and select tags or create new ones'
                        />
                      </div>
                      
                      <div className='mb-3'>
                        <label className='form-label'>Video Access</label>
                        <div className='d-flex gap-3'>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='radio'
                              name='youtubeStatus'
                              id='youtubeAssignOnly'
                              value='1'
                              checked={youtubeStatus === 1}
                              onChange={(e) => setYoutubeStatus(parseInt(e.target.value) as 1 | 2)}
                            />
                            <label className='form-check-label' htmlFor='youtubeAssignOnly'>
                              <i className='fas fa-lock me-1'></i>
                              Assign Only (Private)
                            </label>
                          </div>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='radio'
                              name='youtubeStatus'
                              id='youtubeOpenToStudents'
                              value='2'
                              checked={youtubeStatus === 2}
                              onChange={(e) => setYoutubeStatus(parseInt(e.target.value) as 1 | 2)}
                            />
                            <label className='form-check-label' htmlFor='youtubeOpenToStudents'>
                              <i className='fas fa-globe me-1'></i>
                              Open to Students
                            </label>
                          </div>
                        </div>
                        <div className='form-text'>
                          {youtubeStatus === 1 
                            ? 'Video will be private and only available when assigned to students'
                            : 'Video will be visible to all students in your subject'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className='modal-footer'>
                      <button
                        type='button'
                        className='btn btn-secondary'
                        onClick={() => setModalStep('platform')}
                      >
                        Back
                      </button>
                      <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={creating}
                      >
                        {creating ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                            Adding...
                          </>
                        ) : (
                          'Add Video'
                        )}
                      </button>
                    </div>
                  </form>
                )}
                
                {modalStep === 'vimeo' && (
                  <>
                    <div className='mb-3'>
                      <h6>Select videos from your Vimeo projects:</h6>
                      <p className='text-muted small'>
                        Click on a project to expand and view its videos, then select the ones you want to add.
                      </p>
                    </div>
                    
                    <div className='vimeo-modal-content'>
                      {fetchingVimeoFolders ? (
                        <div className='text-center py-4'>
                          <div className='spinner-border text-primary' role='status'>
                            <span className='visually-hidden'>Loading...</span>
                          </div>
                          <p className='mt-2'>Loading your Vimeo projects...</p>
                        </div>
                      ) : (
                        <div className='vimeo-folders'>
                          <VimeoFolderTree
                            folders={vimeoFolders || []}
                            selectedVideos={selectedVimeoVideos}
                            onVideoSelect={handleVimeoVideoSelect}
                            expandedFolders={expandedFolders}
                            onFolderExpand={handleFolderExpand}
                          />
                          
                          {(vimeoFolders || []).length === 0 && !fetchingVimeoFolders && (
                            <div className='text-center py-4'>
                              <i className='fas fa-folder-open text-muted fs-1 mb-3'></i>
                              <p className='text-muted'>No Vimeo projects found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {/* Vimeo Tags Input - Outside scrollable area */}
                {modalStep === 'vimeo' && (
                  <div style={{borderTop: '1px solid #dee2e6'}}>
                    <div className='mb-3'>
                      <label className='form-label'>Tags for Selected Videos</label>
                      <VideoTagInput
                        options={tags}
                        selectedTags={vimeoTags}
                        onChange={setVimeoTags}
                        placeholder='Search and select tags or create new ones'
                      />
                      <div className='form-text'>
                        These tags will be applied to all selected videos
                      </div>
                    </div>
                    
                    <div className='mb-3'>
                      <label className='form-label'>Video Access</label>
                      <div className='d-flex gap-3'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='radio'
                            name='vimeoStatus'
                            id='vimeoAssignOnly'
                            value='1'
                            checked={vimeoStatus === 1}
                            onChange={(e) => setVimeoStatus(parseInt(e.target.value) as 1 | 2)}
                          />
                          <label className='form-check-label' htmlFor='vimeoAssignOnly'>
                            <i className='fas fa-lock me-1'></i>
                            Assign Only (Private)
                          </label>
                        </div>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='radio'
                            name='vimeoStatus'
                            id='vimeoOpenToStudents'
                            value='2'
                            checked={vimeoStatus === 2}
                            onChange={(e) => setVimeoStatus(parseInt(e.target.value) as 1 | 2)}
                          />
                          <label className='form-check-label' htmlFor='vimeoOpenToStudents'>
                            <i className='fas fa-globe me-1'></i>
                            Open to Students
                          </label>
                        </div>
                      </div>
                      <div className='form-text'>
                        {vimeoStatus === 1 
                          ? 'Videos will be private and only available when assigned to students'
                          : 'Videos will be visible to all students in your subject'
                        }
                      </div>
                    </div>
                  </div>
                )}
                
                {modalStep === 'vimeo' && (
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      onClick={() => setModalStep('platform')}
                    >
                      Back
                    </button>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={handleVimeoSubmit}
                      disabled={creating || selectedVimeoVideos.size === 0}
                    >
                      {creating ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                          Adding {selectedVimeoVideos.size} videos...
                        </>
                      ) : (
                        `Add ${selectedVimeoVideos.size} Selected Video${selectedVimeoVideos.size !== 1 ? 's' : ''}`
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          {editingVideo && (
            <Modal.Footer>
              <Button variant="secondary" onClick={resetModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={creating || updating}>
                {updating ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Modal.Footer>
          )}
        </Modal>
      )}

      {/* Video Detail Modal */}
      <Modal show={showDetailModal} onHide={() => {
        setShowDetailModal(false)
        setSelectedVideoId(null)
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedVideoId ? `Video: ${selectedVideoId}` : 'Video Detail'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Add your video detail content here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowDetailModal(false)
            setSelectedVideoId(null)
          }}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            // Add any additional actions you want to execute when viewing the video
          }}>
            View Video
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        show={showDeleteDialog}
        onHide={() => {
          setShowDeleteDialog(false)
          setVideoToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Video Assignment Modal */}
      {showAssignModal && videoToAssign && (
        <Modal 
          show={showAssignModal} 
          onHide={() => setShowAssignModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Assign Video to Students</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className='mb-4'>
              <h6>Selected Video: {videoToAssign.title}</h6>
              <p className='text-muted'>Choose students or groups to assign this video to:</p>
            </div>

            {/* Group Selection */}
            <div className='mb-4'>
              <label className='form-label fw-bold'>Select Groups</label>
              <div style={{position: 'relative', zIndex: 3000}} className="groups-select">
                <Select
                  options={(groups || []).map((group) => ({
                    value: group.group_id,
                    label: `${group.name} (${group.member_count || 0} students)`,
                    data: group,
                    isDisabled: !group.member_count || group.member_count === 0
                  }))}
                  isMulti
                  onChange={handleGroupSelection}
                  placeholder="Select groups..."
                  isLoading={groupsLoading}
                  isClearable
                  isSearchable
                  isDisabled={assigning}
                  value={(groups || [])
                    .filter(group => selectedGroups.includes(group.group_id))
                    .map(group => ({
                      value: group.group_id,
                      label: `${group.name} (${group.member_count || 0} students)`,
                      data: group
                    }))}
                />
              </div>
              {selectedGroups.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    {selectedGroups.length} group(s) selected
                  </small>
                </div>
              )}
              <div className="form-text text-muted mt-2">
                <i className="fas fa-info-circle me-1"></i>
                Selecting groups will assign videos to all students in those groups. Groups with 0 students are disabled.
              </div>
            </div>

            <div className='mb-4'>
              <label className='form-label fw-bold'>Select Students</label>
              <div style={{position: 'relative', zIndex: 2000}}>
                <StudentSelectionTable 
                  exerciseIds={[videoToAssign.video_id]} // Pass video ID as exercise ID for compatibility
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
              <div className='form-text'>This message will be shown to students when they access the video</div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowAssignModal(false)
              setVideoToAssign(null)
              setSelectedStudents([])
              setSelectedGroups([])
              setAssignmentDueDate(null)
              setAssignmentMessage('')
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignVideo} disabled={assigning}>
              {assigning ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                  Assigning...
                </>
              ) : (
                `Assign Video to ${selectedStudents.length + selectedGroups.length} Selection(s)`
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Bulk Video Assignment Modal */}
      {showBulkAssignModal && (
        <Modal
          show={showBulkAssignModal} 
          onHide={() => {
            setShowBulkAssignModal(false)
            // Clear modal search timeout when closing
            if (modalSearchTimeoutRef.current) {
              clearTimeout(modalSearchTimeoutRef.current)
            }
          }}
          size="xl"
          centered
          className="bulk-assign-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Assign Videos to Students</Modal.Title>
          </Modal.Header>
          <Modal.Body>
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
                          <div className='me-3' style={{width: '80px', height: '45px', flexShrink: 0}}>
                            <img
                              src={video.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA4MCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjQ1IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAyM0M0MCAyMyA0MCAyMyA0MCAyM0M0MCAyMyA0MCAyMyA0MCAyM1oiIGZpbGw9IiNDQ0NDQ0MiLz4KPHRleHQgeD0iNDAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                              alt={video.title}
                              className='img-fluid rounded'
                              style={{width: '100%', height: '100%', objectFit: 'cover'}}
                            />
                          </div>
                          <div className='flex-grow-1'>
                            <div className='fw-bold small'>{video.title}</div>
                            <div className='text-muted small'>
                              {isTeachingStaff(currentUser?.role?.role_type) && (
                                <>
                                  {video.source === 1 ? 'YouTube' : 'Vimeo'} • 
                                </>
                              )}
                              {video.duration ? formatDuration(video.duration) : 'Unknown duration'}
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
                  <label className='form-label fw-bold'>Select Groups</label>
                  <div style={{position: 'relative', zIndex: 3000}} className="groups-select">
                    <Select
                      options={(groups || []).map((group) => ({
                        value: group.group_id,
                        label: `${group.name} (${group.member_count || 0} students)`,
                        data: group,
                        isDisabled: !group.member_count || group.member_count === 0
                      }))}
                      isMulti
                      onChange={handleGroupSelection}
                      placeholder="Select groups..."
                      isLoading={groupsLoading}
                      isClearable
                      isSearchable
                      isDisabled={assigning}
                      value={(groups || [])
                        .filter(group => selectedGroups.includes(group.group_id))
                        .map(group => ({
                          value: group.group_id,
                          label: `${group.name} (${group.member_count || 0} students)`,
                          data: group
                        }))}
                    />
                  </div>
                  {selectedGroups.length > 0 && (
                    <div className="mt-2">
                      <small className="text-muted">
                        {selectedGroups.length} group(s) selected
                      </small>
                    </div>
                  )}
                  <div className="form-text text-muted mt-2">
                    <i className="fas fa-info-circle me-1"></i>
                    Selecting groups will assign videos to all students in those groups. Groups with 0 students are disabled.
                  </div>
                </div>

                <div className='mb-4'>
                  <label className='form-label fw-bold'>Select Students</label>
                  <div style={{position: 'relative', zIndex: 2000}} className="students-select">
                    <StudentSelectionTable 
                      exerciseIds={selectedVideos} // Pass selected video IDs as exercise IDs for compatibility
                      search="" 
                      selectedUsers={bulkSelectedStudents}
                      onUserSelectionChange={handleBulkStudentSelection}
                    />
                  </div>
                </div>

                <div className='mb-4'>
                  <label className='form-label fw-bold'>Due Date (Optional)</label>
                  <div style={{position: 'relative', zIndex: 1000}}>
                    <DatePicker
                      selected={bulkAssignmentDueDate}
                      onChange={(date: Date | null) => setBulkAssignmentDueDate(date)}
                      placeholderText="Select due date"
                      minDate={new Date()}
                      isClearable={true}
                      dayClassName={(date) => 
                        date.getTime() === bulkAssignmentDueDate?.getTime() ? 'bg-primary text-white' : ''
                      }
                    />
                  </div>
                </div>

                <div className='mb-4'>
                  <label className='form-label fw-bold'>Message for Students (Optional)</label>
                  <div style={{position: 'relative', zIndex: 1}}>
                    <TinyMCEEditor
                      value={bulkAssignmentMessage}
                      onChange={setBulkAssignmentMessage}
                      placeholder='Enter a message for your students...'
                      height={200}
                    />
                  </div>
                  <div className='form-text'>This message will be shown to students when they access the videos</div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowBulkAssignModal(false)
              setBulkSelectedStudents([])
              setSelectedGroups([])
              setBulkAssignmentDueDate(null)
              setBulkAssignmentMessage('')
              setVideoSearchTerm('')
              setAvailableVideos([])
              setSelectedVideos([])
              // Clear modal search timeout when canceling
              if (modalSearchTimeoutRef.current) {
                clearTimeout(modalSearchTimeoutRef.current)
              }
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkAssignVideos} disabled={assigning}>
              {assigning ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                  Assigning...
                </>
              ) : (
                `Assign Videos to ${bulkSelectedStudents.length + selectedGroups.length} Selection(s)`
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

export default TeacherVideoListPage 