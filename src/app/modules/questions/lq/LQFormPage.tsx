import {FC, useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../../store'
import {fetchTags, Tag} from '../../../../store/tags/tagsSlice'
import {createQuestion, fetchQuestionById, updateQuestion} from '../../../../store/questions/questionsSlice'
import {processContentToText, setProcessedContent, generateRubric} from '../../../../store/ai/aiSlice'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {toast} from '../../../../_metronic/helpers/toast'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'
import TagWithScore, {TagWithScoreData} from '../components/TagWithScore'
import AIEditorWithButton from '../../../../components/AI/AIEditorWithButton'
import AIProcessedContentModal from '../../../../components/AI/AIProcessedContentModal'
import AIGeneratedQuestionsModal from '../components/AIGeneratedQuestionsModal'
import {useAIImageToText} from '../../../../hooks/useAIImageToText'
import {transformLQQuestionForBackend} from '../components/questionTransformers'

// Define GeneratedQuestion interface to match the modal's expectations
interface GeneratedQuestion {
  type: 'mc' | 'lq'
  name?: string
  question_content: string
  teacher_remark: string
  lq_question?: {
    answer_content: string
    rubric_content?: string
  }
  mc_question?: {
    options: Array<{
      option_letter: string
      option_text: string
    }>
    correct_option: string
    answer_content?: string
  }
}

const lqValidationSchema = Yup.object().shape({
  teacherRemark: Yup.string()
    .max(500, 'Maximum 500 characters'),
  question: Yup.string()
    .max(5000, 'Maximum 5000 characters'),
  answer: Yup.string()
    .max(5000, 'Maximum 5000 characters'),
  rubricShouldHave: Yup.string()
    .max(5000, 'Maximum 5000 characters'),
  rubricShouldNotHave: Yup.string()
    .max(5000, 'Maximum 5000 characters'),
  selectedTags: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      name: Yup.string().required(),
      score: Yup.number().min(0)
    })
  ),
})

interface LQFormData {
  teacherRemark: string
  question: string
  answer: string
  rubricShouldHave: string
  rubricShouldNotHave: string
  selectedTags: TagWithScoreData[]
}



