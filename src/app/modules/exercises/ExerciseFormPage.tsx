import React, {FC, useState, useEffect} from 'react'
import {PageTitle, PageLink} from '../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useNavigate, useParams} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../store'
import {
  fetchTopics,
  fetchExerciseTypes,
  clearMessages,
  createExercise,
  Topic,
  ExerciseType,
  ExerciseFormData
} from '../../../store/exercise/exerciseSlice'
import {
  fetchExercises,
  updateExercise,
  Exercise
} from '../../../store/exercises/exercisesSlice'
import Select from 'react-select'
import clsx from 'clsx'
import {toast} from '../../../_metronic/helpers/toast'

const exerciseValidationSchema = Yup.object().shape({
  title: Yup.string()
    .max(255, 'Maximum 255 characters')
    .required('Exercise title is required'),
  description: Yup.string()
    .max(1000, 'Maximum 1000 characters'),
  topic_ids: Yup.array().of(Yup.string()),
  type: Yup.string().required('Please select an exercise type'),
  status: Yup.number().required('Please select a status'),
})

// MultiSelect Component using react-select
interface MultiSelectProps {
  options: Topic[]
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
    console.log('React-select change:', selected)
    const values = selected ? selected.map((item: any) => item.value) : []
    console.log('New values:', values)
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

const ExerciseFormPage: FC = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!exerciseId
  
  // Redux selectors
  const { topics, exerciseTypes, loading, creating } = useSelector(
    (state: RootState) => state.exercise
  )
  const { exercises, loading: exercisesLoading, updating } = useSelector(
    (state: RootState) => state.exercises
  )

  // Get current exercise data if in edit mode
  const currentExercise = isEditMode ? exercises.find((ex: Exercise) => ex.exercise_id === exerciseId) : null

  // Fetch exercise types and topics on component mount
  useEffect(() => {
    dispatch(fetchExerciseTypes())
    dispatch(fetchTopics())
  }, [dispatch])

