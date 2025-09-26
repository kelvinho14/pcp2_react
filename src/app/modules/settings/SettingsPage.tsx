import {FC, useEffect, useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../store'
import {KTCard, KTCardBody} from '../../../_metronic/helpers'
import {useNavigate} from 'react-router-dom'
import toast from '../../../_metronic/helpers/toast'
import axios from 'axios'
import {useAuth} from '../auth/core/Auth'
import {getHeadersWithSchoolSubject} from '../../../_metronic/helpers/axios'
import {isTeachingStaff} from '../../constants/roles'
import {Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../_metronic/layout/core'

// Settings interface
interface Settings {
  vimeo_client_id: string
  vimeo_client_secret: string
  vimeo_access_token: string
  youtube_api_key: string
}

const settingsSchema = Yup.object().shape({
  vimeo_client_id: Yup.string(),
  vimeo_client_secret: Yup.string(),
  vimeo_access_token: Yup.string(),
  youtube_api_key: Yup.string(),
})

const settingsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Credentials',
    path: '/settings',
    isSeparator: false,
    isActive: true,
  },
]

const SettingsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {currentUser} = useAuth()
  const navigate = useNavigate()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    vimeo_client_id: '',
    vimeo_client_secret: '',
    vimeo_access_token: '',
    youtube_api_key: '',
  })

  // Check if user is teaching staff, redirect if not
  if (!currentUser || !isTeachingStaff(currentUser.role?.role_type)) {
    return <Navigate to='/dashboard' replace />
  }

  // Fetch settings from API
  const loadSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL
      if (!API_URL) {
        throw new Error('API URL is not configured')
      }

      const endpoint = `${API_URL}/settings`
      const headers = { ...getHeadersWithSchoolSubject(endpoint) }

      const response = await axios.get(endpoint, {
        headers,
        withCredentials: true,
        timeout: 30000,
      })

      if (response.data.status === 'success' && response.data.data) {
        // Extract settings from the credentials object or direct fields
        let settingsData
        if (response.data.data.credentials && typeof response.data.data.credentials === 'object') {
          // If data comes in credentials object format
          const credential = response.data.data.credentials
          settingsData = {
            vimeo_client_id: credential.vimeo_client_id || '',
            vimeo_client_secret: credential.vimeo_client_secret || '',
            vimeo_access_token: credential.vimeo_access_token || '',
            youtube_api_key: credential.youtube_api_key || '',
          }
        } else {
          // If data comes in direct format (fallback)
          settingsData = {
            vimeo_client_id: response.data.data.vimeo_client_id || '',
            vimeo_client_secret: response.data.data.vimeo_client_secret || '',
            vimeo_access_token: response.data.data.vimeo_access_token || '',
            youtube_api_key: response.data.data.youtube_api_key || '',
          }
        }
        setSettings(settingsData)
        // Update form values
        formik.setValues(settingsData)
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error)
      toast.error(error.response?.data?.message || 'Failed to load settings', 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const formik = useFormik({
    initialValues: settings,
    validationSchema: settingsSchema,
    enableReinitialize: true,
    onSubmit: async (values, {setSubmitting}) => {
      setIsSubmitting(true)
      try {
        const API_URL = import.meta.env.VITE_APP_API_URL
        if (!API_URL) {
          throw new Error('API URL is not configured')
        }

        const endpoint = `${API_URL}/settings`
        const headers = { 
          ...getHeadersWithSchoolSubject(endpoint),
          'Content-Type': 'application/json'
        }

        // Send data in the expected API format
        const payload = {
          credentials: {
            vimeo_client_id: values.vimeo_client_id || '',
            vimeo_client_secret: values.vimeo_client_secret || '',
            vimeo_access_token: values.vimeo_access_token || '',
            youtube_api_key: values.youtube_api_key || '',
          }
        }

        const response = await axios.post(endpoint, payload, {
          headers,
          withCredentials: true,
          timeout: 30000,
        })

        if (response.data.status === 'success') {
          toast.success('Settings updated successfully!', 'Success')
          setSettings(values)
        } else {
          throw new Error(response.data.message || 'Failed to update settings')
        }
      } catch (error: any) {
        console.error('Error updating settings:', error)
        toast.error(error.response?.data?.message || error.message || 'Failed to update settings', 'Error')
      } finally {
        setIsSubmitting(false)
        setSubmitting(false)
      }
    },
  })

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{minHeight: '400px'}}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={settingsBreadcrumbs}>Credentials</PageTitle>

      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <h3 className='welcome-title'>
              Manage your Vimeo and YouTube API credentials
            </h3>
          </div>
        </div>
      </div>

      <KTCard>
        <KTCardBody className='py-4'>
        <form onSubmit={formik.handleSubmit} className='form'>
          <h4 className='fw-bold mb-6'>Vimeo Credentials</h4>
          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>
              Client ID
            </label>
            <div className='col-lg-8'>
              <input
                type='text'
                className={`form-control form-control-lg form-control-solid ${
                  formik.touched.vimeo_client_id && formik.errors.vimeo_client_id ? 'is-invalid' : ''
                }`}
                placeholder='Enter Vimeo Client ID'
                {...formik.getFieldProps('vimeo_client_id')}
              />
              {formik.touched.vimeo_client_id && formik.errors.vimeo_client_id && (
                <div className='invalid-feedback'>{formik.errors.vimeo_client_id}</div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>
              Client Secret
            </label>
            <div className='col-lg-8'>
              <input
                type='password'
                className={`form-control form-control-lg form-control-solid ${
                  formik.touched.vimeo_client_secret && formik.errors.vimeo_client_secret ? 'is-invalid' : ''
                }`}
                placeholder='Enter Vimeo Client Secret'
                {...formik.getFieldProps('vimeo_client_secret')}
              />
              {formik.touched.vimeo_client_secret && formik.errors.vimeo_client_secret && (
                <div className='invalid-feedback'>{formik.errors.vimeo_client_secret}</div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>
              Access Token
            </label>
            <div className='col-lg-8'>
              <input
                type='password'
                className={`form-control form-control-lg form-control-solid ${
                  formik.touched.vimeo_access_token && formik.errors.vimeo_access_token ? 'is-invalid' : ''
                }`}
                placeholder='Enter Vimeo Access Token'
                {...formik.getFieldProps('vimeo_access_token')}
              />
              {formik.touched.vimeo_access_token && formik.errors.vimeo_access_token && (
                <div className='invalid-feedback'>{formik.errors.vimeo_access_token}</div>
              )}
            </div>
          </div>

          {/* YouTube Credentials Section */}
          <div className='separator my-10'></div>
          <h4 className='fw-bold mb-6'>YouTube Credentials</h4>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>
              API Key
            </label>
            <div className='col-lg-8'>
              <input
                type='password'
                className={`form-control form-control-lg form-control-solid ${
                  formik.touched.youtube_api_key && formik.errors.youtube_api_key ? 'is-invalid' : ''
                }`}
                placeholder='Enter YouTube API Key'
                {...formik.getFieldProps('youtube_api_key')}
              />
              {formik.touched.youtube_api_key && formik.errors.youtube_api_key && (
                <div className='invalid-feedback'>{formik.errors.youtube_api_key}</div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className='row'>
            <div className='col-lg-8 offset-lg-4'>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                    Updating...
                  </>
                ) : (
                  'Update Settings'
                )}
              </button>
            </div>
          </div>
        </form>
      </KTCardBody>
    </KTCard>
    </>
  )
}

export default SettingsPage
