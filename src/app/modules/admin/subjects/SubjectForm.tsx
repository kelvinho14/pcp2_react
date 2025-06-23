import {useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useSelector, useDispatch} from 'react-redux'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {RootState, AppDispatch} from '../../../../store'
import {createSubject, updateSubject, fetchSubject, clearMessages, clearSuccess, clearCurrentSubject} from '../../../../store/subjects/subjectsSlice'

const subjectSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Minimum 2 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Subject name is required'),
  code: Yup.string()
    .min(2, 'Minimum 2 symbols')
    .max(10, 'Maximum 10 symbols')
    .required('Subject code is required'),
  status: Yup.number()
    .oneOf([0, 1], 'Status must be either 0 (Inactive) or 1 (Active)')
    .required('Status is required'),
})

interface SubjectFormProps {
  mode: 'create' | 'edit'
}

const SubjectForm: React.FC<SubjectFormProps> = ({mode}) => {
  const navigate = useNavigate()
  const {id} = useParams<{id: string}>()
  const dispatch = useDispatch<AppDispatch>()
  const isOnFormPage = useRef(true)
  
  const {creating, updating, loading, error, success, currentSubject} = useSelector((state: RootState) => state.subjects)
  const isSubmitting = creating || updating

  // Clear messages on component mount
  useEffect(() => {
    dispatch(clearMessages())
    
    // Cleanup function to mark that we're leaving the form page
    return () => {
      isOnFormPage.current = false
      dispatch(clearCurrentSubject())
    }
  }, [dispatch])

  // Fetch subject data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      dispatch(fetchSubject(id))
    }
  }, [mode, id, dispatch])

  // Navigate on success only if we're still on the form page
  useEffect(() => {
    if (success && isOnFormPage.current) {
      const isCreateSuccess = success.includes('created successfully')
      const isUpdateSuccess = success.includes('updated successfully')
      
      if (isCreateSuccess || isUpdateSuccess) {
        if (isOnFormPage.current) {
            navigate('/admin/subjects/list')
            dispatch(clearSuccess())
          }
      }
    }
  }, [success, navigate, dispatch])

  const formik = useFormik({
    initialValues: {
      name: currentSubject?.name || '',
      code: currentSubject?.code || '',
      status: currentSubject?.status ?? 1, // Default to active (1)
    },
    validationSchema: subjectSchema,
    enableReinitialize: true, // Important for edit mode to populate form with fetched data
    onSubmit: async (values) => {
      try {
        const subjectData = {
          name: values.name.trim(),
          code: values.code.trim(),
          status: values.status,
        }
        
        if (mode === 'create') {
          await dispatch(createSubject(subjectData)).unwrap()
        } else if (mode === 'edit' && id) {
          await dispatch(updateSubject({ id, subjectData })).unwrap()
        }
      } catch (error) {
        // Error is already handled by the slice with toast
        console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} subject:`, error)
      }
    },
  })

  const getBreadcrumbs = (): Array<PageLink> => {
    const baseBreadcrumbs = [
      {
        title: 'Admin',
        path: '/admin',
        isSeparator: false,
        isActive: false,
      },
      {
        title: 'Subjects',
        path: '/admin/subjects/list',
        isSeparator: false,
        isActive: false,
      },
    ]

    if (mode === 'create') {
      return [
        ...baseBreadcrumbs,
        {
          title: 'Create Subject',
          path: '/admin/subjects/create',
          isSeparator: false,
          isActive: true,
        },
      ]
    } else {
      return [
        ...baseBreadcrumbs,
        {
          title: 'Edit Subject',
          path: `/admin/subjects/edit/${id}`,
          isSeparator: false,
          isActive: true,
        },
      ]
    }
  }

  const getPageTitle = () => mode === 'create' ? 'Create Subject' : 'Edit Subject'
  const getCardTitle = () => mode === 'create' ? 'Create New Subject' : 'Edit Subject'
  const getButtonText = () => mode === 'create' ? 'Create Subject' : 'Update Subject'

  if (mode === 'edit' && loading) {
    return (
      <div className='d-flex justify-content-center align-items-center py-8'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={getBreadcrumbs()}>{getPageTitle()}</PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>{getCardTitle()}</h3>
        </div>
        
        <div className='card-body'>
          <form onSubmit={formik.handleSubmit} className='form'>
            {/* Subject Name */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Subject Name
              </label>
              <div className='col-lg-8'>
                <input
                  type='text'
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {
                      'is-valid': formik.touched.name && !formik.errors.name,
                      'is-invalid': formik.touched.name && formik.errors.name,
                    }
                  )}
                  placeholder='Enter subject name'
                  {...formik.getFieldProps('name')}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.name}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Subject Code */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Subject Code
              </label>
              <div className='col-lg-8'>
                <input
                  type='text'
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {
                      'is-valid': formik.touched.code && !formik.errors.code,
                      'is-invalid': formik.touched.code && formik.errors.code,
                    }
                  )}
                  placeholder='Enter subject code (e.g., MATH101)'
                  {...formik.getFieldProps('code')}
                />
                {formik.touched.code && formik.errors.code && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.code}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Subject Status */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Status
              </label>
              <div className='col-lg-8'>
                <select
                  className={clsx(
                    'form-select form-select-lg form-select-solid',
                    {
                      'is-valid': formik.touched.status && !formik.errors.status,
                      'is-invalid': formik.touched.status && formik.errors.status,
                    }
                  )}
                  {...formik.getFieldProps('status')}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.status}</div>
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
                    data-kt-indicator={isSubmitting ? 'on' : 'off'}
                    disabled={
                      isSubmitting || 
                      formik.isSubmitting || 
                      !formik.isValid || 
                      !formik.values.name.trim() || 
                      !formik.values.code.trim()
                    }
                  >
                    <span className='indicator-label'>
                      {getButtonText()}
                    </span>
                    <span className='indicator-progress'>
                      Please wait... <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  </button>
                  
                  <button
                    type='button'
                    className='btn btn-light btn-lg'
                    onClick={() => navigate('/admin/subjects/list')}
                    disabled={isSubmitting}
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

export default SubjectForm 