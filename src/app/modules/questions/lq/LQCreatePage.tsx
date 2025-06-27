import {FC, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../../store'
import {fetchTags, Tag} from '../../../../store/tags/tagsSlice'
import {createQuestion} from '../../../../store/questions/questionsSlice'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import toast from '../../../../_metronic/helpers/toast'
import TinyMCEEditor from '../../../../components/Editor/TinyMCEEditor'
import Select from 'react-select'

const lqCreateBreadcrumbs: Array<PageLink> = [
  {
    title: 'Questions',
    path: '/questions',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'LQ',
    path: '/questions/lq/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Create',
    path: '/questions/lq/create',
    isSeparator: false,
    isActive: true,
  },
]

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

const LQCreatePage: FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redux selectors
  const { tags, loading } = useSelector((state: RootState) => state.tags)
  const { creating } = useSelector((state: RootState) => state.questions)

  // Fetch tags on component mount
  useEffect(() => {
    dispatch(fetchTags())
  }, [dispatch])

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
      setIsSubmitting(true)
      try {
        const questionData = {
          type: 'lq' as const,
          question_content: values.questionName,
          lq_question: {
            answer_content: values.answer
          },
          tag_ids: values.tagIds.length > 0 ? values.tagIds : undefined
        }
        
        await dispatch(createQuestion(questionData)).unwrap()
        toast.success('Long Question created successfully!', 'Success')
        navigate('/questions/lq/list')
      } catch (error) {
        console.error('Error creating LQ:', error)
        toast.error('Failed to create Long Question. Please try again.', 'Error')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  if (loading) {
    return (
      <>
        <PageTitle breadcrumbs={lqCreateBreadcrumbs}>Create Long Question</PageTitle>
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
      <PageTitle breadcrumbs={lqCreateBreadcrumbs}>Create Long Question</PageTitle>
      
      <KTCard>
        <div className='card-header'>
          <h3 className='card-title'>Create New Long Question</h3>
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
                <TinyMCEEditor
                  key="question-editor"
                  value={formik.values.question}
                  onChange={(content) => {
                    formik.setFieldValue('question', content)
                    formik.setFieldTouched('question', true)
                  }}
                  height={300}
                  placeholder='Enter the question content...'
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
              <label className='col-lg-4 col-form-label fw-semibold fs-6'>
                Answer
              </label>
              <div className='col-lg-8'>
                <TinyMCEEditor
                  key="answer-editor"
                  value={formik.values.answer}
                  onChange={(content) => {
                    formik.setFieldValue('answer', content)
                    formik.setFieldTouched('answer', true)
                  }}
                  height={300}
                  placeholder='Enter the answer content...'
                />
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
                  <button
                    type='submit'
                    className='btn btn-primary btn-lg'
                    disabled={isSubmitting || creating || !formik.isValid}
                  >
                    {isSubmitting || creating ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Creating...
                      </>
                    ) : (
                      'Create Long Question'
                    )}
                  </button>
                  
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

export default LQCreatePage 