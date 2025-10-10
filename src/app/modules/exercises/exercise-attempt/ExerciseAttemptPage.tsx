import {FC, useState, useEffect, useCallback, useRef} from 'react'
import {useNavigate, useParams, useLocation} from 'react-router-dom'
import {useDispatch} from 'react-redux'

import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {toast} from '../../../../_metronic/helpers/toast'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'
import {DrawingPad} from '../../../../components/DrawingPad'
import ImageModal from '../../../../components/Modal/ImageModal'
import {renderHtmlSafely, hasImages} from '../../../../_metronic/helpers/htmlRenderer'
import {startExerciseAttempt, submitExercise} from '../../../../store/exercises/studentExercisesSlice'
import {AppDispatch} from '../../../../store'
import {ConfirmationDialog} from '../../../../_metronic/helpers/ConfirmationDialog'


import axios from 'axios'
import {getHeadersWithSchoolSubject} from '../../../../_metronic/helpers/axios'
import './ExerciseAttemptPage.scss'

interface SavedAnswer {
  answer_id: string
  question_type: number
  mc_answer?: string
  tf_answer?: number
  lq_answer?: string
  fill_blanks_answer?: string[]
  answered_at: string
  updated_at: string
  drawings?: Array<{
    drawing_id: string
    drawing_order: number
    file_id: string
    is_primary: boolean
    created_at: string
    file_url: string
    drawing_data?: string
    teacher_grading?: any
  }>
}

interface Question {
  question_id: string
  type: 'mc' | 'lq'
  name: string
  question_content: string
  position: number
  options?: Array<{
    option_letter: string
    option_text: string
  }>
  correct_option?: string
  answer_content?: string
  saved_answer?: SavedAnswer | null
}

interface Assignment {
  assignment_id: string
  status: number
  due_date: string | null
  message_for_student: string | null
  assigned_at: string
  started_at: string | null
}

interface Exercise {
  exercise_id: string
  title: string
  description: string
  status: number
  created_at: string
  updated_at: string
  questions: Question[]
}



interface AttemptResponse {
  assignment: Assignment
  exercise: Exercise
  saved_answers_count: number
}

interface Answer {
  question_id: string
  type: 'mc' | 'lq'
  mc_answer?: string
  lq_answer?: string
}

