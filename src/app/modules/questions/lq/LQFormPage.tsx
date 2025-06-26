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
import Select from 'react-select'

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
  tagIds: Yup.array().of(Yup.string()),
})

interface LQFormData {
  questionName: string
  teacherRemark: string
  question: string
  answer: string
  tagIds: string[]
}

// MultiSelect Component using react-select
interface MultiSelectProps {
  options: Tag[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
  className?: string
}

const MultiSelect: FC<MultiSelectProps> = ({ options, selectedValues, onChange, placeholder, className }) => {
  // Convert options to react-select format
  const selectOptions = options.map(option => ({
    value: option.id,
    label: option.name
  }))

  // Convert selected values to react-select format
  const selectedOptions = selectOptions.filter(option => 
    selectedValues.includes(option.value)
  )

  const handleChange = (selected: any) => {
    const values = selected ? selected.map((item: any) => item.value) : []
    onChange(values)
  }

  return (
    <Select
      isMulti
      options={selectOptions}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      classNamePrefix="select"
      isSearchable={true}
      closeMenuOnSelect={false}
    />
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
      tagIds: [],
    },
    validationSchema: lqValidationSchema,
    onSubmit: async (values) => {
      console.log('🚀 Form submitted with values:', values)
      setIsSubmitting(true)
      try {
        const questionData = {
          type: 'lq' as const,
          name: values.questionName,
          question_content: values.question,
          teacher_remark: values.teacherRemark,
          lq_question: {
            answer_content: values.answer
          },
          tag_ids: values.tagIds.length > 0 ? values.tagIds : undefined
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
      formik.setValues({
        questionName: currentQuestion.name || '',
        teacherRemark: currentQuestion.teacher_remark || '',
        question: currentQuestion.question_content || '',
        answer: currentQuestion.lq_question?.answer_content || '',
        tagIds: currentQuestion.tag_ids || [],
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
                Tags
              </label>
              <div className='col-lg-8'>
                <MultiSelect
                  options={tags}
                  selectedValues={formik.values.tagIds}
                  onChange={(values) => formik.setFieldValue('tagIds', values)}
                  placeholder='Select tags (optional)'
                />
                <div className='form-text'>Select one or more tags (optional)</div>
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
                              const questionData = {
                                type: 'lq' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                lq_question: {
                                  answer_content: formik.values.answer
                                },
                                tag_ids: formik.values.tagIds.length > 0 ? formik.values.tagIds : undefined
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
                              const questionData = {
                                type: 'lq' as const,
                                name: formik.values.questionName,
                                question_content: formik.values.question,
                                teacher_remark: formik.values.teacherRemark,
                                lq_question: {
                                  answer_content: formik.values.answer
                                },
                                tag_ids: formik.values.tagIds.length > 0 ? formik.values.tagIds : undefined
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
                            const questionData = {
                              type: 'lq' as const,
                              name: formik.values.questionName,
                              question_content: formik.values.question,
                              teacher_remark: formik.values.teacherRemark,
                              lq_question: {
                                answer_content: formik.values.answer
                              },
                              tag_ids: formik.values.tagIds.length > 0 ? formik.values.tagIds : undefined
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