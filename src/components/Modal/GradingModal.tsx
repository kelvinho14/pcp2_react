import React, { FC, useState, useEffect, useRef } from 'react'
import { Modal, Button, Form, Spinner, Alert, Tabs, Tab } from 'react-bootstrap'
import axios from 'axios'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'
import { renderHtmlSafely } from '../../_metronic/helpers/htmlRenderer'
import { toast } from '../../_metronic/helpers/toast'
import DrawingPad from '../DrawingPad/DrawingPad'
import './GradingModal.css'

// Constants for correct status
const CORRECT_STATUS = {
  CORRECT: 1,      // Green - Correct
  PARTIAL: 2,      // Light Green - Partial correct
  WRONG: 3         // Red - Wrong
} as const

type CorrectStatusType = typeof CORRECT_STATUS[keyof typeof CORRECT_STATUS]

// Interface for individual drawing
interface Drawing {
  drawing_id: string
  drawing_order: number
  file_id: string
  file_key: string
  drawing_image_url: string
  drawing_data: string
  created_at: string
  updated_at: string
}

interface GradingData {
  assignment: {
    assignment_id: string
    student_id: string
    student_name: string
    student_email: string
    exercise_id: string
    exercise_title: string
    assigned_at: string
    due_date: string
    status: number
  }
  question: {
    question_id: string
    question_name: string
    question_type: string
    question_content: string
    teacher_remark: string
    tags: Array<{
      tag_id: string
      name: string
      score: number
    }>
    model_answer: {
      correct_answer: string
    }
  }
  student_answer: {
    answer_id: string
    question_id: string
    question_type: number
    student_answer: string
    student_option: any
    answered_at: string
    is_correct: any
    score: number
    max_score: number
    feedback: any
    graded_by: any
    graded_at: any
    status: number
    drawing_image_url: string
    file_id: string
    file_key: string
    drawings: Drawing[] // Add drawings array
    drawings_count: number
  }
}

interface GradingModalProps {
  show: boolean
  onHide: () => void
  assignmentId: string
  questionId: string
  studentId: string
  studentName: string
  questionType: 'mc' | 'lq'
  questionContent: string
  correctAnswer: string
  studentAnswer: string
}

/**
 * GradingModal Component
 * 
 * Enhanced modal for grading student answers with support for:
 * - Multiple drawings from student submissions
 * - Tabbed interface for multiple drawings
 * - Drawing pad integration for teacher annotations
 * - Tag-based grading system
 * - Teacher feedback and status marking
 * 
 * Features:
 * - Automatically detects and displays multiple drawings
 * - Provides tabbed navigation when multiple drawings exist
 * - Loads student drawing data into drawing pads
 * - Allows teachers to annotate on top of student work
 * - Supports both single and multiple drawing scenarios
 */
