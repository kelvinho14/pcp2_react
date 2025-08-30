import {FC, useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../../store'
import {fetchTags, Tag} from '../../../../store/tags/tagsSlice'
import {createQuestion, fetchQuestionById, updateQuestion} from '../../../../store/questions/questionsSlice'
import {processContentToText, setProcessedContent} from '../../../../store/ai/aiSlice'
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

const lqValidationSchema = Yup.object().shape({
  teacherRemark: Yup.string()
    .max(500, 'Maximum 500 characters'),
  question: Yup.string()
    .max(5000, 'Maximum 5000 characters'),
  answer: Yup.string()
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

  const formik = useFormik<LQFormData>({
    initialValues: {
      teacherRemark: '',
      question: '',
      answer: '',
      selectedTags: [],
    },
    validationSchema: lqValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      try {
        const transformedTags = transformTags(values.selectedTags)

        if (isEditMode) {
          const questionData = transformLQQuestionForBackend(
            'lq',
            values.question,
            values.teacherRemark,
            values.answer,
            transformedTags
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
            currentQuestionId
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

      // Delay setting form values to ensure TinyMCE editors are ready
      console.log('🔄 LQ Form: Setting form values with delay to ensure editors are ready')
      setTimeout(() => {
        console.log('📝 LQ Form: Setting question content:', currentQuestion.question_content)
        console.log('📝 LQ Form: Setting answer content:', currentQuestion.lq_question?.answer_content)
        formik.setValues({
          question: currentQuestion.question_content || '',
          teacherRemark: currentQuestion.teacher_remark || '',
          answer: currentQuestion.lq_question?.answer_content || '',
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

  // Handle image uploads to update currentQuestionId when question_id is returned
  const handleImageUpload = (fileId: string, url: string, field: 'question' | 'answer', questionId?: string) => {
    // If we received a question ID from the image upload, update our state
    if (questionId) {
      setCurrentQuestionId(questionId)
    }
  }



  // Handle accepting processed content from modal
  const handleAcceptProcessedContent = (content: string, field: 'question' | 'answer') => {
    formik.setFieldValue(field, content)
    formik.setFieldTouched(field, true)
    toast.success('AI processed content applied successfully!', 'Success')
  }

  // Handle accepting generated questions
  const handleAcceptGeneratedQuestions = async (questions: any[], questionId?: string) => {
    try {
      // This would typically create multiple questions
      console.log('Accepting generated questions:', questions, 'with question_id:', questionId)
      toast.success(`${questions.length} questions accepted!`, 'Success')
      setShowAIGeneratedQuestionsModal(false)
    } catch (error) {
      console.error('Error accepting generated questions:', error)
      toast.error('Failed to accept generated questions', 'Error')
    }
  }

  // Handle accepting single generated question
  const handleAcceptSingleQuestion = async (question: any, questionId?: string) => {
    try {
      // This would typically create a single question
      console.log('Accepting single question:', question, 'with question_id:', questionId)
      toast.success('Question accepted!', 'Success')
    } catch (error) {
      console.error('Error accepting single question:', error)
      toast.error('Failed to accept question', 'Error')
    }
  }

  // Handle using generated question in current form
  const handleUseInCurrentForm = (question: any) => {
    try {
      console.log('🔄 Using question in current form:', question)
      
      // Populate the current form with the generated content
      if (question.question_content) {
        console.log('📝 Setting question content:', question.question_content)
        formik.setFieldValue('question', question.question_content)
        formik.setFieldTouched('question', true)
      }
      
      if (question.lq_question?.answer_content) {
        console.log('📝 Setting answer content:', question.lq_question.answer_content)
        formik.setFieldValue('answer', question.lq_question.answer_content)
        formik.setFieldTouched('answer', true)
      }
      
      if (question.teacher_remark) {
        console.log('📝 Setting teacher remark:', question.teacher_remark)
        formik.setFieldValue('teacherRemark', question.teacher_remark)
        formik.setFieldTouched('teacherRemark', true)
      }
      
      // Force a re-render by updating the form values
      console.log('🔄 Current form values after update:', formik.values)
      
      // Close the modal
      setShowAIGeneratedQuestionsModal(false)
      
      toast.success('Generated content applied to current form!', 'Success')
    } catch (error) {
      console.error('Error using question in current form:', error)
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
                <AIEditorWithButton
                  field='question'
                  value={formik.values.question}
                  onBlur={(content) => {
                    formik.setFieldValue('question', content)
                    formik.setFieldTouched('question', true)
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
                <AIEditorWithButton
                  field='answer'
                  value={formik.values.answer}
                  onBlur={(content) => {
                    formik.setFieldValue('answer', content)
                    formik.setFieldTouched('answer', true)
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
                {formik.touched.answer && formik.errors.answer && (
                  <div className='fv-plugins-message-container invalid-feedback d-block'>
                    <div>{formik.errors.answer}</div>
                  </div>
                )}
              </div>
            </div>

{/* Tags */}
<div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-semibold fs-6'>
                Tags with Scores
              </label>
              <div className='col-lg-9'>
                <TagWithScore
                  options={tags}
                  selectedTags={formik.values.selectedTags}
                  onChange={(tags) => formik.setFieldValue('selectedTags', tags)}
                  placeholder='Select tags or type to create new ones (optional)'
                />
                
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
                        disabled={isSubmitting || creating || !formik.isValid}
                        onClick={async () => {
                          if (formik.isValid) {
                            setIsSubmitting(true)
                            try {
                              const transformedTags = transformTags(formik.values.selectedTags)

                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId
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
                        disabled={isSubmitting || creating || !formik.isValid}
                        onClick={async () => {
                          if (formik.isValid) {
                            setIsSubmitting(true)
                            try {
                              const transformedTags = transformTags(formik.values.selectedTags)

                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId
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
                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId
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
                              const questionData = transformLQQuestionForBackend(
                                'lq',
                                formik.values.question,
                                formik.values.teacherRemark,
                                formik.values.answer,
                                transformedTags,
                                currentQuestionId
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