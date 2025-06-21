import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
//import toast from '../../../../_metronic/helpers/toast'

const schoolSubjectBreadcrumbs: Array<PageLink> = [
  {
    title: 'Admin',
    path: '/admin',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'School Subjects',
    path: '/admin/school-subjects',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Create School Subject',
    path: '/admin/school-subjects/create',
    isSeparator: false,
    isActive: true,
  },
]

const schoolSubjectSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Minimum 2 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('School subject name is required'),
  description: Yup.string()
    .min(10, 'Minimum 10 symbols')
    .max(500, 'Maximum 500 symbols')
    .required('Description is required'),
  code: Yup.string()
    .min(2, 'Minimum 2 symbols')
    .max(10, 'Maximum 10 symbols')
    .required('Subject code is required'),
  gradeLevel: Yup.string()
    .required('Grade level is required'),
  credits: Yup.number()
    .min(1, 'Minimum 1 credit')
    .max(10, 'Maximum 10 credits')
    .required('Credits are required'),
  department: Yup.string()
    .min(2, 'Minimum 2 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Department is required'),
})

const SchoolSubjectCreatePage = () => {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      code: '',
      gradeLevel: '',
      credits: 1,
      department: '',
    },
    validationSchema: schoolSubjectSchema,
    onSubmit: async (values) => {
      setCreating(true)
      try {
        // TODO: Replace with actual API call
        // const response = await createSchoolSubject(values)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        //toast.success('School subject created successfully', 'Success!')
        
        // Navigate back to school subjects list
        navigate('/admin/school-subjects')
      } catch (error) {
        console.error('Error creating school subject:', error)
        //toast.error('Failed to create school subject. Please try again.', 'Error!')
      } finally {
        setCreating(false)
      }
    },
  })

  return (
    <>
      <PageTitle breadcrumbs={schoolSubjectBreadcrumbs}>Create School Subject</PageTitle>
      
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Create New School Subject</h3>
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
                  placeholder='Enter school subject name'
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

            {/* Grade Level */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Grade Level
              </label>
              <div className='col-lg-8'>
                <select
                  className={clsx(
                    'form-select form-select-lg form-select-solid',
                    {
                      'is-valid': formik.touched.gradeLevel && !formik.errors.gradeLevel,
                      'is-invalid': formik.touched.gradeLevel && formik.errors.gradeLevel,
                    }
                  )}
                  {...formik.getFieldProps('gradeLevel')}
                >
                  <option value=''>Select grade level</option>
                  <option value='9'>Grade 9</option>
                  <option value='10'>Grade 10</option>
                  <option value='11'>Grade 11</option>
                  <option value='12'>Grade 12</option>
                </select>
                {formik.touched.gradeLevel && formik.errors.gradeLevel && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.gradeLevel}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Credits */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Credits
              </label>
              <div className='col-lg-8'>
                <input
                  type='number'
                  min='1'
                  max='10'
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {
                      'is-valid': formik.touched.credits && !formik.errors.credits,
                      'is-invalid': formik.touched.credits && formik.errors.credits,
                    }
                  )}
                  placeholder='Enter number of credits'
                  {...formik.getFieldProps('credits')}
                />
                {formik.touched.credits && formik.errors.credits && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.credits}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Department */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Department
              </label>
              <div className='col-lg-8'>
                <input
                  type='text'
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {
                      'is-valid': formik.touched.department && !formik.errors.department,
                      'is-invalid': formik.touched.department && formik.errors.department,
                    }
                  )}
                  placeholder='Enter department name'
                  {...formik.getFieldProps('department')}
                />
                {formik.touched.department && formik.errors.department && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.department}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                Description
              </label>
              <div className='col-lg-8'>
                <textarea
                  className={clsx(
                    'form-control form-control-lg form-control-solid',
                    {
                      'is-valid': formik.touched.description && !formik.errors.description,
                      'is-invalid': formik.touched.description && formik.errors.description,
                    }
                  )}
                  rows={4}
                  placeholder='Enter subject description'
                  {...formik.getFieldProps('description')}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className='fv-plugins-message-container invalid-feedback'>
                    <div>{formik.errors.description}</div>
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
                      !formik.values.name.trim() || 
                      !formik.values.code.trim() ||
                      !formik.values.description.trim() ||
                      !formik.values.gradeLevel ||
                      !formik.values.department.trim()
                    }
                  >
                    <span className='indicator-label'>
                      Create School Subject
                    </span>
                    <span className='indicator-progress'>
                      Please wait... <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  </button>
                  
                  <button
                    type='button'
                    className='btn btn-light btn-lg'
                    onClick={() => navigate('/admin/school-subjects')}
                    disabled={creating}
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

export default SchoolSubjectCreatePage 