const LQFormPage: FC = () => {
  const navigate = useNavigate()
  const { qId } = useParams<{ qId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!qId
  
  // State for storing the question ID returned from image uploads
  const [currentQuestionId, setCurrentQuestionId] = useState<string | undefined>(qId)
  
  // State for AI generated questions modal
  const [showAIGeneratedQuestionsModal, setShowAIGeneratedQuestionsModal] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [generatingSimilarQuestions, setGeneratingSimilarQuestions] = useState(false)
  const [creatingMultipleQuestions, setCreatingMultipleQuestions] = useState(false)
  

  


  // Custom hook for AI functionality
  const { processingField, handleAIImageToText } = useAIImageToText('lq')

  // Redux selectors
  const { tags, loading: tagsLoading } = useSelector((state: RootState) => state.tags)
  const { creating, currentQuestion, loading: questionLoading } = useSelector((state: RootState) => state.questions)
  const { processedContent, success, targetField } = useSelector((state: RootState) => state.ai)

  // Helper function to transform tags to the required format
  const transformTags = (selectedTags: TagWithScoreData[]) => {
    const result = selectedTags.map(tag => {
      // Check if it's an existing tag (has a real UUID)
      const existingTag = tags.find(t => t.id === tag.id)
      if (existingTag) {
        const transformed = { tag_id: tag.id, score: tag.score }
        return transformed
      } else {
        // It's a new tag (starts with 'temp-')
        const transformed = { name: tag.name, score: tag.score }
        return transformed
      }
    })
    return result
  }
  


  // Fetch tags on component mount
  useEffect(() => {
    dispatch(fetchTags())
  }, [dispatch])

  // Fetch question data if in edit mode
  useEffect(() => {
    if (isEditMode && qId) {
      dispatch(fetchQuestionById(qId))
    }
  }, [dispatch, isEditMode, qId])

  // Update breadcrumbs based on mode
  const breadcrumbs = isEditMode 
    ? [
        {
          title: 'Home',
          path: '/dashboard',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Long Question List',
          path: '/questions/lq/list',
          isSeparator: false,
          isActive: false,
        }
      ]
    : [
        {
          title: 'Home',
          path: '/dashboard',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Long Question List',
          path: '/questions/lq/list',
          isSeparator: false,
          isActive: false,
        }
      ]

  // Check if question is assigned
  const isAssigned = isEditMode && currentQuestion?.is_assigned === 1

  const formik = useFormik<LQFormData>({
    initialValues: {
      teacherRemark: '',
      question: '',
      answer: '',
      rubricShouldHave: '',
      rubricShouldNotHave: '',
      selectedTags: [],
    },
    validationSchema: lqValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      try {
        const transformedTags = transformTags(values.selectedTags)

        // Format rubric fields as object
        const rubricObject = {
          include: values.rubricShouldHave,
          exclude: values.rubricShouldNotHave
        }

        if (isEditMode) {
          const questionData = transformLQQuestionForBackend(
            'lq',
            values.question,
            values.teacherRemark,
            values.answer,
            transformedTags,
            currentQuestionId,
            rubricObject
          )
          
          await dispatch(updateQuestion({qId, questionData})).unwrap()
          toast.success('Long Question updated successfully!', 'Success')
        } else {
          // Create mode - create questionData with question_id if available
          const questionData = transformLQQuestionForBackend(
            'lq',
            values.question,
            values.teacherRemark,
            values.answer,
            transformedTags,
            currentQuestionId,
            rubricObject
          )
          
          await dispatch(createQuestion(questionData)).unwrap()
          toast.success('Long Question created successfully!', 'Success')
        }
        
        navigate('/questions/lq/list')
      } catch (error) {
        console.error('Error saving LQ:', error)
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} Long Question. Please try again.`, 'Error')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Update form values when question data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && currentQuestion) {
      // Set the current question ID for edit mode
      setCurrentQuestionId(currentQuestion.q_id)
      
      // Transform the tags from API format to our component format
      const transformedTags: TagWithScoreData[] = (currentQuestion.tags || []).map(tag => ({
        id: tag.tag_id || '',
        name: tag.name || '',
        score: tag.score !== undefined ? tag.score : 0
      })) as TagWithScoreData[]

      // Parse existing rubric content
      const existingRubric = currentQuestion.lq_question?.rubric_content
      let rubricShouldHave = ''
      let rubricShouldNotHave = ''
      
      if (existingRubric) {
        if (typeof existingRubric === 'object' && existingRubric !== null && ('include' in existingRubric || 'exclude' in existingRubric)) {
          // New format: object with include/exclude properties
          rubricShouldHave = (existingRubric as { include?: string; exclude?: string }).include || ''
          rubricShouldNotHave = (existingRubric as { include?: string; exclude?: string }).exclude || ''
        } else if (typeof existingRubric === 'string') {
          // Legacy format: string that needs parsing
          const parts = existingRubric.split(/Should not have:/i)
          if (parts.length === 2) {
            rubricShouldHave = parts[0].replace(/Should contain:\s*/i, '').trim()
            rubricShouldNotHave = parts[1].trim()
          } else {
            // Fallback: if format doesn't match, put all content in should contain
            rubricShouldHave = existingRubric
          }
        }
      }

      // Delay setting form values to ensure TinyMCE editors are ready
      setTimeout(() => {
        formik.setValues({
          question: currentQuestion.question_content || '',
          teacherRemark: currentQuestion.teacher_remark || '',
          answer: currentQuestion.lq_question?.answer_content || '',
          rubricShouldHave,
          rubricShouldNotHave,
          selectedTags: transformedTags,
        }, false) // Set validateOnChange to false to prevent validation during load
      }, 500) // 500ms delay to ensure editors are initialized
    }
  }, [currentQuestion, isEditMode])

  // Update currentQuestionId when questionId prop changes
  useEffect(() => {
    if (qId) {
      setCurrentQuestionId(qId)
    }
  }, [qId])

  // Handle AI-generated rubric content
  useEffect(() => {
    if (success && targetField === 'rubric' && processedContent) {
      if (typeof processedContent === 'object' && processedContent !== null && 'include' in processedContent && 'exclude' in processedContent) {
        // Populate rubric textareas directly
        formik.setFieldValue('rubricShouldHave', processedContent.include)
        formik.setFieldValue('rubricShouldNotHave', processedContent.exclude)
        formik.setFieldTouched('rubricShouldHave', true)
        formik.setFieldTouched('rubricShouldNotHave', true)
        toast.success('AI-generated rubric applied successfully!', 'Success')
      }
    }
  }, [success, targetField, processedContent])

  // Handle image uploads to update currentQuestionId when question_id is returned
  const handleImageUpload = (fileId: string, url: string, field: 'question' | 'answer', questionId?: string) => {
    // If we received a question ID from the image upload, update our state
    if (questionId) {
      setCurrentQuestionId(questionId)
    }
  }



  // Handle accepting processed content from modal
  const handleAcceptProcessedContent = (content: string | { include: string; exclude: string }, field: 'question' | 'answer' | 'rubric') => {
    if (field === 'rubric') {
      if (typeof content === 'object' && content !== null && ('include' in content || 'exclude' in content)) {
        // New format: object with include/exclude properties
        formik.setFieldValue('rubricShouldHave', (content as { include?: string; exclude?: string }).include || '')
        formik.setFieldValue('rubricShouldNotHave', (content as { include?: string; exclude?: string }).exclude || '')
        formik.setFieldTouched('rubricShouldHave', true)
        formik.setFieldTouched('rubricShouldNotHave', true)
      } else if (typeof content === 'string') {
        // Legacy format: string that needs parsing
        const parts = content.split(/Should not have:/i)
        if (parts.length === 2) {
          const shouldContain = parts[0].replace(/Should contain:\s*/i, '').trim()
          const shouldNotHave = parts[1].trim()
          formik.setFieldValue('rubricShouldHave', shouldContain)
          formik.setFieldValue('rubricShouldNotHave', shouldNotHave)
          formik.setFieldTouched('rubricShouldHave', true)
          formik.setFieldTouched('rubricShouldNotHave', true)
        } else {
          // Fallback: if format doesn't match, put all content in should contain
          formik.setFieldValue('rubricShouldHave', content)
          formik.setFieldTouched('rubricShouldHave', true)
        }
      }
    } else {
      formik.setFieldValue(field, content as string)
      formik.setFieldTouched(field, true)
    }
    toast.success('AI processed content applied successfully!', 'Success')
  }

  // Handle accepting generated questions
  const handleAcceptGeneratedQuestions = (questions: GeneratedQuestion[], questionIds?: Map<number, string>) => {
    try {
      // This would typically create multiple questions
      toast.success(`${questions.length} questions accepted!`, 'Success')
      setShowAIGeneratedQuestionsModal(false)
    } catch (error) {
      toast.error('Failed to accept generated questions', 'Error')
    }
  }

  // Handle accepting single generated question
  const handleAcceptSingleQuestion = async (question: any, questionId?: string) => {
    try {
      // This would typically create a single question
      toast.success('Question accepted!', 'Success')
    } catch (error) {
      toast.error('Failed to accept question', 'Error')
    }
  }

  // Handle using generated question in current form
  const handleUseInCurrentForm = (question: any) => {
    try {
      // Populate the current form with the generated content
      if (question.question_content) {
        formik.setFieldValue('question', question.question_content)
        formik.setFieldTouched('question', true)
      }
      
      if (question.lq_question?.answer_content) {
        formik.setFieldValue('answer', question.lq_question.answer_content)
        formik.setFieldTouched('answer', true)
      }
      
      if (question.teacher_remark) {
        formik.setFieldValue('teacherRemark', question.teacher_remark)
        formik.setFieldTouched('teacherRemark', true)
      }
      
      // Close the modal
      setShowAIGeneratedQuestionsModal(false)
      
      toast.success('Generated content applied to current form!', 'Success')
    } catch (error) {
      toast.error('Failed to apply generated content to form', 'Error')
    }
  }

  if (tagsLoading || (isEditMode && questionLoading)) {
    return (
      <>
        <PageTitle breadcrumbs={breadcrumbs}>
          {isEditMode ? 'Edit Long Question' : 'Create Long Question'}
        </PageTitle>
        <KTCard>
          <div className='card-body'>
            <div className='d-flex justify-content-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        </KTCard>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>
        {isEditMode ? 'Edit Long Question' : 'Create Long Question'}
      </PageTitle>
      
      {/* Warning Banner for Assigned Questions */}
      {isAssigned && (
        <div className='alert alert-warning d-flex align-items-center mb-5' role='alert'>
          <i className='fas fa-exclamation-triangle fs-2 me-3'></i>
          <div>
            <h5 className='mb-1'>
              This question cannot be edited because it has been assigned to one or more exercises.
            </h5>
          </div>
        </div>
      )}
      
      <KTCard>
        <div className='card-header'>
          <h3 className='card-title'>
            {isEditMode ? 'Edit Long Question' : 'Create New Long Question'}
          </h3>
        </div>
        
        <div className='card-body'>
          <form onSubmit={formik.handleSubmit} className='form'>


            {/* Question Content */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-semibold fs-6'>
                Question
              </label>
              <div className='col-lg-9'>
                <div style={{ opacity: isAssigned ? 0.6 : 1, pointerEvents: isAssigned ? 'none' : 'auto' }}>
                  <AIEditorWithButton
                    field='question'
                    value={formik.values.question}
                    onBlur={(content) => {
                      if (!isAssigned) {
                        formik.setFieldValue('question', content)
                        formik.setFieldTouched('question', true)
                      }
                    }}
                    isProcessing={processingField !== null}
                    processingField={processingField}
                    onAIClick={handleAIImageToText}
                    onImageUpload={handleImageUpload}
                    questionType='lq'
                    questionId={currentQuestionId || qId}
                    height={400}
                    placeholder='Enter the question content...'
                    editorKey={`question-editor-${isEditMode ? qId : 'create'}`}
                  />
                </div>
                {formik.touched.question && formik.errors.question && (
                  <div className='fv-plugins-message-container invalid-feedback d-block'>
                    <div>{formik.errors.question}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Content */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-semibold fs-6'>
                Answer
              </label>
              <div className='col-lg-9'>
                <div style={{ opacity: isAssigned ? 0.6 : 1, pointerEvents: isAssigned ? 'none' : 'auto' }}>
                  <AIEditorWithButton
                    field='answer'
                    value={formik.values.answer}
                    onBlur={(content) => {
                      if (!isAssigned) {
                        formik.setFieldValue('answer', content)
                        formik.setFieldTouched('answer', true)
                      }
                    }}
                    isProcessing={processingField !== null}
                    processingField={processingField}
                    onAIClick={handleAIImageToText}
                    onImageUpload={handleImageUpload}
                    questionType='lq'
                    questionId={currentQuestionId || qId}
                    height={400}
                    placeholder='Enter the answer content...'
                    editorKey={`answer-editor-${isEditMode ? qId : 'create'}`}
                  />
                </div>
                {formik.touched.answer && formik.errors.answer && (
                  <div className='fv-plugins-message-container invalid-feedback d-block'>
                    <div>{formik.errors.answer}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Rubric Content */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-semibold fs-6'>
                Rubric
              </label>
              <div className='col-lg-9'>
                {/* Should Contain Section */}
                <div className='mb-4'>
                  <label className='form-label fw-semibold fs-6 mb-2'>
                    Should contain
                  </label>
                  <textarea
                    className={clsx(
                      'form-control form-control-lg form-control-solid',
                      {
                        'is-valid': formik.touched.rubricShouldHave && !formik.errors.rubricShouldHave,
                        'is-invalid': formik.touched.rubricShouldHave && formik.errors.rubricShouldHave,
                      }
                    )}
                    rows={4}
                    placeholder='Enter what the answer should contain...'
                    value={formik.values.rubricShouldHave}
                    onChange={(e) => {
                      if (!isAssigned) {
                        formik.setFieldValue('rubricShouldHave', e.target.value)
                        formik.setFieldTouched('rubricShouldHave', true)
                      }
                    }}
                    onBlur={() => formik.setFieldTouched('rubricShouldHave', true)}
                    disabled={isAssigned}
                  />
                  {formik.touched.rubricShouldHave && formik.errors.rubricShouldHave && (
                    <div className='fv-plugins-message-container invalid-feedback d-block'>
                      <div>{formik.errors.rubricShouldHave}</div>
                    </div>
                  )}
                </div>

                {/* Should Not Have Section */}
                <div className='mb-4'>
                  <label className='form-label fw-semibold fs-6 mb-2'>
                    Should not have
                  </label>
                  <textarea
                    className={clsx(
                      'form-control form-control-lg form-control-solid',
                      {
                        'is-valid': formik.touched.rubricShouldNotHave && !formik.errors.rubricShouldNotHave,
                        'is-invalid': formik.touched.rubricShouldNotHave && formik.errors.rubricShouldNotHave,
                      }
                    )}
                    rows={4}
                    placeholder='Enter what the answer should not have...'
                    value={formik.values.rubricShouldNotHave}
                    onChange={(e) => {
                      if (!isAssigned) {
                        formik.setFieldValue('rubricShouldNotHave', e.target.value)
                        formik.setFieldTouched('rubricShouldNotHave', true)
                      }
                    }}
                    onBlur={() => formik.setFieldTouched('rubricShouldNotHave', true)}
                    disabled={isAssigned}
                  />
                  {formik.touched.rubricShouldNotHave && formik.errors.rubricShouldNotHave && (
                    <div className='fv-plugins-message-container invalid-feedback d-block'>
                      <div>{formik.errors.rubricShouldNotHave}</div>
                    </div>
                  )}
                </div>

                {/* AI Generate Button */}
                <div className='mt-2'>
                  <button
                    type='button'
                    className='btn btn-sm btn-primary'
                    style={{ backgroundColor: '#009ef7', borderColor: '#009ef7' }}
                    disabled={!formik.values.question.trim() || !formik.values.answer.trim() || processingField !== null || isAssigned}
                    onClick={async () => {
                      if (formik.values.question.trim() && formik.values.answer.trim()) {
                        try {
                          await dispatch(generateRubric({
                            question_content: formik.values.question,
                            answer_content: formik.values.answer,
                            question_id: currentQuestionId || qId
                          })).unwrap()
                        } catch (error) {
                          // Error is already handled by the thunk
                        }
                      }
                    }}
                  >
                    {processingField === 'rubric' ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-1'></span>
                        Generating...
                      </>
                    ) : processingField !== null ? (
                      <>
                        <i className='fas fa-clock me-1'></i>
                        Wait for processing...
                      </>
                    ) : (
                      <>
                        <i className='fas fa-robot me-1'></i>
                        Generate Rubric with AI
                      </>
                    )}
                  </button>
                </div>
                <div className='form-text'>
                  Use AI to generate a grading rubric based on your question and answer content. Make sure both question and answer are filled before generating.
                </div>
              </div>
            </div>

{/* Tags */}
<div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-semibold fs-6'>
                Tags with Scores
              </label>
              <div className='col-lg-9'>
                <div style={{ opacity: isAssigned ? 0.6 : 1, pointerEvents: isAssigned ? 'none' : 'auto' }}>
                  <TagWithScore
                    options={tags}
                    selectedTags={formik.values.selectedTags}
                    onChange={(tags) => !isAssigned && formik.setFieldValue('selectedTags', tags)}
                    placeholder='Select tags or type to create new ones (optional)'
                  />
                </div>
              </div>
            </div>

            {/* Teacher Remark */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-semibold fs-6'>
                Teacher Remark
              </label>
              <div className='col-lg-9'>
                <textarea
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {
                      'is-valid': formik.touched.teacherRemark && !formik.errors.teacherRemark,
                      'is-invalid': formik.touched.teacherRemark && formik.errors.teacherRemark,
                    }
                  )}
                  rows={3}
                  placeholder='Enter any teacher remarks or notes...'
                  {...formik.getFieldProps('teacherRemark')}
                  disabled={isAssigned}
                />
                {formik.touched.teacherRemark && formik.errors.teacherRemark && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.teacherRemark}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className='row mb-6'>
              <div className='col-lg-9 offset-lg-3'>
                <div className='d-flex gap-3'>
                  {isEditMode ? (
                    <>
                      <button
                        type='button'
                        className='btn btn-primary btn-lg'
                        disabled={isSubmitting || creating || !formik.isValid || isAssigned}
                        onClick={async () => {
                          if (formik.isValid) {
                            setIsSubmitting(true)
                            try {
                              const transformedTags = transformTags(formik.values.selectedTags)
                              const rubricObject = {
                                include: formik.values.rubricShouldHave,
                                exclude: formik.values.rubricShouldNotHave
                              }

                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId,
                                rubricObject
                              )
                              
                              await dispatch(updateQuestion({qId, questionData})).unwrap()
                              toast.success('Long Question updated successfully!', 'Success')
                              // Stay on this page - no navigation
                            } catch (error) {
                              console.error('Error updating LQ:', error)
                              toast.error('Failed to update Long Question. Please try again.', 'Error')
                            } finally {
                              setIsSubmitting(false)
                            }
                          }
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2'></span>
                            Updating...
                          </>
                        ) : (
                          'Update'
                        )}
                      </button>
                      
                      <button
                        type='button'
                        className='btn btn-success btn-lg'
                        disabled={isSubmitting || creating || !formik.isValid || isAssigned}
                        onClick={async () => {
                          if (formik.isValid) {
                            setIsSubmitting(true)
                            try {
                              const transformedTags = transformTags(formik.values.selectedTags)
                              const rubricObject = {
                                include: formik.values.rubricShouldHave,
                                exclude: formik.values.rubricShouldNotHave
                              }

                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId,
                                rubricObject
                              )
                              
                              await dispatch(updateQuestion({qId, questionData})).unwrap()
                              toast.success('Long Question updated successfully!', 'Success')
                              navigate('/questions/lq/list')
                            } catch (error) {
                              console.error('Error updating LQ:', error)
                              toast.error('Failed to update Long Question. Please try again.', 'Error')
                            } finally {
                              setIsSubmitting(false)
                            }
                          }
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2'></span>
                            Updating...
                          </>
                        ) : (
                          'Update and go to list'
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type='button'
                        className='btn btn-primary btn-lg'
                        disabled={isSubmitting || creating || !formik.isValid}
                        onClick={async () => {
                          if (formik.isValid) {
                            setIsSubmitting(true)
                            try {
                              const transformedTags = transformTags(formik.values.selectedTags)
                              const rubricObject = {
                                include: formik.values.rubricShouldHave,
                                exclude: formik.values.rubricShouldNotHave
                              }
                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId,
                                rubricObject
                              )
                              const createdQuestion = await dispatch(createQuestion(questionData)).unwrap()
                              toast.success('Long Question created successfully!', 'Success')
                              navigate(`/questions/lq/edit/${createdQuestion.q_id}`)
                            } catch (error) {
                              console.error('Error creating LQ:', error)
                              toast.error('Failed to create Long Question. Please try again.', 'Error')
                            } finally {
                              setIsSubmitting(false)
                            }
                          }
                        }}
                      >
                        {(isSubmitting || creating) ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2'></span>
                            Creating...
                          </>
                        ) : (
                          'Create'
                        )}
                      </button>
                      <button
                        type='button'
                        className='btn btn-success btn-lg'
                        disabled={isSubmitting || creating || !formik.isValid}
                        onClick={async () => {
                          if (formik.isValid) {
                            setIsSubmitting(true)
                            try {
                              const transformedTags = transformTags(formik.values.selectedTags)
                              const rubricObject = {
                                include: formik.values.rubricShouldHave,
                                exclude: formik.values.rubricShouldNotHave
                              }
                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId,
                                rubricObject
                              )
                              await dispatch(createQuestion(questionData)).unwrap()
                              toast.success('Long Question created successfully!', 'Success')
                              navigate('/questions/lq/list')
                            } catch (error) {
                              console.error('Error creating LQ:', error)
                              toast.error('Failed to create Long Question. Please try again.', 'Error')
                            } finally {
                              setIsSubmitting(false)
                            }
                          }
                        }}
                      >
                        {(isSubmitting || creating) ? (
                          <>
                            <span className='spinner-border spinner-border-sm me-2'></span>
                            Creating...
                          </>
                        ) : (
                          'Create and go to list'
                        )}
                      </button>
                    </>
                  )}
                  
                  <button
                    type='button'
                    className='btn btn-light btn-lg'
                    onClick={() => navigate('/questions/lq/list')}
                    disabled={isSubmitting || creating}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </KTCard>

      {/* AI Processed Content Modal */}
      <AIProcessedContentModal onAccept={handleAcceptProcessedContent} />
      
      {/* AI Generated Questions Modal */}
      <AIGeneratedQuestionsModal
        show={showAIGeneratedQuestionsModal}
        onHide={() => setShowAIGeneratedQuestionsModal(false)}
        onAccept={handleAcceptGeneratedQuestions}
        onAcceptSingle={handleAcceptSingleQuestion}
        onUseInCurrentForm={handleUseInCurrentForm}
        questions={generatedQuestions}
        isLoading={generatingSimilarQuestions || creatingMultipleQuestions || creating}
        questionType="lq"
      />
    </>
  )
}

export default LQFormPage 