  // Clear messages on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearMessages())
    }
  }, [dispatch])

  // Update breadcrumbs based on mode
  const breadcrumbs: PageLink[] = isEditMode 
    ? [
        {
          title: 'Home',
          path: '/dashboard',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Exercises',
          path: '/exercises',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Exercise List',
          path: '/exercises/list',
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
          title: 'Exercises',
          path: '/exercises',
          isSeparator: false,
          isActive: false,
        },
        {
          title: 'Exercise List',
          path: '/exercises/list',
          isSeparator: false,
          isActive: false,
        }
      ]

  const formik = useFormik<ExerciseFormData>({
    initialValues: {
      title: '',
      description: '',
      topic_ids: [],
      type: '',
      status: 0, // Default to Inactive
    },
    validationSchema: exerciseValidationSchema,
    enableReinitialize: true, // This allows the form to update when currentExercise changes
    onSubmit: async (values, {setSubmitting}) => {
      setIsSubmitting(true)
      try {
        if (isEditMode && exerciseId) {
          await dispatch(updateExercise({ exerciseId, data: values })).unwrap()
          // Don't navigate - stay on the edit page
        } else {
          await dispatch(createExercise(values)).unwrap()
          navigate('/exercises/list')
        }
      } catch (error) {
        console.error('Error saving exercise:', error)
        // Error handling is done in the thunk
      } finally {
        setIsSubmitting(false)
        setSubmitting(false)
      }
    },
  })

  // Handle update and go to list
  const handleUpdateAndGoToList = async () => {
    if (!formik.isValid || !formik.values.title.trim() || !formik.values.type || formik.values.status === undefined) {
      return
    }
    
    setIsSubmitting(true)
    try {
      if (isEditMode && exerciseId) {
        await dispatch(updateExercise({ exerciseId, data: formik.values })).unwrap()
        navigate('/exercises/list')
      }
    } catch (error) {
      console.error('Error saving exercise:', error)
      // Error handling is done in the thunk
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update form values when exercise data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && currentExercise) {
      formik.setValues({
        title: currentExercise.title || '',
        description: currentExercise.description || '',
        topic_ids: [], // TODO: Add topic_ids to Exercise type when API supports it
        type: currentExercise.type_id || '',
        status: currentExercise.status || 0,
      })
    }
  }, [currentExercise, isEditMode])

  const handleAIGenerateDescription = () => {
    // TODO: Implement AI description generation
    console.log('AI description generation will be implemented here')
  }

  const getQuestionTypeBadge = (type: string) => {
    return type === 'mc' ? 
      <span className='badge badge-light-primary'>MC</span> : 
      <span className='badge badge-light-info'>LQ</span>
  }

  if (loading || (isEditMode && exercisesLoading)) {
    return (
      <>
        <PageTitle breadcrumbs={breadcrumbs}>
          {isEditMode ? 'Edit Exercise' : 'Create New Exercise'}
        </PageTitle>
        
        <div className='card'>
          <div className='card-body'>
            <div className='d-flex justify-content-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>
        {isEditMode ? 'Edit Exercise' : 'Create New Exercise'}
      </PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>{isEditMode ? 'Edit Exercise' : 'Create New Exercise'}</h3>
        </div>
        <div className='card-body'>
          <form onSubmit={formik.handleSubmit} className='form'>
            {/* Exercise Title */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label required fw-bold fs-6'>Exercise Title</label>
              <div className='col-lg-9 fv-row'>
                <input
                  type='text'
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {'is-invalid': formik.touched.title && formik.errors.title},
                    {'is-valid': formik.touched.title && !formik.errors.title}
                  )}
                  placeholder='Enter exercise title'
                  {...formik.getFieldProps('title')}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.title}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Description for Students */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-bold fs-6'>Description for Students</label>
              <div className='col-lg-9 fv-row'>
                <div className='position-relative'>
                  <textarea
                    className={clsx(
                      'form-control form-control-lg form-control-solid',
                      {'is-invalid': formik.touched.description && formik.errors.description},
                      {'is-valid': formik.touched.description && !formik.errors.description}
                    )}
                    placeholder='Enter description for students'
                    rows={4}
                    {...formik.getFieldProps('description')}
                  />
                  <button
                    type='button'
                    className='btn btn-sm btn-light-primary position-absolute top-0 end-0 mt-2 me-2'
                    onClick={handleAIGenerateDescription}
                    title='Generate description using AI'
                  >
                    <i className='fas fa-magic me-1'></i>
                    AI Generate
                  </button>
                </div>
                {formik.touched.description && formik.errors.description && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.description}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Topic List */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label fw-bold fs-6'>Topics</label>
              <div className='col-lg-9 fv-row'>
                <MultiSelect
                  options={topics}
                  selectedValues={formik.values.topic_ids}
                  onChange={(values) => formik.setFieldValue('topic_ids', values)}
                  placeholder='Select topics (optional)'
                />
                <div className='form-text'>Select one or more topics (optional)</div>
              </div>
            </div>

            {/* Exercise Type */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label required fw-bold fs-6'>Exercise Type</label>
              <div className='col-lg-9 fv-row'>
                <select
                  className={clsx(
                    'form-select form-select-solid form-select-lg',
                    {'is-invalid': formik.touched.type && formik.errors.type},
                    {'is-valid': formik.touched.type && !formik.errors.type && formik.values.type}
                  )}
                  {...formik.getFieldProps('type')}
                >
                  <option value=''>Select an exercise type...</option>
                  {exerciseTypes.map((type: ExerciseType) => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {formik.touched.type && formik.errors.type && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.type}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className='row mb-6'>
              <label className='col-lg-3 col-form-label required fw-bold fs-6'>Status</label>
              <div className='col-lg-9 fv-row'>
                <select
                  className={clsx(
                    'form-select form-select-solid form-select-lg',
                    {'is-invalid': formik.touched.status && formik.errors.status},
                    {'is-valid': formik.touched.status && !formik.errors.status}
                  )}
                  {...formik.getFieldProps('status')}
                >
                  <option value={0}>Inactive</option>
                  <option value={1}>Active</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.status}</div>
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
                        type='submit'
                        className='btn btn-primary btn-lg indicator'
                        data-kt-indicator={isSubmitting || creating || updating ? 'on' : 'off'}
                        disabled={
                          isSubmitting || 
                          creating ||
                          updating ||
                          formik.isSubmitting || 
                          !formik.isValid || 
                          !formik.values.title.trim() || 
                          !formik.values.type ||
                          formik.values.status === undefined
                        }
                      >
                        <span className='indicator-label'>
                          Update
                        </span>
                        <span className='indicator-progress'>
                          Please wait... 
                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      </button>
                      <button
                        type='button'
                        className='btn btn-success btn-lg indicator'
                        data-kt-indicator={isSubmitting || creating || updating ? 'on' : 'off'}
                        onClick={handleUpdateAndGoToList}
                        disabled={
                          isSubmitting || 
                          creating ||
                          updating ||
                          formik.isSubmitting || 
                          !formik.isValid || 
                          !formik.values.title.trim() || 
                          !formik.values.type ||
                          formik.values.status === undefined
                        }
                      >
                        <span className='indicator-label'>
                          Update and go to list
                        </span>
                        <span className='indicator-progress'>
                          Please wait... 
                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type='submit'
                      className='btn btn-primary btn-lg indicator'
                      data-kt-indicator={isSubmitting || creating || updating ? 'on' : 'off'}
                      disabled={
                        isSubmitting || 
                        creating ||
                        updating ||
                        formik.isSubmitting || 
                        !formik.isValid || 
                        !formik.values.title.trim() || 
                        !formik.values.type ||
                        formik.values.status === undefined
                      }
                    >
                      <span className='indicator-label'>
                        Create Exercise
                      </span>
                      <span className='indicator-progress'>
                        Please wait... 
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    </button>
                  )}
                  <button
                    type='button'
                    className='btn btn-secondary btn-lg'
                    onClick={() => navigate('/exercises/list')}
                    disabled={isSubmitting || creating || updating}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ExerciseFormPage 