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
import Select from 'react-select'
import TagWithScore, {TagWithScoreData} from '../components/TagWithScore'
import AIEditorWithButton from '../../../../components/AI/AIEditorWithButton'
import AIProcessedContentModal from '../../../../components/AI/AIProcessedContentModal'
import {useAIImageToText} from '../../../../hooks/useAIImageToText'

const mcValidationSchema = Yup.object().shape({
  questionName: Yup.string()
    .min(1, 'Minimum 1 characters')
    .max(200, 'Maximum 200 characters')
    .required('Question name is required'),
  teacherRemark: Yup.string()
    .max(500, 'Maximum 500 characters'),
  question: Yup.string()
    .max(5000, 'Maximum 5000 characters'),
  answer: Yup.string()
    .max(5000, 'Maximum 5000 characters'),
  options: Yup.array().of(
    Yup.object().shape({
      option_letter: Yup.string().required('Option letter is required'),
      is_correct: Yup.boolean()
    })
  ).min(2, 'At least 2 options are required'),
  selectedTags: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      name: Yup.string().required(),
      score: Yup.number().min(0)
    })
  ),
})

interface MCOptionData {
  option_letter: string
  is_correct: boolean
}

interface MCFormData {
  questionName: string
  teacherRemark: string
  question: string
  answer: string
  options: MCOptionData[]
  selectedTags: TagWithScoreData[]
}

