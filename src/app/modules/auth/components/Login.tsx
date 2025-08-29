import {useState, useEffect, useRef} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link, useNavigate} from 'react-router-dom'
import {useFormik} from 'formik'
import {getUserByToken, login} from '../core/_requests'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {useAuth} from '../core/Auth'
import webSocketService from '../../../services/WebSocketService'
import SubjectSelectionModal from './SubjectSelectionModal'
import {useSchoolSelection} from '../hooks/useSchoolSelection'

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
})

const INITIAL_VALUES = {
  email: '',
  password: '',
}

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'The login details are incorrect',
  INVALID_RESPONSE: 'Invalid response format',
  NETWORK_ERROR: 'Network error. Please try again.',
} as const

/*
  Formik+YUP+Typescript:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
  https://medium.com/@maurice.de.beijer/yup-validation-and-typescript-and-formik-6c342578a20e
*/

export function Login() {
  const [loading, setLoading] = useState(false)
  const {currentUser} = useAuth()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const {
    showSubjectModal,
    userSchools,
    isProcessing,
    handleSchoolSubjectSelection,
    processUserAfterLogin,
    checkExistingUserSession
  } = useSchoolSelection()

  // Check if user is already logged in when they visit /auth
  useEffect(() => {
    checkExistingUserSession(currentUser)
  }, [currentUser, checkExistingUserSession])

  // Auto-focus email input when component mounts
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: loginSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        const {data} = await login(values.email, values.password)
        if (data.status === 'success' && data.data) {
          const user = data.data
          
          // Connect WebSocket after successful login
          webSocketService.connect(true)
          
          // Process user based on role and schools data
          processUserAfterLogin(user)
        } else {
          throw new Error(ERROR_MESSAGES.INVALID_RESPONSE)
        }
      } catch (error) {
        console.error('❌ Login failed:', error)
        const errorMessage = error instanceof Error 
          ? (error.message === ERROR_MESSAGES.INVALID_RESPONSE ? ERROR_MESSAGES.INVALID_RESPONSE : ERROR_MESSAGES.INVALID_CREDENTIALS)
          : ERROR_MESSAGES.NETWORK_ERROR
        setStatus(errorMessage)
        setSubmitting(false)
        setLoading(false)
      }
    },
  })
/*
<div className='text-center mb-11'>
<h1 className='text-gray-900 fw-bolder mb-3'>Sign In</h1>
<div className='text-gray-500 fw-semibold fs-6'>Your Social Campaigns</div>
</div>
<div className='row g-3 mb-9'>

<div className='col-md-6'>
  <a
    href='#'
    className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
  >
    <img
      alt='Logo'
      src={toAbsoluteUrl('media/svg/brand-logos/google-icon.svg')}
      className='h-15px me-3'
    />
    Sign in with Google
  </a>
  
</div>

<div className='col-md-6'>
  <a
    href='#'
    className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
  >
    <img
      alt='Logo'
      src={toAbsoluteUrl('media/svg/brand-logos/apple-black.svg')}
      className='theme-light-show h-15px me-3'
    />
    <img
      alt='Logo'
      src={toAbsoluteUrl('media/svg/brand-logos/apple-black-dark.svg')}
      className='theme-dark-show h-15px me-3'
    />
    Sign in with Apple
  </a>

</div>

</div>

<div className='separator separator-content my-14'>
<span className='w-125px text-gray-500 fw-semibold fs-7'>Or with email</span>
</div>

*/
  return (
    <form
      className='form w-100'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      {formik.status ? (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      ) : (
        <></>
      )}

      {/* begin::Form group */}
      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>Email</label>
        <input
          ref={emailInputRef}
          placeholder='Email'
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {
              'is-valid': formik.touched.email && !formik.errors.email,
            }
          )}
          type='email'
          name='email'
          autoComplete='off'
          autoFocus
        />
        {formik.touched.email && formik.errors.email && (
          <div className='fv-plugins-message-container'>
            <span role='alert'>{formik.errors.email}</span>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className='fv-row mb-3'>
        <label className='form-label fw-bolder text-gray-900 fs-6 mb-0'>Password</label>
        <input
          placeholder='Password'
          type='password'
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.password && formik.errors.password,
            },
            {
              'is-valid': formik.touched.password && !formik.errors.password,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Wrapper */}
      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <div />

        {/* begin::Link */}
        <Link to='/auth/forgot-password' className='link-primary'>
          Forgot Password ?
        </Link>
        {/* end::Link */}
      </div>
      {/* end::Wrapper */}

      {/* begin::Action */}
      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          disabled={formik.isSubmitting || !formik.isValid || loading || isProcessing}
        >
          {(!loading && !isProcessing) && <span className='indicator-label'>Continue</span>}
          {(loading || isProcessing) && (
            <span className='indicator-progress' style={{display: 'block'}}>
              {loading ? 'Signing in...' : 'Processing...'}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>
      {/* end::Action */}

      <div className='text-gray-500 text-center fw-semibold fs-6'>
        Not a Member yet?{' '}
        <Link to='/auth/registration' className='link-primary'>
          Sign up
        </Link>
      </div>

       {showSubjectModal && userSchools && userSchools.length > 0 && (
         <SubjectSelectionModal
           show={showSubjectModal}
           schools={userSchools}
           onSubjectSelect={handleSchoolSubjectSelection}
         />
       )}
    </form>
  )
}
