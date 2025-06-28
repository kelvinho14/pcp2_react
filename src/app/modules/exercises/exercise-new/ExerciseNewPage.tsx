import React, {FC, useState, useEffect} from 'react'
import {PageTitle} from '../../../../_metronic/layout/core'
import {useIntl} from 'react-intl'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../../store'
import {
  createExercise,
  fetchTopics,
  fetchExerciseTypes,
  clearMessages,
  Topic,
  ExerciseType,
  ExerciseFormData
} from '../../../../store/exercise/exerciseSlice'
import Select from 'react-select'
import clsx from 'clsx'

const exerciseValidationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Minimum 3 characters')
    .max(100, 'Maximum 100 characters')
    .required('Exercise title is required'),
  description: Yup.string()
    .min(10, 'Minimum 10 characters')
    .max(1000, 'Maximum 1000 characters'),
  topic_ids: Yup.array().of(Yup.string()),
  type: Yup.string().required('Please select an exercise type'),
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

const ExerciseNewPage: FC = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  // Redux selectors
  const { topics, exerciseTypes, loading, creating, error, success } = useSelector(
    (state: RootState) => state.exercise
  )

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

  // Navigate on success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate('/exercises/list')
      }, 1000)
    }
  }, [success, navigate])

  const formik = useFormik<ExerciseFormData>({
    initialValues: {
      title: '',
      description: '',
      topic_ids: [],
      type: '',
    },
    validationSchema: exerciseValidationSchema,
    onSubmit: async (values, {setSubmitting}) => {
      try {
        await dispatch(createExercise(values)).unwrap()
        setSubmitting(false)
      } catch (error) {
        setSubmitting(false)
      }
    },
  })

  const handleAIGenerateDescription = () => {
    // TODO: Implement AI description generation
    console.log('AI description generation will be implemented here')
  }

  if (loading) {
    return (
      <>
        <PageTitle breadcrumbs={[]}>
          {intl.formatMessage({id: 'MENU.EXERCISES.NEW'})}
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
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({id: 'MENU.EXERCISES.NEW'})}
      </PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Create New Exercise</h3>
        </div>
        <div className='card-body'>
          <form onSubmit={formik.handleSubmit} className='form'>
            {/* Exercise Title */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Exercise Title</label>
              <div className='col-lg-8 fv-row'>
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
              <label className='col-lg-4 col-form-label fw-bold fs-6'>Description for Students</label>
              <div className='col-lg-8 fv-row'>
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
              <label className='col-lg-4 col-form-label fw-bold fs-6'>Topics</label>
              <div className='col-lg-8 fv-row'>
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
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Exercise Type</label>
              <div className='col-lg-8 fv-row'>
                <select
                  className={clsx(
                    'form-select form-select-solid form-select-lg',
                    {'is-invalid': formik.touched.type && formik.errors.type},
                    {'is-valid': formik.touched.type && !formik.errors.type && formik.values.type}
                  )}
                  {...formik.getFieldProps('type')}
                >
                  <option value=''>Select an exercise type...</option>
                  {exerciseTypes.map((type) => (
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

            {/* Form Actions */}
            <div className='row mb-6'>
              <div className='col-lg-8 offset-lg-4'>
                <div className='d-flex gap-3'>
                  <button
                    type='submit'
                    className='btn btn-primary btn-lg indicator'
                    data-kt-indicator={creating ? 'on' : 'off'}
                    disabled={
                      creating || 
                      formik.isSubmitting || 
                      !formik.isValid || 
                      !formik.values.title.trim() || 
                      !formik.values.type
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
                  <button
                    type='button'
                    className='btn btn-secondary btn-lg'
                    onClick={() => navigate('/exercises/list')}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                </div>
                
                {/* Toast notifications are handled by Redux slice */}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ExerciseNewPage 