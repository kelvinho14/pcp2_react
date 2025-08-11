import React, { FC, useState, useEffect, useMemo } from 'react'
import { Modal, Button, Spinner, Form, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../store'
import { fetchVideos, Video, assignVideosToStudents } from '../../../../store/videos/videosSlice'
import { fetchUsers } from '../../../../store/user/userSlice'
import { toast } from '../../../../_metronic/helpers/toast'
import Select from 'react-select'
import { DatePicker } from '../../../../_metronic/helpers/components/DatePicker'
import { ROLES } from '../../../constants/roles'
import { KTIcon, useDebounce } from '../../../../_metronic/helpers'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'

interface AssignVideoModalProps {
  show: boolean
  onHide: () => void
}

const AssignVideoModal: FC<AssignVideoModalProps> = ({ show, onHide }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [messageToStudent, setMessageToStudent] = useState<string>('')
  const [videoSearchTerm, setVideoSearchTerm] = useState('')
  const [hasSearchedVideos, setHasSearchedVideos] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Debounce search terms to reduce API calls
  const debouncedVideoSearchTerm = useDebounce(videoSearchTerm, 300)

  const { videos, loading: videosLoading } = useSelector((state: RootState) => state.videos)
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.users)

  // Effect to handle debounced video search
  useEffect(() => {
    if (debouncedVideoSearchTerm && debouncedVideoSearchTerm.length >= 3) {
      setHasSearchedVideos(true)
      dispatch(fetchVideos({ 
        page: 1, 
        items_per_page: 100, 
        search: debouncedVideoSearchTerm
      }))
    } else if (debouncedVideoSearchTerm !== undefined && debouncedVideoSearchTerm.length === 0) {
      setHasSearchedVideos(false)
    }
  }, [debouncedVideoSearchTerm, dispatch])

  // Load all students when modal opens
  useEffect(() => {
    if (show) {
      dispatch(fetchUsers({
        page: 1,
        items_per_page: 1000, // Get all students
        role_type: ROLES.STUDENT.toString()
      }))
    }
  }, [show, dispatch])

  // Use videos directly from API search results
  const filteredVideos = useMemo(() => {
    if (!hasSearchedVideos) return []
    return videos
  }, [videos, hasSearchedVideos])

  // Filter students - show all students
  const filteredStudents = useMemo(() => {
    return users.filter(user => user.role?.role_type === ROLES.STUDENT)
  }, [users])

  // Video options for react-select
  const videoOptions = useMemo(() => {
    return filteredVideos.map(video => ({
      value: video.video_id,
      label: `${video.title} (${video.source === 1 ? 'YouTube' : 'Vimeo'})`,
      data: video
    }))
  }, [filteredVideos])

  // Student options for react-select
  const studentOptions = useMemo(() => {
    return filteredStudents.map(user => ({
      value: user.user_id,
      label: user.name,
      data: user
    }))
  }, [filteredStudents])

  // Handle video search - now just updates local state, API call is handled by useEffect
  const handleVideoSearch = (inputValue: string) => {
    setVideoSearchTerm(inputValue)
  }

  // Handle video selection
  const handleVideoSelection = (selectedOption: any) => {
    if (!selectedOption) {
      setSelectedVideo(null)
      return
    }
    setSelectedVideo(selectedOption.data)
  }

  // Handle student selection
  const handleStudentSelection = (selectedOptions: any) => {
    if (!selectedOptions) {
      setSelectedStudents([])
      return
    }
    const selected = selectedOptions.map((option: any) => option.value)
    setSelectedStudents(selected)
  }

  // Handle assignment submission
  const handleSubmit = async () => {
    if (!selectedVideo) {
      toast.error('Please select a video', 'Error')
      return
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student', 'Error')
      return
    }

    setIsAssigning(true)
    try {
      // Call the API to assign videos
      await dispatch(assignVideosToStudents({
        videoIds: [selectedVideo.video_id], // Always an array
        studentIds: selectedStudents,
        dueDate: dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59).toISOString() : undefined,
        messageForStudent: messageToStudent.trim() || undefined,
      })).unwrap()
      
      onHide()
      resetForm()
    } catch (error) {
      console.error('Error assigning videos:', error)
      // Error toast is handled by the thunk
    } finally {
      setIsAssigning(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedVideo(null)
    setSelectedStudents([])
    setDueDate(null)
    setMessageToStudent('')
    setVideoSearchTerm('')
    setHasSearchedVideos(false)
  }

  // Handle modal close
  const handleClose = () => {
    resetForm()
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Assign Video to Students</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <p className="text-muted">
            Search and select a video to assign to students. You can set a due date and add a message for the students.
          </p>
        </div>

        <Row>
          {/* Left Column - Video Selection */}
          <Col md={6}>
            <div className="h-100 pe-3">
              <h5 className="mb-3">Video Selection</h5>
              
              {/* Video Search */}
              <div className="mb-4">
                <label className="form-label fw-bold">Search Video</label>
                <Form.Control
                  type="text"
                  placeholder="Type at least 3 characters to search videos..."
                  value={videoSearchTerm}
                  onChange={(e) => handleVideoSearch(e.target.value)}
                  disabled={isAssigning}
                />
                {videosLoading && (
                  <div className="text-center mt-2">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Searching...</span>
                  </div>
                )}
              </div>

              {/* Video Selection Dropdown */}
              {hasSearchedVideos && videoOptions.length > 0 && (
                <div className="mb-4">
                  <label className="form-label fw-bold">Select Video</label>
                  <Select
                    options={videoOptions}
                    onChange={handleVideoSelection}
                    placeholder="Choose a video..."
                    isLoading={videosLoading}
                    isClearable
                    isSearchable={false}
                    isDisabled={isAssigning}
                    value={selectedVideo ? {
                      value: selectedVideo.video_id,
                      label: `${selectedVideo.title} (${selectedVideo.source === 1 ? 'YouTube' : 'Vimeo'})`,
                      data: selectedVideo
                    } : null}
                  />
                </div>
              )}

              {/* Selected Video Display */}
              {selectedVideo && (
                <div className="card border-primary">
                  <div className="card-header bg-light-primary">
                    <h6 className="card-title mb-0">Selected Video</h6>
                  </div>
                  <div className="card-body">
                    <h6 className="mb-2">{selectedVideo.title}</h6>
                    <p className="text-muted small mb-2">
                      Source: {selectedVideo.source === 1 ? 'YouTube' : 'Vimeo'}
                    </p>
                    {selectedVideo.description && (
                      <p className="text-muted small mb-0">
                        {selectedVideo.description.length > 100 
                          ? `${selectedVideo.description.substring(0, 100)}...`
                          : selectedVideo.description
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}

              {hasSearchedVideos && videoOptions.length === 0 && !videosLoading && (
                <div className="alert alert-warning">
                  No videos found for "{videoSearchTerm}"
                </div>
              )}
            </div>
          </Col>

          {/* Right Column - Assignment Details */}
          <Col md={6}>
            <div className="h-100 ps-3">
              <h5 className="mb-3">Assignment Details</h5>

              {/* Student Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">Select Students</label>
                <Select
                  options={studentOptions}
                  isMulti
                  onChange={handleStudentSelection}
                  placeholder="Select students to assign..."
                  isLoading={usersLoading}
                  isClearable
                  isSearchable
                  isDisabled={isAssigning}
                  value={studentOptions.filter(option => 
                    selectedStudents.includes(option.value)
                  )}
                />
                {selectedStudents.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      {selectedStudents.length} student(s) selected
                    </small>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label className="form-label fw-bold">Due Date (Optional)</label>
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  placeholderText="Select due date"
                  isClearable
                  disabled={isAssigning}
                />
              </div>

              {/* Message using TinyMCE */}
              <div className="mb-4">
                <label className="form-label fw-bold">Message to Students (Optional)</label>
                <TinyMCEEditor
                  value={messageToStudent}
                  onChange={setMessageToStudent}
                  height={200}
                  placeholder="Add a message for the students..."
                />
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isAssigning}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedVideo || selectedStudents.length === 0 || isAssigning}
          className={isAssigning ? 'spinner' : ''}
        >
          {isAssigning ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Assigning...
            </>
          ) : (
            <>
              <KTIcon iconName="user-tick" className="fs-2 me-2" />
              Assign Video
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AssignVideoModal 