const ExerciseAttemptPage: FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const {assignmentId: routeAssignmentId} = useParams<{assignmentId: string}>()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const [attemptData, setAttemptData] = useState<AttemptResponse | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showTeacherMessage, setShowTeacherMessage] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const questionContentRef = useRef<HTMLDivElement>(null)
  const [drawingPads, setDrawingPads] = useState<Array<{id: string, questionId: string}>>([])

  // Breadcrumbs for the exercise attempt page
  const exerciseAttemptBreadcrumbs: Array<PageLink> = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      isSeparator: false,
      isActive: false,
    },
    {
      title: '',
      path: '',
      isSeparator: true,
      isActive: false,
    },
    {
      title: 'Exercise Hub',
      path: '/exercises/dashboard',
      isSeparator: false,
      isActive: false,
    },
  ]

  // Handle beforeunload event to warn user when leaving the exercise page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // For refresh/close, we have to use browser's native dialog
      // but we can make it more user-friendly with emoji and better text
      e.preventDefault()
      e.returnValue = '⚠️ Are you sure you want to leave? Your exercise progress may be lost.'
      return '⚠️ Are you sure you want to leave? Your exercise progress may be lost.'
    }

    // Also handle visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Fetch exercise data using assignment ID
  useEffect(() => {
    const fetchExercise = async () => {
      if (!routeAssignmentId) return
      
      try {
        setLoading(true)
        // Fetch exercise details using the attempt endpoint
        const attemptUrl = `${import.meta.env.VITE_APP_API_URL}/student-exercises/assignments/${routeAssignmentId}/attempt`
        const headers = getHeadersWithSchoolSubject(attemptUrl)
        const response = await axios.get(attemptUrl, { 
          headers,
          withCredentials: true 
        })
        
        if (response.data.status === 'success') {
          const attemptData: AttemptResponse = response.data.data
          setExercise(attemptData.exercise)
          setAssignment(attemptData.assignment)
          setAttemptData(attemptData)
          
          // Initialize answers array with saved answers from each question
          const initialAnswers = attemptData.exercise.questions.map((q: Question) => {
            const savedAnswer = q.saved_answer
            
            return {
              question_id: q.question_id,
              type: q.type,
              mc_answer: savedAnswer?.mc_answer || '',
              lq_answer: savedAnswer?.lq_answer || ''
            }
          })
          setAnswers(initialAnswers)
          
          // No welcome prompt needed
          
          // Set the assignment ID from the route parameter
          setAssignmentId(routeAssignmentId)
        } else {
          setError('Failed to load exercise')
        }
      } catch (err) {
        console.error('Error fetching exercise:', err)
        setError('Failed to load exercise')
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [routeAssignmentId])

  const currentQuestion = exercise?.questions[currentQuestionIndex]

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc)
  }

  const handleStartExerciseAttempt = async () => {
    if (!assignmentId) return
    
    try {
      await dispatch(startExerciseAttempt(assignmentId)).unwrap()
    } catch (error: any) {
      toast.error(error || 'Failed to start exercise. Please try again.', 'Error')
    }
  }

  // Add click handlers to images after content is rendered
  useEffect(() => {
    if (questionContentRef.current && hasImages(currentQuestion?.question_content || '')) {
      const images = questionContentRef.current.querySelectorAll('img')
      images.forEach(img => {
        img.style.cursor = 'pointer'
        img.onclick = () => handleImageClick(img.src)
      })
    }
  }, [currentQuestion?.question_content])



  const renderQuestionContent = (content: string) => {
    return <div 
      ref={questionContentRef}
      dangerouslySetInnerHTML={{__html: renderHtmlSafely(content, { maxImageWidth: 600, maxImageHeight: 400 })}} 
    />
  }


  const saveAnswerToAPI = async (questionId: string, questionType: number, answerData: any, drawingPadOrder?: number) => {
    if (!assignmentId) return
    
    try {
      console.log('📤 saveAnswerToAPI called with:', {
        questionId,
        questionType,
        answerDataKeys: Object.keys(answerData),
        drawingPadOrder,
        hasPngBlob: !!answerData.drawing_png_blob,
        hasPngBase64: !!answerData.drawing_png_base64,
        pngBlobSize: answerData.drawing_png_blob?.size || 0,
        pngBase64Length: answerData.drawing_png_base64?.length || 0
      })
      
      const url = `${import.meta.env.VITE_APP_API_URL}/student-exercises/assignments/${assignmentId}/attempts`
      const headers = getHeadersWithSchoolSubject(url)
      
      // For LQ questions, format the data as drawing_canvases with PNG base64
      let formattedPayload
      if (questionType === 1 && answerData.lq_answer) { // LQ question
        formattedPayload = {
          question_id: questionId,
          question_type: questionType,
          last_seen: new Date().toISOString(),
          lq_answer: answerData.lq_answer, // Zwibbler3 JSON data
          drawing_canvases: [
            {
              canvas_data: answerData.drawing_png_base64 || "", // Base64 image data
              drawing_data: answerData.lq_answer || "", // Zwibbler JSON data
              drawing_order: drawingPadOrder || 1
            }
          ]
        }
      } else {
        // For other question types, use the original format
        formattedPayload = {
          question_id: questionId,
          question_type: questionType,
          last_seen: new Date().toISOString(),
          ...answerData
        }
      }
      
      console.log('📤 Sending payload to API:', {
        url,
        payloadKeys: Object.keys(formattedPayload),
        hasLqAnswer: !!formattedPayload.lq_answer,
        drawingCanvases: formattedPayload.drawing_canvases,
        canvasDataLength: formattedPayload.drawing_canvases?.[0]?.canvas_data?.length || 0,
        drawingOrder: formattedPayload.drawing_canvases?.[0]?.drawing_order
      })
      
      const response = await axios.post(url, formattedPayload, {
        headers,
        withCredentials: true
      })
      
      console.log('✅ API call successful')
      
      // Check if the response indicates success
      if (response.data && response.data.status !== 'success') {
        const errorMessage = response.data.message || 'Failed to save answer'
        console.error('❌ API returned non-success status:', response.data)
        toast.error(errorMessage, 'Save Error')
        return
      }
      
      // Update the local exercise state to reflect the saved answer
      // This eliminates the need for an additional API call
      if (exercise) {
        const updatedExercise = {
          ...exercise,
          questions: exercise.questions.map(q => {
            if (q.question_id === questionId) {
              return {
                ...q,
                saved_answer: {
                  answer_id: q.saved_answer?.answer_id || '',
                  question_type: questionType,
                  answered_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...answerData
                }
              }
            }
            return q
          })
        }
        setExercise(updatedExercise)
      }
    } catch (error: any) {
      console.error('❌ Failed to save answer:', error)
      
      // Extract error message from response
      let errorMessage = 'Failed to save answer. Please try again.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Show error toast to user
      toast.error(errorMessage, 'Save Error')
    }
  }

  const handleMCAnswer = (optionLetter: string) => {
    if (!currentQuestion) return
    
    const newAnswers = [...answers]
    const answerIndex = newAnswers.findIndex(a => a.question_id === currentQuestion.question_id)
    
    if (answerIndex >= 0) {
      if (optionLetter === '') {
        // Clear the answer
        newAnswers[answerIndex] = {
          ...newAnswers[answerIndex],
          mc_answer: ''
        }
      } else {
        // Set the answer
        newAnswers[answerIndex] = {
          ...newAnswers[answerIndex],
          mc_answer: optionLetter
        }
      }
    } else {
      newAnswers.push({
        question_id: currentQuestion.question_id,
        type: 'mc',
        mc_answer: optionLetter
      })
    }
    
    setAnswers(newAnswers)
    setHasUnsavedChanges(true)
    
    // Save to API (even for empty answers)
    saveAnswerToAPI(currentQuestion.question_id, 0, { mc_answer: optionLetter })
  }

  // Handle LQ answer changes
  const handleLQAnswer = (content: string) => {
    if (!currentQuestion) return
    
    const updatedAnswers = answers.map(answer => 
      answer.question_id === currentQuestion.question_id 
        ? { ...answer, lq_answer: content }
        : answer
    )
    setAnswers(updatedAnswers)
    setHasUnsavedChanges(true)
  }

  // Add a new drawing pad
  const addDrawingPad = () => {
    if (!currentQuestion) return
    
    const newDrawingPad = {
      id: `drawing-${Date.now()}`,
      questionId: currentQuestion.question_id
    }
    setDrawingPads(prev => [...prev, newDrawingPad])
  }

  // Remove a drawing pad
  const removeDrawingPad = (id: string) => {
    // Check if it's a manually added drawing pad
    const isManualPad = drawingPads.find(pad => pad.id === id)
    
    if (isManualPad) {
      // Remove from manually added drawing pads
      setDrawingPads(prev => prev.filter(pad => pad.id !== id))
    } else {
      // Remove from API response drawings by updating the question's saved answer
      if (currentQuestion?.saved_answer?.drawings) {
        const updatedDrawings = currentQuestion.saved_answer.drawings.filter(
          drawing => drawing.drawing_id !== id
        )
        
        // Update the current question's saved answer
        const updatedQuestions = exercise?.questions.map(q => 
          q.question_id === currentQuestion.question_id 
            ? {
                ...q,
                saved_answer: {
                  ...q.saved_answer!,
                  drawings: updatedDrawings
                }
              }
            : q
        )
        
        if (updatedQuestions) {
          setExercise(prev => prev ? { ...prev, questions: updatedQuestions } : null)
        }
      }
    }
  }

  const getCurrentAnswer = () => {
    return answers.find(answer => answer.question_id === currentQuestion?.question_id)
  }

  // Function to determine if a question is long based on question type
  const isLongQuestion = (questionType: string) => {
    return questionType === 'lq'
  }

  // Function to check if a string looks like Zwibbler3 JSON data
  const isZwibbler3Data = (data: string): boolean => {
    // Check if it starts with "zwibbler3." (the actual Zwibbler3 format)
    if (data.startsWith('zwibbler3.')) {
      return true
    }
    
    try {
      const parsed = JSON.parse(data)
      // Check if it has the basic Zwibbler3 structure
      return parsed && typeof parsed === 'object' && 
             (parsed.version === '3.0' || parsed.pages || parsed.nodes)
    } catch {
      return false
    }
  }

  // Function to load existing drawing data into the DrawingPad
  const loadExistingDrawingData = useCallback((questionId: string): string | null => {
    // First check if there's a saved answer for this question
    const currentQuestion = exercise?.questions.find(q => q.question_id === questionId)
    if (currentQuestion?.saved_answer?.lq_answer) {
      const savedData = currentQuestion.saved_answer.lq_answer
      if (isZwibbler3Data(savedData)) {
        return savedData
      }
    }
    
    // Also check the local answers state
    const localAnswer = answers.find(a => a.question_id === questionId)
    if (localAnswer?.lq_answer && isZwibbler3Data(localAnswer.lq_answer)) {
      return localAnswer.lq_answer
    }
    
    return null
  }, [exercise, answers])

  const handleNext = () => {
    if (currentQuestionIndex < (exercise?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!exercise || !assignmentId) return
    setSubmitting(true)
    try {
      // Call the submit API using Redux action
      await dispatch(submitExercise(assignmentId)).unwrap()
      toast.success('Exercise submitted successfully!', 'Success')
      setHasUnsavedChanges(false)
      // Navigate to the result page
      navigate(`/exercises/myresult/${assignmentId}`)
    } catch (err) {
      console.error('Error submitting exercise:', err)
      toast.error('Failed to submit exercise. Please try again.', 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false)
    await handleSubmit()
  }

  const isLastQuestion = currentQuestionIndex === (exercise?.questions.length || 0) - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const currentAnswer = getCurrentAnswer()

  // Calculate saved answers count locally instead of fetching from API
  const getSavedAnswersCount = () => {
    if (!exercise) return 0
    return exercise.questions.filter(question => {
      const savedAnswer = question.saved_answer
      if (!savedAnswer) return false
      
      // Check if the answer has actual content
      if (question.type === 'mc') {
        return savedAnswer.mc_answer && savedAnswer.mc_answer.trim() !== ''
      } else if (question.type === 'lq') {
        return savedAnswer.lq_answer && savedAnswer.lq_answer.trim() !== ''
      }
      return false
    }).length
  }



  // Simple navigation function
  const navigateWithConfirmation = useCallback((path: string) => {
    navigate(path)
  }, [navigate])

  if (loading) {
    return (
      <>
        <PageTitle breadcrumbs={exerciseAttemptBreadcrumbs}>
          Exercise Attempt
        </PageTitle>
        <KTCard>
          <div className='card-body text-center py-10'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <div className='mt-3'>Loading exercise...</div>
          </div>
        </KTCard>
      </>
    )
  }



  if (error || !exercise || !assignment) {
    return (
      <>
        <PageTitle breadcrumbs={exerciseAttemptBreadcrumbs}>
          Exercise Attempt
        </PageTitle>
        <KTCard>
          <div className='card-body text-center py-10'>
            <i className='fas fa-exclamation-triangle fs-3x text-danger mb-4'></i>
            <h4 className='text-danger mb-2'>Error Loading Exercise</h4>
            <p className='text-muted'>{error}</p>
            <button 
              className='btn btn-primary'
              onClick={() => navigateWithConfirmation('/dashboard')}
            >
              <i className='fas fa-arrow-left me-1'></i>
              Back to Dashboard
            </button>
          </div>
        </KTCard>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={exerciseAttemptBreadcrumbs}>
        {exercise.title}
      </PageTitle>
      
      <div className='exercise-attempt-page'>
        {/* Header */}
        <div className='exercise-header mb-2'>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <h2 className='mb-1'>{exercise.title}</h2>
              <p className='text-muted mb-0'>{exercise.description}</p>
            </div>
            <div className='question-progress'>
              {getSavedAnswersCount() > 0 && (
                <span className='badge badge-light-info fs-6'>
                  {getSavedAnswersCount()} answered
                </span>
              )}
            </div>
          </div>
          
          {/* Teacher Message - Collapsible */}
          {assignment.message_for_student && (
            <div className='mt-4'>
              <div 
                className='alert alert-primary py-3 px-4 mb-0 teacher-message-container'
                onClick={() => setShowTeacherMessage(!showTeacherMessage)}
                style={{cursor: 'pointer'}}
              >
                <div className='d-flex justify-content-between align-items-start'>
                  <div className='d-flex align-items-center'>
                    <i className='fas fa-comment me-2'></i>
                    <strong>Teacher's Message</strong>
                  </div>
                </div>
                {showTeacherMessage && (
                  <div className='mt-3 pt-3 border-top'>
                    <p className='mb-0'>{assignment.message_for_student}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question Navigation */}
        <div className='question-navigation mb-4'>
          <div className='d-flex justify-content-center'>
            <div className='btn-group' role='group'>
              {exercise.questions.map((question, index) => {
                const questionAnswer = answers.find(a => a.question_id === question.question_id)
                const hasAnswer = questionAnswer && (
                  (questionAnswer.mc_answer && questionAnswer.mc_answer.trim() !== '') ||
                  (questionAnswer.lq_answer && questionAnswer.lq_answer.trim() !== '')
                )
                
                return (
                  <button
                    key={index}
                    type='button'
                    className={`btn btn-sm ${
                      index === currentQuestionIndex 
                        ? 'btn-primary' 
                        : 'btn-secondary'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                    title={hasAnswer ? 'Answered' : 'Not answered'}
                  >
                    {index + 1}
                    {hasAnswer && (
                      <i className='fas fa-circle ms-1' style={{fontSize: '0.5em'}}></i>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <KTCard>
          <div className='card-body'>
            {currentQuestion && (
              <div className='question-content'>
                <div className='question-header mb-4'>
                  <div className='d-flex align-items-center gap-2 mb-3'>
                    <span className='text-muted'>#{currentQuestion.position}</span>
                    <span className={`badge badge-light-${
                      currentQuestion.type === 'mc' ? 'primary' : 'success'
                    }`}>
                      {currentQuestion.type === 'mc' ? 'Multiple Choice' : 'Long Question'}
                    </span>
                  </div>
                  <div>
                    <h4 className='mb-2'>{renderQuestionContent(currentQuestion.question_content)}</h4>
                  </div>
                </div>

                {/* Answer Section */}
                <div className='answer-section'>
                  {currentQuestion.type === 'mc' ? (
                    <div className='mc-options'>
                      <h6 className='mb-3'>Select your answer:</h6>
                      <div className='options-list'>
                        {currentQuestion.options?.map((option) => (
                          <div key={option.option_letter} className='option-item mb-3'>
                            <div className='form-check'>
                              <input
                                className='form-check-input'
                                type='radio'
                                name={`mc-${currentQuestion.question_id}`}
                                id={`option-${option.option_letter}`}
                                value={option.option_letter}
                                checked={currentAnswer?.mc_answer === option.option_letter}
                                onChange={() => handleMCAnswer(option.option_letter)}
                              />
                              <label className='form-check-label' htmlFor={`option-${option.option_letter}`}>
                                <div className='d-flex align-items-start'>
                                  <span className='option-letter me-3'>{option.option_letter}.</span>
                                  <div 
                                    className='option-content'
                                    dangerouslySetInnerHTML={{__html: option.option_text}}
                                  />
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                        {currentAnswer?.mc_answer && (
                          <div className='mt-4 pt-3 border-top'>
                            <button
                              type='button'
                              className='btn btn-link text-muted p-0'
                              onClick={() => handleMCAnswer('')}
                              style={{textDecoration: 'none'}}
                            >
                              <i className='fas fa-times me-1'></i>
                              Clear selection
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='lq-answer'>
                      <h6 className='mb-3'>Write your answer:</h6>
                      {isLongQuestion(currentQuestion.type) ? (
                        <div>
                          {/* Display existing drawings from API response */}
                          {currentQuestion.saved_answer?.drawings && currentQuestion.saved_answer.drawings.length > 0 ? (
                            <div>
                              {currentQuestion.saved_answer.drawings.map((drawing, index) => (
                                <div key={drawing.drawing_id} className="mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <span className="badge badge-light-success">Page {index + 1}</span>
                                    {index > 0 && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger ms-2"
                                        onClick={() => removeDrawingPad(drawing.drawing_id)}
                                        title="Remove this drawing page"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    )}
                                  </div>
                                  <DrawingPad
                                    width={800}
                                    height={600}
                                    className="w-100"
                                    saveFunction={(questionId, questionType, answerData) => saveAnswerToAPI(questionId, questionType, answerData, drawing.drawing_order)}
                                    questionId={currentQuestion.question_id}
                                    backgroundImageUrl={drawing.file_url}
                                    initialDrawingData={drawing.drawing_data || undefined}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Main DrawingPad when no existing drawings */
                            <DrawingPad
                              width={800}
                              height={600}
                              className="w-100 mb-3"
                              saveFunction={(questionId, questionType, answerData) => saveAnswerToAPI(questionId, questionType, answerData, 1)}
                              questionId={currentQuestion.question_id}
                              initialDrawingData={loadExistingDrawingData(currentQuestion.question_id) || undefined}
                            />
                          )}
                          
                          {/* Additional DrawingPads for new drawings */}
                          {drawingPads.map((pad, index) => (
                            <div key={pad.id} className="position-relative mb-3">
                              <DrawingPad
                                width={800}
                                height={600}
                                className="w-100"
                                saveFunction={(questionId, questionType, answerData) => saveAnswerToAPI(questionId, questionType, answerData, index + 2)}
                                questionId={pad.questionId}
                                initialDrawingData={undefined}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger position-absolute"
                                style={{ top: '10px', right: '10px' }}
                                onClick={() => removeDrawingPad(pad.id)}
                                title="Remove this drawing pad"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                          
                          {/* Add More DrawingPad Button */}
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={addDrawingPad}
                          >
                            <i className="fas fa-plus me-2"></i>
                            Add Another Drawing Pad
                          </button>
                        </div>
                      ) : (
                        <TinyMCEEditor
                          value={currentAnswer?.lq_answer || ''}
                          onBlur={handleLQAnswer}
                          height={300}
                          placeholder='Enter your answer here...'
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </KTCard>

        {/* Navigation Buttons */}
        <div className='navigation-buttons mt-6'>
          <div className='d-flex justify-content-between'>
            <button
              type='button'
              className='btn btn-secondary'
              disabled={isFirstQuestion}
              onClick={handlePrevious}
            >
              <i className='fas fa-chevron-left me-1'></i>
              Previous
            </button>

            <div className='d-flex gap-2'>
              {!isLastQuestion && (
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleNext}
                >
                  Next
                  <i className='fas fa-chevron-right ms-1'></i>
                </button>
              )}
              <button
                type='button'
                className='btn btn-success'
                disabled={submitting}
                onClick={handleSubmitClick}
              >
                {submitting ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className='fas fa-check me-1'></i>
                    Submit Exercise
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <ConfirmationDialog
        show={showSubmitConfirm}
        onHide={() => setShowSubmitConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Exercise"
        message="Are you sure you want to submit this exercise? Once submitted, you cannot make any changes to your answers. Please review your answers before proceeding."
        confirmText="Submit Exercise"
        cancelText="Cancel"
        variant="warning"
        loading={submitting}
        loadingText="Submitting..."
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Question Image"
      />
    </>
  )
}

export default ExerciseAttemptPage