const GradingModal: FC<GradingModalProps> = ({
  show,
  onHide,
  assignmentId,
  questionId,
  studentId,
  studentName,
  questionType,
  questionContent,
  correctAnswer,
  studentAnswer,
}) => {
  const [gradingData, setGradingData] = useState<GradingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagScores, setTagScores] = useState<Record<string, number>>({})
  const [overallScore, setOverallScore] = useState<number>(0)
  const [teacherRemark, setTeacherRemark] = useState<string>('')
  const [teacherDrawingData, setTeacherDrawingData] = useState<string | null>(null)
  const [correctStatus, setCorrectStatus] = useState<CorrectStatusType>(CORRECT_STATUS.CORRECT)
  const [selectedDrawingIndex, setSelectedDrawingIndex] = useState<number>(0)
  const [teacherDrawings, setTeacherDrawings] = useState<Record<number, string | null>>({})
  const drawingPadRefs = useRef<Record<number, any>>({})

  // Get the current drawings array
  const drawings = gradingData?.student_answer?.drawings || []

  // Handle teacher's drawing changes for a specific drawing
  const handleTeacherDrawingChange = (drawingData: string, drawingIndex: number) => {
    setTeacherDrawings(prev => ({
      ...prev,
      [drawingIndex]: drawingData
    }))
  }

  // Get the current drawing data from a specific DrawingPad
  const getTeacherDrawingData = async (drawingIndex: number): Promise<string | null> => {
    const drawingPadRef = drawingPadRefs.current[drawingIndex]
    if (drawingPadRef && gradingData?.student_answer?.drawings?.[drawingIndex]?.drawing_image_url) {
      try {
        // Use the exposed method from DrawingPad
        const drawingData = drawingPadRef.getDrawingData?.()
        
        if (drawingData && typeof drawingData.then === 'function') {
          return await drawingData
        } else {
          return drawingData
        }
      } catch (error) {
        console.error('Error getting drawing data:', error)
      }
    }
    return null
  }

  // Save function for the DrawingPad (not used in grading, but required prop)
  const handleDrawingSave = async (questionId: string, questionType: number, answerData: any) => {
    // This is not used in grading context, but required by DrawingPad
    console.log('Drawing save called:', { questionId, questionType, answerData })
  }

  // Fetch grading data when modal opens
  useEffect(() => {
    if (show && assignmentId && questionId) {
      fetchGradingData()
    }
  }, [show, assignmentId, questionId])

  // Reset drawing selection when drawings change
  useEffect(() => {
    if (drawings.length > 0) {
      setSelectedDrawingIndex(0)
    }
  }, [drawings.length])

  // Initialize teacher drawings when drawings data changes
  useEffect(() => {
    if (gradingData?.student_answer?.drawings && gradingData.student_answer.drawings.length > 0) {
      const initialTeacherDrawings: Record<number, string | null> = {}
      gradingData.student_answer.drawings.forEach((_: any, index: number) => {
        initialTeacherDrawings[index] = null
      })
      setTeacherDrawings(initialTeacherDrawings)
    }
  }, [gradingData?.student_answer?.drawings])

  const fetchGradingData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${assignmentId}/questions/${questionId}/grading`)
      
      const response = await axios.get(
        `${API_URL}/exercises/${assignmentId}/questions/${questionId}/grading`,
        { headers, withCredentials: true }
      )
      
      if (response.data.status === 'success') {
        const data = response.data.data
        setGradingData(data)
        
        // Initialize tag scores if they exist
        if (data.question.tags) {
          const initialTagScores: Record<string, number> = {}
          data.question.tags.forEach((tag: any) => {
            initialTagScores[tag.tag_id] = tag.score || 0
          })
          setTagScores(initialTagScores)
          
          // Calculate initial overall score
          const totalScore = Object.values(initialTagScores).reduce((sum, score) => sum + score, 0)
          const maxScore = data.question.tags.reduce((sum: number, tag: any) => sum + tag.score, 0)
          setOverallScore(maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0)
        }
      } else {
        setError(response.data.message || 'Failed to fetch grading data')
      }
    } catch (error: any) {
      console.error('Error fetching grading data:', error)
      setError(error.response?.data?.message || 'Failed to fetch grading data')
    } finally {
      setLoading(false)
    }
  }

  const handleTagScoreChange = (tagId: string, score: number) => {
    const newTagScores = { ...tagScores, [tagId]: score }
    setTagScores(newTagScores)
    
    // Recalculate overall score
    if (gradingData?.question?.tags) {
      const totalScore = Object.values(newTagScores).reduce((sum, s) => sum + s, 0)
      const maxScore = gradingData.question.tags.reduce((sum: number, tag: any) => sum + tag.score, 0)
      setOverallScore(maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      // Get teacher's drawing data for all drawings if available
      let teacherDrawingGradings: any[] = []
      
      if (gradingData?.student_answer?.drawings && gradingData.student_answer.drawings.length > 0) {
        for (let i = 0; i < gradingData.student_answer.drawings.length; i++) {
          const teacherDrawing = await getTeacherDrawingData(i)
          if (teacherDrawing) {
            // Convert the drawing data to PNG base64
            try {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              if (ctx) {
                // Create a temporary canvas to render the drawing
                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = 800
                tempCanvas.height = 800
                const tempCtx = tempCanvas.getContext('2d')
                
                if (tempCtx) {
                  // Draw the background image first
                  const drawing = gradingData.student_answer.drawings[i]
                  if (drawing.drawing_image_url) {
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.onload = () => {
                      tempCtx.drawImage(img, 0, 0, 800, 800)
                    }
                    img.src = drawing.drawing_image_url
                  }
                  
                  // Convert to PNG base64
                  const drawingPngBase64 = tempCanvas.toDataURL('image/png').split(',')[1]
                  teacherDrawingGradings.push({
                    drawing_png_base64: drawingPngBase64
                  })
                }
              }
            } catch (error) {
              console.error('Error converting drawing to PNG:', error)
            }
          }
        }
      }
      
      const API_URL = import.meta.env.VITE_APP_API_URL
      const headers = getHeadersWithSchoolSubject(`${API_URL}/exercises/${assignmentId}/questions/${questionId}/grading`)
      
      const payload = {
        feedback: teacherRemark.trim() || undefined,
        correct_status: correctStatus,
        teacher_tag_scores: Object.entries(tagScores).map(([tagId, score]) => ({
          tag_id: tagId,
          score: score
        })),
        drawing_gradings: teacherDrawingGradings.length > 0 ? teacherDrawingGradings : undefined
      }
      
      const response = await axios.post(
        `${API_URL}/exercises/${assignmentId}/questions/${questionId}/grading`,
        payload,
        { headers, withCredentials: true }
      )
      
      if (response.data.status === 'success') {
        toast.success('Grading submitted successfully!', 'Success')
        onHide()
      } else {
        toast.error(response.data.message || 'Failed to submit grading', 'Error')
      }
    } catch (error: any) {
      console.error('Error submitting grading:', error)
      toast.error(error.response?.data?.message || 'Failed to submit grading', 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setGradingData(null)
    setTagScores({})
    setOverallScore(0)
    setTeacherRemark('')
    setTeacherDrawingData(null)
    setCorrectStatus(CORRECT_STATUS.CORRECT)
    setSelectedDrawingIndex(0)
    setTeacherDrawings({})
    setError(null)
    onHide()
  }

  if (!show) return null

  // Helper function to render a DrawingPad
  const renderDrawingPad = (drawing: Drawing, index: number) => (
    <DrawingPad
      width={1000}
      height={800}
      questionId={questionId}
      saveFunction={handleDrawingSave}
      className="grading-drawing-pad"
      ref={(el) => {
        if (el) drawingPadRefs.current[index] = el
      }}
      backgroundImageUrl={drawing.drawing_image_url}
      initialDrawingData={drawing.drawing_data || undefined}
      title={`Student Drawing ${index + 1}`}
      description="You can draw on top of the student's work using the tools below"
    />
  )

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      fullscreen
      centered
      backdrop={true}
      keyboard={true}
      dialogClassName="grading-modal"
    >
      <Modal.Header 
        closeButton
        style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e9ecef'}}
      >
        <Modal.Title className='mb-0 d-flex align-items-center'>
          <i className='fas fa-clipboard-check text-primary me-3 fs-3'></i>
          <div>
            <div className='fw-bold fs-4'>Grade Question</div>
            <div className='text-muted fs-6'>Student: {studentName}</div>
            {drawings.length > 0 && (
              <div className='text-muted fs-7'>Pages: {drawings.length}</div>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className='p-4' style={{maxHeight: '80vh', overflowY: 'auto'}}>
        {loading ? (
          <div className='text-center py-5'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <p className='mt-3 text-muted'>Loading grading data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <i className='fas fa-exclamation-triangle me-2'></i>
            {error}
          </Alert>
        ) : gradingData ? (
          <div className='row'>
            {/* Left Column: Question Content and Correct Answer */}
            <div className='col-md-6'>
              {/* Question Content */}
              <div className='card mb-4'>
                <div className='card-header d-flex align-items-center py-3'>
                  <div className='d-flex align-items-center'>
                    <div className='icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2 me-3'>
                      <i className='fas fa-question-circle text-primary fs-5'></i>
                    </div>
                    <h6 className='mb-0 fw-bold text-dark'>Question Content</h6>
                  </div>
                </div>
                <div className='card-body'>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderHtmlSafely(gradingData.question.question_content, { maxImageWidth: 500, maxImageHeight: 400 }) 
                    }}
                  />
                </div>
              </div>

              {/* Correct Answer */}
              <div className='card mb-4'>
                <div className='card-header d-flex align-items-center py-3'>
                  <div className='d-flex align-items-center'>
                    <div className='icon-wrapper bg-success bg-opacity-10 rounded-circle p-2 me-3'>
                      <i className='fas fa-check-circle text-success fs-5'></i>
                    </div>
                    <h6 className='mb-0 fw-bold text-dark'>Correct Answer</h6>
                  </div>
                </div>
                <div className='card-body'>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderHtmlSafely(gradingData.question.model_answer.correct_answer, { maxImageWidth: 400, maxImageHeight: 300 }) 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Grading, Drawing Pads, and Remarks */}
            <div className='col-md-6'>
              {/* Student Answer Drawings */}
              {drawings.length > 0 ? (
                <div className='card mb-4'>
                  <div className='card-header d-flex align-items-center py-3'>
                    <div className='d-flex align-items-center'>
                      <div className='icon-wrapper bg-info bg-opacity-10 rounded-circle p-2 me-3'>
                        <i className='fas fa-paint-brush text-info fs-5'></i>
                      </div>
                      <h6 className='mb-0 fw-bold text-dark'>Student Answer Pages</h6>
                    </div>
                  </div>
                  <div className='card-body'>
                    {/* Drawing Tabs */}
                    {drawings.length > 1 && (
                      <div className='mb-3'>
                        <Tabs
                          activeKey={selectedDrawingIndex}
                          onSelect={(k) => setSelectedDrawingIndex(Number(k))}
                          className='drawing-tabs'
                          defaultActiveKey={0}
                        >
                          {drawings.map((drawing, index) => (
                            <Tab
                              key={drawing.drawing_id}
                              eventKey={index}
                              title={`Page ${index + 1}`}
                              tabClassName="drawing-tab"
                            >
                              <div className='mt-3'>
                                {renderDrawingPad(drawing, index)}
                                {!drawing.drawing_image_url && (
                                  <div className='alert alert-warning mt-2'>
                                    <i className='fas fa-exclamation-triangle me-2'></i>
                                    Background image not available for this drawing
                                  </div>
                                )}
                              </div>
                            </Tab>
                          ))}
                        </Tabs>
                      </div>
                    )}

                    {/* Single Drawing (no tabs needed) */}
                    {drawings.length === 1 && (
                      <div>
                        {renderDrawingPad(drawings[0], 0)}
                        {!drawings[0].drawing_image_url && (
                          <div className='alert alert-warning mt-2'>
                            <i className='fas fa-exclamation-triangle me-2'></i>
                            Background image not available for this drawing
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback when no drawings are available */
                <div className='card mb-4'>
                  <div className='card-header d-flex align-items-center py-3'>
                    <div className='d-flex align-items-center'>
                      <div className='icon-wrapper bg-secondary bg-opacity-10 rounded-circle p-2 me-3'>
                        <i className='fas fa-image text-secondary fs-5'></i>
                      </div>
                      <h6 className='mb-0 fw-bold text-dark'>Student Answer</h6>
                    </div>
                  </div>
                  <div className='card-body'>
                    <div className='text-center py-4'>
                      <i className='fas fa-image fs-1 text-muted mb-3'></i>
                      <p className='text-muted mb-0'>No drawings available for this answer</p>
                      <small className='text-muted'>The student may have submitted a text answer or the drawing data is not available.</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Remark with Answer Status */}
              <div className='card mb-4'>
                <div className='card-header d-flex align-items-center py-3'>
                  <div className='d-flex align-items-center'>
                    <div className='icon-wrapper bg-secondary bg-opacity-10 rounded-circle p-2 me-3'>
                      <i className='fas fa-comment text-secondary fs-5'></i>
                    </div>
                    <h6 className='mb-0 fw-bold text-dark'>Scores and Feedback</h6>
                  </div>
                </div>
                <div className='card-body'>
                  {/* Tag-based Grading */}
                  {gradingData.question.tags && gradingData.question.tags.length > 0 && (
                    <div className='mb-4'>
                      <div className='d-flex align-items-center mb-3'>
                        <div className='icon-wrapper bg-warning bg-opacity-10 rounded-circle p-2 me-3'>
                          <i className='fas fa-tags text-warning fs-5'></i>
                        </div>
                        <h6 className='mb-0 fw-bold text-dark'>Tag-based Grading</h6>
                      </div>
                      <div className='tag-grading-form'>
                        {gradingData.question.tags.map((tag) => (
                          <div key={tag.tag_id} className='form-group'>
                            <Form.Label className='form-label'>
                              {tag.name} <span className='text-muted'>(Max: {tag.score})</span>
                            </Form.Label>
                            <Form.Control
                              type='number'
                              min={0}
                              max={tag.score}
                              value={tagScores[tag.tag_id] || 0}
                              onChange={(e) => handleTagScoreChange(tag.tag_id, parseInt(e.target.value) || 0)}
                              className='form-control'
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answer Status */}
                  <div className='mb-3'>
                    <Form.Label className='fw-bold d-block mb-2'>Answer Status:</Form.Label>
                    <div className='d-flex gap-3'>
                      <Form.Check
                        type="radio"
                        id="status-correct"
                        name="correctStatus"
                        checked={correctStatus === CORRECT_STATUS.CORRECT}
                        onChange={() => setCorrectStatus(CORRECT_STATUS.CORRECT)}
                        label={
                          <div className='d-flex align-items-center'>
                            <div className='status-indicator bg-success me-2' style={{width: '20px', height: '20px', borderRadius: '50%'}}></div>
                            <span className='fw-bold text-success'>Correct</span>
                          </div>
                        }
                      />
                      <Form.Check
                        type="radio"
                        id="status-partial"
                        name="correctStatus"
                        checked={correctStatus === CORRECT_STATUS.PARTIAL}
                        onChange={() => setCorrectStatus(CORRECT_STATUS.PARTIAL)}
                        label={
                          <div className='d-flex align-items-center'>
                            <div className='status-indicator bg-warning me-2' style={{width: '20px', height: '20px', borderRadius: '50%'}}></div>
                            <span className='fw-bold text-warning'>Partial Correct</span>
                          </div>
                        }
                      />
                      <Form.Check
                        type="radio"
                        id="status-wrong"
                        name="correctStatus"
                        checked={correctStatus === CORRECT_STATUS.WRONG}
                        onChange={() => setCorrectStatus(CORRECT_STATUS.WRONG)}
                        label={
                          <div className='d-flex align-items-center'>
                            <div className='status-indicator bg-danger me-2' style={{width: '20px', height: '20px', borderRadius: '50%'}}></div>
                            <span className='fw-bold text-danger'>Wrong</span>
                          </div>
                        }
                      />
                    </div>
                  </div>

                  {/* Teacher Remark */}
                  <Form.Group>
                    <Form.Label className='fw-bold d-block mb-2'>Feedback:</Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={4}
                      placeholder='Add any feedback or comments for the student...'
                      value={teacherRemark}
                      onChange={(e) => setTeacherRemark(e.target.value)}
                      className='form-control'
                      style={{ resize: 'vertical', minHeight: '100px' }}
                    />
                    <div className='form-text text-muted mt-2'>
                      <i className='fas fa-info-circle me-1'></i>
                      Your feedback will be visible to the student
                    </div>
                  </Form.Group>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal.Body>
      
      <Modal.Footer 
        style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderTop: '2px solid #e9ecef'}}
      >
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting || loading || !gradingData}
          className={submitting ? 'indicator' : ''}
        >
          {submitting ? (
            <>
              <span className='indicator-progress'>
                <span className='spinner-border spinner-border-sm me-2'></span>
                Submitting...
              </span>
            </>
          ) : (
            <>
              <i className='fas fa-check me-2'></i>
              Submit Grade
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default GradingModal 