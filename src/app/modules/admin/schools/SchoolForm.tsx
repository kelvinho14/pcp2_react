import {FC, useState, useEffect} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {KTCardBody} from '../../../../_metronic/helpers'

type Props = {
  onSubmit: (values: {
    name: string
    code: string
    address?: string
    phone?: string
    email?: string
  }) => Promise<void>
  isSubmitting?: boolean
  initialValues?: {
    name: string
    code: string
    address?: string
    phone?: string
    email?: string
  }
}

const SchoolForm: FC<Props> = ({onSubmit, isSubmitting = false, initialValues}) => {
  const [hasChanges, setHasChanges] = useState(false)

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      code: Yup.string().required('Code is required'),
      address: Yup.string(),
      phone: Yup.string(),
      email: Yup.string().email('Invalid email format'),
    }),
    onSubmit: async (values) => {
      await onSubmit(values)
    },
  })

  useEffect(() => {
    setHasChanges(formik.dirty)
  }, [formik.dirty])

  return (
    <KTCardBody className='py-4'>
      <form onSubmit={formik.handleSubmit} className='form'>
        <div className='row mb-6'>
          <label className='col-lg-4 col-form-label required fw-bold fs-6'>Name</label>
          <div className='col-lg-8'>
            <input
              type='text'
              className='form-control form-control-solid'
              placeholder='Enter school name'
              {...formik.getFieldProps('name')}
            />
            {formik.touched.name && formik.errors.name && (
              <div className='fv-plugins-message-container invalid-feedback'>
                <div>{formik.errors.name}</div>
              </div>
            )}
          </div>
        </div>

        <div className='row mb-6'>
          <label className='col-lg-4 col-form-label required fw-bold fs-6'>Code</label>
          <div className='col-lg-8'>
            <input
              type='text'
              className='form-control form-control-solid'
              placeholder='Enter school code'
              {...formik.getFieldProps('code')}
            />
            {formik.touched.code && formik.errors.code && (
              <div className='fv-plugins-message-container invalid-feedback'>
                <div>{formik.errors.code}</div>
              </div>
            )}
          </div>
        </div>

        <div className='row mb-6'>
          <label className='col-lg-4 col-form-label fw-bold fs-6'>Address</label>
          <div className='col-lg-8'>
            <textarea
              className='form-control form-control-solid'
              rows={3}
              placeholder='Enter school address'
              {...formik.getFieldProps('address')}
            />
            {formik.touched.address && formik.errors.address && (
              <div className='fv-plugins-message-container invalid-feedback'>
                <div>{formik.errors.address}</div>
              </div>
            )}
          </div>
        </div>

        <div className='row mb-6'>
          <label className='col-lg-4 col-form-label fw-bold fs-6'>Phone</label>
          <div className='col-lg-8'>
            <input
              type='tel'
              className='form-control form-control-solid'
              placeholder='Enter phone number'
              {...formik.getFieldProps('phone')}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className='fv-plugins-message-container invalid-feedback'>
                <div>{formik.errors.phone}</div>
              </div>
            )}
          </div>
        </div>

        <div className='row mb-6'>
          <label className='col-lg-4 col-form-label fw-bold fs-6'>Email</label>
          <div className='col-lg-8'>
            <input
              type='email'
              className='form-control form-control-solid'
              placeholder='Enter email address'
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
              <div className='fv-plugins-message-container invalid-feedback'>
                <div>{formik.errors.email}</div>
              </div>
            )}
          </div>
        </div>

        <div className='card-footer d-flex justify-content-end py-6 px-9'>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={isSubmitting || !hasChanges}
          >
            {isSubmitting ? 'Saving...' : 'Save School'}
          </button>
        </div>
      </form>
    </KTCardBody>
  )
}

export {SchoolForm} 