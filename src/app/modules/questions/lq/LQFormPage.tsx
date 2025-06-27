import {FC, useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../../store'
import {fetchTags, Tag} from '../../../../store/tags/tagsSlice'
import {createQuestion, fetchQuestionById, updateQuestion} from '../../../../store/questions/questionsSlice'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import {toast} from '../../../../_metronic/helpers/toast'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'
import CreatableSelect from 'react-select/creatable'

const lqValidationSchema = Yup.object().shape({
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
  selectedTags: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      name: Yup.string().required(),
      score: Yup.number().min(0)
    })
  ),
})

interface LQFormData {
  questionName: string
  teacherRemark: string
  question: string
  answer: string
  selectedTags: TagWithScoreData[]
}

// Tag with Score Component
interface TagWithScoreData {
  id: string
  name: string
  score: number
  isNew?: boolean
}

interface TagWithScoreProps {
  options: Tag[]
  selectedTags: TagWithScoreData[]
  onChange: (tags: TagWithScoreData[]) => void
  placeholder: string
  className?: string
}

const TagWithScore: FC<TagWithScoreProps> = ({ options, selectedTags, onChange, placeholder, className }) => {
  const [newTagName, setNewTagName] = useState('')
  const [newTagScore, setNewTagScore] = useState(0)
  const [showNewTagForm, setShowNewTagForm] = useState(false)

  const handleAddExistingTag = (tagId: string) => {
    const existingTag = options.find(tag => tag.id === tagId)
    if (existingTag && !selectedTags.find(t => t.id === tagId)) {
      const newTag: TagWithScoreData = {
        id: existingTag.id,
        name: existingTag.name,
        score: 0
      }
      onChange([...selectedTags, newTag])
    }
  }

  const handleAddNewTag = () => {
    if (newTagName.trim() && newTagScore >= 0) {
      const newTag: TagWithScoreData = {
        id: `temp-${Date.now()}`,
        name: newTagName.trim(),
        score: newTagScore,
        isNew: true
      }
      onChange([...selectedTags, newTag])
      setNewTagName('')
      setNewTagScore(0)
      setShowNewTagForm(false)
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  const handleUpdateScore = (tagId: string, newScore: number) => {
    onChange(selectedTags.map(tag => 
      tag.id === tagId ? { ...tag, score: newScore } : tag
    ))
  }

  const availableOptions = options.filter(option => 
    !selectedTags.find(tag => tag.id === option.id)
  )

  return (
    <div className={className}>
      {/* Add Existing Tag */}
      {availableOptions.length > 0 && (
        <div className='mb-3'>
          <select
            className='form-select'
            onChange={(e) => {
              if (e.target.value) {
                handleAddExistingTag(e.target.value)
                e.target.value = ''
              }
            }}
          >
            <option value=''>Select an existing tag...</option>
            {availableOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add New Tag */}
      <div className='mb-3'>
        {!showNewTagForm ? (
          <button
            type='button'
            className='btn btn-outline-primary btn-sm'
            onClick={() => setShowNewTagForm(true)}
          >
            <i className='fas fa-plus me-1'></i>
            New Tag
          </button>
        ) : (
          <div className='border rounded p-3'>
            <div className='row g-2'>
              <div className='col-md-6'>
                <label className='form-label'>Tag Name:</label>
                <input
                  type='text'
                  className='form-control'
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder='Enter tag name'
                />
              </div>
              <div className='col-md-3'>
                <label className='form-label'>Score:</label>
                <input
                  type='number'
                  min='0'
                  className='form-control'
                  value={newTagScore}
                  onChange={(e) => setNewTagScore(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className='col-md-3 d-flex align-items-end'>
                <div className='d-flex gap-1'>
                  <button
                    type='button'
                    className='btn btn-primary btn-sm'
                    onClick={handleAddNewTag}
                    disabled={!newTagName.trim()}
                  >
                    Add
                  </button>
                  <button
                    type='button'
                    className='btn btn-secondary btn-sm'
                    onClick={() => {
                      setShowNewTagForm(false)
                      setNewTagName('')
                      setNewTagScore(0)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className='mb-3'>
          <label className='form-label'>Selected Tags:</label>
          <div>
            {selectedTags.map(tag => (
              <div key={tag.id} className='d-flex align-items-center gap-2 mb-2 p-2 border rounded'>
                <span className='badge badge-primary'>{tag.name}</span>
                <div className='d-flex align-items-center gap-1'>
                  <label className='form-label mb-0 me-1'>Score:</label>
                  <input
                    type='number'
                    min='0'
                    value={tag.score}
                    onChange={(e) => handleUpdateScore(tag.id, parseInt(e.target.value) || 0)}
                    className='form-control form-control-sm'
                    style={{ width: '60px' }}
                  />
                </div>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-danger'
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const LQFormPage: FC = () => {
  const navigate = useNavigate()
  const { qId } = useParams<{ qId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!qId

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
      questionName: '',
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

        const questionData = {
          type: 'lq' as const,
          name: values.questionName,
          question_content: values.question,
          teacher_remark: values.teacherRemark,
          lq_question: {
            answer_content: values.answer
          },
          tags: transformedTags.length > 0 ? transformedTags : undefined
        }
        
        if (isEditMode) {
          await dispatch(updateQuestion({qId, questionData})).unwrap()
          toast.success('Long Question updated successfully!', 'Success')
        } else {
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
      // Transform the tags from API format to our component format
      const transformedTags: TagWithScoreData[] = (currentQuestion.tags || []).map(tag => ({
        id: tag.tag_id || '',
        name: tag.name || '',
        score: tag.score !== undefined ? tag.score : 0
      })) as TagWithScoreData[]

      formik.setValues({
        questionName: currentQuestion.name || '',
        teacherRemark: currentQuestion.teacher_remark || '',
        question: currentQuestion.question_content || '',
        answer: currentQuestion.lq_question?.answer_content || '',
        selectedTags: transformedTags,
      }, false) // Set validateOnChange to false to prevent validation during load
    }
  }, [currentQuestion, isEditMode])

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
            {/* Question Name */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Question Name
              </label>
              <div className='col-lg-8'>
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

            {/* Tags */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label fw-semibold fs-6'>
                Tags with Scores
              </label>
              <div className='col-lg-8'>
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
              <label className='col-lg-4 col-form-label fw-semibold fs-6'>
                Teacher Remark
              </label>
              <div className='col-lg-8'>
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

            {/* Question Content */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label fw-semibold fs-6'>
                Question
              </label>
              <div className='col-lg-8'>
                <div className='d-flex flex-column'>
                  <TinyMCEEditor
                    key={`question-editor-${isEditMode ? qId : 'create'}`}
                    value={formik.values.question}
                    onBlur={(content) => {
                      formik.setFieldValue('question', content)
                      formik.setFieldTouched('question', true)
                    }}
                    height={300}
                    placeholder='Enter the question content...'
                  />
                  {formik.values.question.includes('<img') && (
                    <div className='mt-2'>
                      <button
                        type='button'
                        className='btn btn-sm btn-outline-primary'
                        onClick={() => {
                          // TODO: Implement AI image to text functionality
                          console.log('AI image to text for question')
                        }}
                      >
                        <i className='fas fa-robot me-1'></i>
                        AI Image to Text
                      </button>
                    </div>
                  )}
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
              <label className='col-lg-4 col-form-label fw-semibold fs-6'>
                Answer
              </label>
              <div className='col-lg-8'>
                <div className='d-flex flex-column'>
                  <TinyMCEEditor
                    key={`answer-editor-${isEditMode ? qId : 'create'}`}
                    value={formik.values.answer}
                    onBlur={(content) => {
                      formik.setFieldValue('answer', content)
                      formik.setFieldTouched('answer', true)
                    }}
                    height={300}
                    placeholder='Enter the answer content...'
                  />
                  {formik.values.answer.includes('<img') && (
                    <div className='mt-2'>
                      <button
                        type='button'
                        className='btn btn-sm btn-outline-primary'
                        onClick={() => {
                          // TODO: Implement AI image to text functionality
                          console.log('AI image to text for answer')
                        }}
                      >
                        <i className='fas fa-robot me-1'></i>
                        AI Image to Text
                      </button>
                    </div>
                  )}
                </div>
                {formik.touched.answer && formik.errors.answer && (
                  <div className='fv-plugins-message-container invalid-feedback d-block'>
                    <div>{formik.errors.answer}</div>
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

                              const questionData = {
                                type: 'lq' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                lq_question: {
                                  answer_content: formik.values.answer
                                },
                                tags: transformedTags.length > 0 ? transformedTags : undefined
                              }
                              
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

                              const questionData = {
                                type: 'lq' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                lq_question: {
                                  answer_content: formik.values.answer
                                },
                                tags: transformedTags.length > 0 ? transformedTags : undefined
                              }
                              
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
                    <button
                      type='button'
                      className='btn btn-primary btn-lg'
                      disabled={isSubmitting || creating || !formik.isValid}
                      onClick={async () => {
                        if (formik.isValid) {
                          setIsSubmitting(true)
                          try {
                            const transformedTags = transformTags(formik.values.selectedTags)

                            const questionData = {
                              type: 'lq' as const,
                              name: formik.values.questionName,
                              question_content: formik.values.question,
                              teacher_remark: formik.values.teacherRemark,
                              lq_question: {
                                answer_content: formik.values.answer
                              },
                              tags: transformedTags.length > 0 ? transformedTags : undefined
                            }
                            
                            await dispatch(createQuestion(questionData)).unwrap()
                            toast.success('Long Question created successfully!', 'Success')
                            // Stay on this page - no navigation
                          } catch (error) {
                            console.error('Error creating LQ:', error)
                            toast.error('Failed to create Long Question. Please try again.', 'Error')
                          } finally {
                            setIsSubmitting(false)
                          }
                        }
                      }}
                    >
                      {isSubmitting || creating ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2'></span>
                          Creating...
                        </>
                      ) : (
                        'Create'
                      )}
                    </button>
                  )}
                  
                  {!isEditMode && (
                    <button
                      type='submit'
                      className='btn btn-success btn-lg'
                      disabled={isSubmitting || creating || !formik.isValid}
                    >
                      {isSubmitting || creating ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2'></span>
                          Creating...
                        </>
                      ) : (
                        'Create and go to list'
                      )}
                    </button>
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
    </>
  )
}

export default LQFormPage 