const MCFormPage: FC = () => {
  const navigate = useNavigate()
  const { qId } = useParams<{ qId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!qId

  // Custom hook for AI functionality
  const { processingField, handleAIImageToText } = useAIImageToText('mc')

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

  // Handle accepting processed content from modal
  const handleAcceptProcessedContent = (content: string, field: 'question' | 'answer') => {
    formik.setFieldValue(field, content)
    formik.setFieldTouched(field, true)
    toast.success('AI processed content applied successfully!', 'Success')
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
          title: 'Multiple Choice Question List',
          path: '/questions/mc/list',
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
          title: 'Multiple Choice Question List',
          path: '/questions/mc/list',
          isSeparator: false,
          isActive: false,
        }
      ]

  const formik = useFormik<MCFormData>({
    initialValues: {
      questionName: '',
      teacherRemark: '',
      question: '',
      answer: '',
      options: [
        { option_letter: 'A', is_correct: false },
        { option_letter: 'B', is_correct: false },
        { option_letter: 'C', is_correct: false },
        { option_letter: 'D', is_correct: false },
      ],
      selectedTags: [],
    },
    validationSchema: mcValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      try {
        const transformedTags = transformTags(values.selectedTags)
        const correctOption = values.options.find(opt => opt.is_correct)

        const questionData = {
          type: 'mc' as const,
          name: values.questionName,
          question_content: values.question,
          teacher_remark: values.teacherRemark,
          mc_question: {
            options: values.options,
            correct_option: values.options.find(opt => opt.is_correct)?.option_letter || '',
            answer_content: values.answer
          },
          tags: transformedTags
        }
        
        if (isEditMode) {
          await dispatch(updateQuestion({qId, questionData})).unwrap()
          toast.success('Multiple Choice Question updated successfully!', 'Success')
        } else {
          const createdQuestion = await dispatch(createQuestion(questionData)).unwrap()
          toast.success('Multiple Choice Question created successfully!', 'Success')
          navigate('/questions/mc/list')
        }
      } catch (error) {
        console.error('Error saving MC:', error)
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} Multiple Choice Question. Please try again.`, 'Error')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Update form values when question data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && currentQuestion) {
      // Transform the tags from API format to our component format
      const transformedTags: TagWithScoreData[] = (currentQuestion.tags || []).map(tag => ({
        id: tag.tag_id || '',
        name: tag.name || '',
        score: tag.score !== undefined ? tag.score : 0
      })) as TagWithScoreData[]

      // Transform options from API format to form format
      const apiOptions = currentQuestion.mc_question?.options || []
      const correctOptionLetter = currentQuestion.mc_question?.correct_option || ''
      
      // Handle both string array and object array formats from API
      const transformedOptions = (Array.isArray(apiOptions) ? apiOptions : []).map((option: any, index: number) => {
        if (typeof option === 'string') {
          // API returns options as strings
          return {
            option_letter: option,
            is_correct: option === correctOptionLetter
          }
        } else {
          // API returns options as objects (fallback)
          return {
            option_letter: option.option_letter || option,
            is_correct: (option.option_letter || option) === correctOptionLetter
          }
        }
      })

      formik.setValues({
        questionName: currentQuestion.name || '',
        teacherRemark: currentQuestion.teacher_remark || '',
        question: currentQuestion.question_content || '',
        answer: currentQuestion.mc_question?.answer_content || '',
        options: transformedOptions,
        selectedTags: transformedTags,
      }, false) // Set validateOnChange to false to prevent validation during load
    }
  }, [currentQuestion, isEditMode])

  // Handle option changes
  const handleOptionChange = (index: number, field: keyof MCOptionData, value: any) => {
    const newOptions = [...formik.values.options]
    
    if (field === 'is_correct') {
      // If setting this option as correct, uncheck all others
      newOptions.forEach((option, i) => {
        option.is_correct = i === index ? value : false
      })
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value }
    }
    
    formik.setFieldValue('options', newOptions)
  }

  // Add new option
  const addOption = () => {
    const newOptions = [...formik.values.options]
    const nextLetter = String.fromCharCode(65 + newOptions.length) // A, B, C, D, E, F, etc.
    newOptions.push({ option_letter: nextLetter, is_correct: false })
    formik.setFieldValue('options', newOptions)
  }

  // Remove option
  const removeOption = (index: number) => {
    if (formik.values.options.length > 2) {
      const newOptions = formik.values.options.filter((_, i) => i !== index)
      // Reassign letters
      newOptions.forEach((option, i) => {
        option.option_letter = String.fromCharCode(65 + i)
      })
      formik.setFieldValue('options', newOptions)
    }
  }

  if (tagsLoading || (isEditMode && questionLoading)) {
    return (
      <>
        <PageTitle breadcrumbs={breadcrumbs}>
          {isEditMode ? 'Edit Multiple Choice Question' : 'Create Multiple Choice Question'}
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
        {isEditMode ? 'Edit Multiple Choice Question' : 'Create Multiple Choice Question'}
      </PageTitle>
      
      <KTCard>
        <div className='card-header'>
          <h3 className='card-title'>
            {isEditMode ? 'Edit Multiple Choice Question' : 'Create New Multiple Choice Question'}
          </h3>
        </div>
        
        <div className='card-body'>
          <form onSubmit={formik.handleSubmit} className='form'>
            {/* Question Name */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label required fw-semibold fs-6'>
                Question Name
              </label>
              <div className='col-lg-9'>
                <input
                  type='text'
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {
                      'is-valid': formik.touched.questionName && !formik.errors.questionName,
                      'is-invalid': formik.touched.questionName && formik.errors.questionName,
                    }
                  )}
                  placeholder='Enter question name'
                  {...formik.getFieldProps('questionName')}
                />
                {formik.touched.questionName && formik.errors.questionName && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.questionName}</div>
                  </div>
                )}
              </div>
            </div>

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
                  height={300}
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
                  height={300}
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

            {/* Multiple Choice Options */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-semibold fs-6'>
                Options
              </label>
              <div className='col-lg-9'>
                <div className='d-flex flex-column gap-4'>
                  {formik.values.options.map((option, index) => (
                    <div key={index} className='border rounded p-4'>
                      <div className='row g-3'>
                        <div className='col-md-2'>
                          <label className='form-label fw-bold fs-5'>{option.option_letter}</label>
                        </div>
                        <div className='col-md-10'>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='radio'
                              name='correctOption'
                              id={`correct-${index}`}
                              checked={option.is_correct}
                              onChange={() => handleOptionChange(index, 'is_correct', true)}
                            />
                            <label className='form-check-label' htmlFor={`correct-${index}`}>
                              Correct Answer
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {formik.touched.options && formik.errors.options && (
                  <div className='fv-plugins-message-container invalid-feedback d-block mt-2'>
                    <div>{Array.isArray(formik.errors.options) ? formik.errors.options.join(', ') : formik.errors.options}</div>
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
              <div className='col-lg-8 offset-lg-4'>
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
                              const correctOption = formik.values.options.find(opt => opt.is_correct)

                              const questionData = {
                                type: 'mc' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                mc_question: {
                                  options: formik.values.options,
                                  correct_option: formik.values.options.find(opt => opt.is_correct)?.option_letter || '',
                                  answer_content: formik.values.answer
                                },
                                tags: transformedTags
                              }
                              
                              await dispatch(updateQuestion({qId, questionData})).unwrap()
                              toast.success('Multiple Choice Question updated successfully!', 'Success')
                              // Stay on this page - no navigation
                            } catch (error) {
                              console.error('Error updating MC:', error)
                              toast.error('Failed to update Multiple Choice Question. Please try again.', 'Error')
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
                              const correctOption = formik.values.options.find(opt => opt.is_correct)

                              const questionData = {
                                type: 'mc' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                mc_question: {
                                  options: formik.values.options,
                                  correct_option: formik.values.options.find(opt => opt.is_correct)?.option_letter || '',
                                  answer_content: formik.values.answer
                                },
                                tags: transformedTags
                              }
                              
                              await dispatch(updateQuestion({qId, questionData})).unwrap()
                              toast.success('Multiple Choice Question updated successfully!', 'Success')
                              navigate('/questions/mc/list')
                            } catch (error) {
                              console.error('Error updating MC:', error)
                              toast.error('Failed to update Multiple Choice Question. Please try again.', 'Error')
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
                              const correctOption = formik.values.options.find(opt => opt.is_correct)
                              const questionData = {
                                type: 'mc' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                mc_question: {
                                  options: formik.values.options,
                                  correct_option: formik.values.options.find(opt => opt.is_correct)?.option_letter || '',
                                  answer_content: formik.values.answer
                                },
                                tags: transformedTags
                              }
                              const createdQuestion = await dispatch(createQuestion(questionData)).unwrap()
                              toast.success('Multiple Choice Question created successfully!', 'Success')
                              navigate(`/questions/mc/edit/${createdQuestion.q_id}`)
                            } catch (error) {
                              console.error('Error creating MC:', error)
                              toast.error('Failed to create Multiple Choice Question. Please try again.', 'Error')
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
                              const correctOption = formik.values.options.find(opt => opt.is_correct)
                              const questionData = {
                                type: 'mc' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                mc_question: {
                                  options: formik.values.options,
                                  correct_option: formik.values.options.find(opt => opt.is_correct)?.option_letter || '',
                                  answer_content: formik.values.answer
                                },
                                tags: transformedTags
                              }
                              await dispatch(createQuestion(questionData)).unwrap()
                              toast.success('Multiple Choice Question created successfully!', 'Success')
                              navigate('/questions/mc/list')
                            } catch (error) {
                              console.error('Error creating MC:', error)
                              toast.error('Failed to create Multiple Choice Question. Please try again.', 'Error')
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
                    className='btn btn-secondary btn-lg'
                    onClick={() => navigate('/questions/mc/list')}
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
    </>
  )
}

export default MCFormPage 