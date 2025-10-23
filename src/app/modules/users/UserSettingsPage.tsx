import {FC, useEffect, useState, useRef, useCallback} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../store'
import {useNavigate} from 'react-router-dom'
import toast from '../../../_metronic/helpers/toast'
import axios from 'axios'
import {LANGUAGES, DEFAULT_LANGUAGE} from '../../constants/languages'
import {TIMEZONES, TIMEZONE_GROUPS, DEFAULT_TIMEZONE} from '../../constants/timezones'
import {THEMES, DEFAULT_THEME} from '../../constants/themes'
import {ROLES, isTeachingStaff} from '../../constants/roles'
import {useAuth} from '../auth/core/Auth'
import {getHeadersWithSchoolSubject} from '../../../_metronic/helpers/axios'
import {fetchUserSettings, updateUserSettings, updateUserSettingsLocal} from '../../../store/user/userSlice'

// Image cropping state interface
interface CropState {
  x: number
  y: number
  scale: number
}

const userSettingsSchema = Yup.object().shape({
  // Name and email are read-only display fields, no validation needed
  name: Yup.string(),
  email: Yup.string(),
  current_password: Yup.string()
    .test('password-logic', 'Current password is required when changing password', function(value) {
      const { new_password, confirm_password } = this.parent
      // If any password field is filled, all must be filled
      if (new_password || confirm_password) {
        return Boolean(value && value.length > 0)
      }
      return true
    }),
  new_password: Yup.string()
    .test('password-logic', 'New password is required when changing password', function(value) {
      const { current_password, confirm_password } = this.parent
      // If any password field is filled, all must be filled
      if (current_password || confirm_password) {
        return Boolean(value && value.length > 0)
      }
      return true
    })
    .when('current_password', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema
        .min(8, 'Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      otherwise: (schema) => schema
    }),
  confirm_password: Yup.string()
    .test('password-logic', 'Password confirmation is required when changing password', function(value) {
      const { current_password, new_password } = this.parent
      // If any password field is filled, all must be filled
      if (current_password || new_password) {
        return Boolean(value && value.length > 0)
      }
      return true
    })
    .when('new_password', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema.oneOf([Yup.ref('new_password')], 'Passwords must match'),
      otherwise: (schema) => schema
    }),
  preferred_language: Yup.string()
    .required('Preferred language is required'),
  timezone: Yup.string()
    .required('Timezone is required'),
  theme: Yup.number()
    .required('Theme is required')
    .oneOf([1, 2, 3], 'Please select a valid theme'),
  exercise_submission_notifications: Yup.boolean(),
})

const UserSettingsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {currentUser, setCurrentUser} = useAuth()
  
  // Redux state
  const { userSettings, userSettingsLoading, userSettingsError } = useSelector((state: RootState) => state.users)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarCacheKey, setAvatarCacheKey] = useState<number>(Date.now())
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [cropState, setCropState] = useState<CropState>({ x: 0, y: 0, scale: 1 })
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const formikRef = useRef<any>(null)

  // Helper function to add cache-busting parameter to avatar URLs
  const getAvatarUrlWithCacheBust = (url: string | null | undefined): string => {
    if (!url) return '/media/avatars/blank.png'
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}t=${avatarCacheKey}`
  }

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[@$!%*?&]/.test(password)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'danger' }
    if (score <= 3) return { score, label: 'Fair', color: 'warning' }
    if (score <= 4) return { score, label: 'Good', color: 'info' }
    return { score, label: 'Strong', color: 'success' }
  }

  const generatePassword = () => {
    // Ensure we have at least one of each required character type
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '@$!%*?&'
    
    let password = ''
    
    // Add one of each required character type first
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += special.charAt(Math.floor(Math.random() * special.length))
    
    // Fill the rest with random characters from all types
    const allChars = lowercase + uppercase + numbers + special
    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    
    // Shuffle the password to make it more random
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    formik.setFieldValue('new_password', password)
    formik.setFieldValue('confirm_password', password)
  }

  // Fetch user settings from API using Redux
  const loadUserSettings = async () => {
    try {
      const result = await dispatch(fetchUserSettings()).unwrap()
      
      // Set avatar preview if user has an avatar
      if (result.avatar_url) {
        setAvatarPreview(result.avatar_url)
        setAvatarCacheKey(Date.now()) // Set initial cache key
      }
      
      // Update form values with user settings
      if (formikRef.current) {
        formikRef.current.setValues({
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          current_password: '',
          new_password: '',
          confirm_password: '',
          preferred_language: result.preferred_language || DEFAULT_LANGUAGE,
          timezone: result.timezone || DEFAULT_TIMEZONE,
          theme: parseInt(result.theme) || DEFAULT_THEME,
          exercise_submission_notifications: Boolean(result.exercise_submission_notifications),
        })
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
      toast.error('Failed to load user settings', 'Error')
    }
  }

  // Load current user data and fetch user settings
  useEffect(() => {
    if (currentUser) {
      loadUserSettings()
    }
  }, [currentUser])





  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processAvatarFile(file)
    }
  }

  const processAvatarFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'Error')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB', 'Error')
      return
    }

    // Store the file for upload
    setAvatarFile(file)
    
    // Create original image for cropping interface
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
      setShowCropper(true)
      
      // Create a temporary image to get dimensions and center it
      const img = new Image()
      img.onload = () => {
        // Set initial scale to 100% (natural size)
        const initialScale = 1.0
        
        // Center the image initially
        // Calculate the scaled dimensions
        const cropSize = 300 // Crop circle size
        const scaledWidth = img.width * initialScale
        const scaledHeight = img.height * initialScale
        
        // Center the image in the crop circle
        const initialX = (cropSize - scaledWidth) / 2
        const initialY = (cropSize - scaledHeight) / 2
        
        setCropState({ 
          x: initialX, 
          y: initialY, 
          scale: initialScale 
        })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      processAvatarFile(file)
    }
  }, [])

  // Handle crop state changes
  const handleCropChange = (newCropState: Partial<CropState>) => {
    setCropState(prev => ({ ...prev, ...newCropState }))
  }

  // Apply crop and upload directly
  const applyCropAndUpload = async () => {
    if (!originalImage || !avatarFile) return

    try {
      // Show loading state
      toast.info('Cropping and uploading image...', 'Processing')
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.onload = () => {
        const size = 200 // Final avatar size
        canvas.width = size
        canvas.height = size

        // The crop area is 300x300 pixels
        const cropSize = 300
        const scale = cropState.scale
        
        // Calculate the scaled image dimensions
        const scaledImageWidth = img.width * scale
        const scaledImageHeight = img.height * scale
        
        // The cropState.x and cropState.y represent the image's top-left position
        // relative to the crop area's top-left corner
        
        // Calculate the visible portion of the image within the crop area
        // The crop area shows the portion of the image from (cropState.x, cropState.y)
        // to (cropState.x + cropSize, cropState.y + cropSize)
        
        // But we need to account for the fact that the image might be larger than the crop area
        // and positioned such that only part of it is visible
        
        // Calculate the source rectangle in the original image coordinates
        const sourceX = -cropState.x / scale
        const sourceY = -cropState.y / scale
        const sourceWidth = cropSize / scale
        const sourceHeight = cropSize / scale
        
        // Ensure we don't go outside the image bounds
        const clampedSourceX = Math.max(0, Math.min(sourceX, img.width - sourceWidth))
        const clampedSourceY = Math.max(0, Math.min(sourceY, img.height - sourceHeight))
        const clampedSourceWidth = Math.min(sourceWidth, img.width - clampedSourceX)
        const clampedSourceHeight = Math.min(sourceHeight, img.height - clampedSourceY)

        // Draw the cropped square image
        ctx.drawImage(
          img,
          clampedSourceX, clampedSourceY, clampedSourceWidth, clampedSourceHeight,
          0, 0, size, size
        )

        // Convert to blob for upload
        canvas.toBlob(async (blob) => {
          if (blob) {
            // Create a new file from the cropped blob
            const croppedFile = new File([blob], avatarFile.name, {
              type: avatarFile.type,
              lastModified: Date.now()
            })
            
            // Upload the cropped image
            const avatarUrl = await uploadAvatar(croppedFile)
            
            console.log('Avatar uploaded successfully, URL:', avatarUrl)
            
            // Update preview and close cropper
            setAvatarPreview(avatarUrl)
            setAvatarCacheKey(Date.now()) // Force cache refresh
            setShowCropper(false)
            setAvatarFile(null)
            
            // Update Redux state directly since backend already updated user preferences
            dispatch(updateUserSettingsLocal({ avatar_url: avatarUrl }))
            
            // Update currentUser context with new avatar URL
            if (currentUser) {
              setCurrentUser({ ...currentUser, avatar_url: avatarUrl })
            }
            
            toast.success('Avatar uploaded successfully!', 'Success')
          }
        }, 'image/png')
      }
      img.src = originalImage
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar', 'Error')
    }
  }

  // Cancel cropping
  const cancelCrop = () => {
    setShowCropper(false)
    setOriginalImage(null)
    setAvatarFile(null)
  }

  // Mouse and touch drag functionality
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      const newX = cropState.x + deltaX
      const newY = cropState.y + deltaY
      setCropState(prev => ({ ...prev, x: newX, y: newY }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch event handlers for mobile devices
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null)
  const [touchStartScale, setTouchStartScale] = useState<number>(1)

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 1) {
      // Single touch - dragging
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      setTouchStartDistance(distance)
      setTouchStartScale(cropState.scale)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 1 && isDragging) {
      // Single touch - dragging
      const touch = e.touches[0]
      const deltaX = touch.clientX - dragStart.x
      const deltaY = touch.clientY - dragStart.y
      const newX = cropState.x + deltaX
      const newY = cropState.y + deltaY
      setCropState(prev => ({ ...prev, x: newX, y: newY }))
      setDragStart({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2 && touchStartDistance !== null) {
      // Two touches - pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      const scale = touchStartScale * (distance / touchStartDistance)
      const clampedScale = Math.max(0.3, Math.min(3.0, scale))
      handleCropChange({ scale: clampedScale })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTouchStartDistance(null)
  }

  const removeAvatar = async () => {
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL
      if (!API_URL) {
        throw new Error('API URL is not configured')
      }

      const endpoint = `${API_URL}/users/avatar`
      const headers = { ...getHeadersWithSchoolSubject(endpoint) }
      
      await axios.delete(endpoint, {
        headers,
        withCredentials: true,
        timeout: 30000,
      })

      // Clear local state
      setAvatarPreview(null)
      setAvatarCacheKey(Date.now()) // Force cache refresh
      setAvatarFile(null)
      
      // Update Redux state to remove avatar
      dispatch(updateUserSettingsLocal({ avatar_url: null }))

      // Update currentUser context to remove avatar
      if (currentUser) {
        setCurrentUser({ ...currentUser, avatar_url: undefined })
      }

      toast.success('Avatar removed successfully!', 'Success')
    } catch (error: any) {
      console.error('Avatar removal error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to remove avatar', 'Error')
    }
  }

  // Upload avatar to server
  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      const API_URL = import.meta.env.VITE_APP_API_URL
      if (!API_URL) {
        throw new Error('API URL is not configured')
      }

      const formData = new FormData()
      formData.append('file', file)
      
      const endpoint = `${API_URL}/users/avatar`
      const headers = { ...getHeadersWithSchoolSubject(endpoint) }
      delete headers['Content-Type'] // Let browser set boundary

      const response = await axios.post(endpoint, formData, {
        headers,
        withCredentials: true,
        timeout: 30000, // 30 second timeout
      })

      if (response.data.status === 'success' && response.data.data?.avatar_url) {
        return response.data.data.avatar_url
      }
      
      throw new Error('Upload failed: Invalid response format')
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      if (error.response?.status === 413) {
        throw new Error('Image file is too large. Please use an image smaller than 5MB.')
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload avatar')
    }
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
      preferred_language: userSettings?.preferred_language || DEFAULT_LANGUAGE,
      timezone: userSettings?.timezone || DEFAULT_TIMEZONE,
      theme: userSettings?.theme || DEFAULT_THEME,
      exercise_submission_notifications: Boolean(userSettings?.exercise_submission_notifications),
    },
    validationSchema: userSettingsSchema,
    onSubmit: async (values, {setSubmitting, setFieldError}) => {
      setIsSubmitting(true)
      try {
        let avatarUrl = userSettings?.avatar_url || null
        
        // Upload avatar first if a new file is selected
        if (avatarFile) {
          try {
            avatarUrl = await uploadAvatar(avatarFile)
            toast.success('Avatar uploaded successfully!', 'Success')
          } catch (error: any) {
            toast.error(error.message || 'Failed to upload avatar', 'Error')
            return
          }
        }
        
        // Prepare JSON payload
        const payload: any = {
          preferred_language: values.preferred_language,
          timezone: values.timezone,
          theme: values.theme,
          exercise_submission_notifications: Boolean(values.exercise_submission_notifications)
        }
        

        // Add password fields if provided
        if (values.current_password) {
          payload.current_password = values.current_password
        }
        if (values.new_password) {
          payload.new_password = values.new_password
        }
        
        // Add avatar_url if available (either existing or newly uploaded)
        if (avatarUrl) {
          payload.avatar_url = avatarUrl
        }

        // Use Redux action instead of direct Axios call
        const result = await dispatch(updateUserSettings(payload)).unwrap()
        
        toast.success('Settings updated successfully!', 'Success')
        
        // Clear password fields and avatar file
        formik.setFieldValue('current_password', '')
        formik.setFieldValue('new_password', '')
        formik.setFieldValue('confirm_password', '')
        setAvatarFile(null)
        
        // Hide password fields after successful password change
        if (values.current_password || values.new_password) {
          setShowPasswordFields(false)
        }
        
        // Refresh user settings to get updated data
        await dispatch(fetchUserSettings())
      } catch (error: unknown) {
        const errorMessage = (error as any)?.message || 'Failed to update settings'
        toast.error(errorMessage, 'Error')
      } finally {
        setIsSubmitting(false)
        setSubmitting(false)
      }
    },
  })

  // Set the ref after formik is created
  formikRef.current = formik

  // Remove the manual setValues since enableReinitialize will handle it

  const languages = LANGUAGES
  const timezones = TIMEZONES
  const themes = THEMES

      if (userSettingsLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{minHeight: '400px'}}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit} className='form'>
      {/* Error Display */}
      {userSettingsError && (
        <div className='alert alert-danger mb-6'>
          <i className='fas fa-exclamation-triangle me-2'></i>
          {userSettingsError}
        </div>
      )}
      
      {/* Two Column Layout */}
      <div className='row'>
            {/* Left Column - Profile Information */}
            <div className='col-lg-4'>
              <div className='card card-flush mb-6 mb-lg-0'>
                <div className='card-body text-center'>
                  {/* Profile Picture */}
                  <div className='mb-7'>
                    <div 
                      className='position-relative d-inline-block'
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className='symbol symbol-150px symbol-circle symbol-fixed position-relative mb-4'>
                        <img 
                          src={getAvatarUrlWithCacheBust(avatarPreview || userSettings?.avatar_url)} 
                          alt='Avatar' 
                          className='symbol-label'
                          style={{objectFit: 'cover'}}
                        />
                        
                        {/* Drag & Drop Overlay */}
                        <div className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded-circle opacity-0 hover-opacity-100 transition-opacity'
                          style={{transition: 'opacity 0.2s ease'}}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                          <div className='text-center text-white'>
                            <i className='fas fa-cloud-upload-alt fs-2x mb-2'></i>
                            <div className='fw-bold'>Drop image</div>
                            <div className='fs-7'>or click below</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className='d-flex flex-column gap-2 align-items-center'>
                      <label className='btn btn-primary btn-sm cursor-pointer mb-0'>
                        <i className='fas fa-upload me-2'></i>
                        Choose File
                        <input
                          type='file'
                          name='avatar'
                          accept='image/*'
                          onChange={handleAvatarChange}
                          className='d-none'
                        />
                      </label>

                      {avatarPreview && (
                        <button
                          type='button'
                          className='btn btn-light-danger btn-sm'
                          onClick={removeAvatar}
                        >
                          <i className='fas fa-trash me-2'></i>
                          Remove
                        </button>
                      )}

                      <div className='form-text text-center'>
                        <small>PNG, JPG, JPEG, GIF. Max: 5MB</small>
                      </div>
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className='mb-7'>
                    <div className='fw-bold fs-3 text-gray-800 mb-1'>
                      {formik.values.name || 'Not provided'}
                    </div>
                    <div className='text-gray-600 fs-6'>
                      {formik.values.email || 'Not provided'}
                    </div>
                  </div>

                  <div className='separator my-6'></div>

                  {/* Change Password Section */}
                  <div className='text-start'>
                    <button
                      type='button'
                      className='btn btn-light-primary btn-sm w-100'
                      onClick={() => {
                        if (showPasswordFields) {
                          // Clear password fields when canceling
                          formik.setFieldValue('current_password', '')
                          formik.setFieldValue('new_password', '')
                          formik.setFieldValue('confirm_password', '')
                          formik.setFieldTouched('current_password', false)
                          formik.setFieldTouched('new_password', false)
                          formik.setFieldTouched('confirm_password', false)
                        }
                        setShowPasswordFields(!showPasswordFields)
                      }}
                    >
                      <i className={`fas fa-${showPasswordFields ? 'times' : 'key'} me-2`}></i>
                      {showPasswordFields ? 'Cancel' : 'Change Password'}
                    </button>

                    {showPasswordFields && (
                      <>
                        <div className='mb-5 mt-5'>
                          <label className='form-label fw-semibold fs-6 mb-2'>Current Password</label>
                          <div className='input-group'>
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              className={`form-control form-control-solid ${
                                formik.touched.current_password && formik.errors.current_password ? 'is-invalid' : ''
                              }`}
                              placeholder='Enter current password'
                              {...formik.getFieldProps('current_password')}
                            />
                            <button
                              type='button'
                              className='btn btn-icon btn-light'
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              title={showCurrentPassword ? 'Hide password' : 'Show password'}
                            >
                              <i className={`fas fa-${showCurrentPassword ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                          </div>
                          {formik.touched.current_password && formik.errors.current_password && (
                            <div className='text-danger mt-2'><small>{formik.errors.current_password}</small></div>
                          )}
                        </div>

                        <div className='mb-5'>
                          <label className='form-label fw-semibold fs-6 mb-2'>New Password</label>
                          <div className='input-group mb-2'>
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              className={`form-control form-control-solid ${
                                formik.touched.new_password && formik.errors.new_password ? 'is-invalid' : ''
                              }`}
                              placeholder='Enter new password'
                              {...formik.getFieldProps('new_password')}
                            />
                            <button
                              type='button'
                              className='btn btn-icon btn-light'
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              title={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              <i className={`fas fa-${showNewPassword ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                          </div>
                          <button
                            type='button'
                            className='btn btn-secondary btn-sm w-100 mb-2'
                            onClick={generatePassword}
                          >
                            <i className='fas fa-key me-2'></i>Generate Strong Password
                          </button>
                          {formik.touched.new_password && formik.errors.new_password && (
                            <div className='text-danger mt-2'><small>{formik.errors.new_password}</small></div>
                          )}
                          {formik.values.new_password && (
                            <div className='mt-2'>
                              <div className='d-flex align-items-center justify-content-between mb-1'>
                                <span className='fw-semibold fs-7'>Strength:</span>
                                <span className={`badge badge-${getPasswordStrength(formik.values.new_password).color}`}>
                                  {getPasswordStrength(formik.values.new_password).label}
                                </span>
                              </div>
                              <div className='progress' style={{height: '8px'}}>
                                <div 
                                  className={`progress-bar bg-${getPasswordStrength(formik.values.new_password).color}`}
                                  style={{width: `${(getPasswordStrength(formik.values.new_password).score / 5) * 100}%`}}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className='mb-5'>
                          <label className='form-label fw-semibold fs-6 mb-2'>Confirm New Password</label>
                          <div className='input-group'>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              className={`form-control form-control-solid ${
                                formik.touched.confirm_password && formik.errors.confirm_password ? 'is-invalid' : ''
                              }`}
                              placeholder='Confirm new password'
                              {...formik.getFieldProps('confirm_password')}
                            />
                            <button
                              type='button'
                              className='btn btn-icon btn-light'
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              title={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                              <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                          </div>
                          {formik.touched.confirm_password && formik.errors.confirm_password && (
                            <div className='text-danger mt-2'><small>{formik.errors.confirm_password}</small></div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Settings */}
            <div className='col-lg-8'>
              <div className='card card-flush'>
                <div className='card-body'>
                  {/* Preferences Section */}
                  <h4 className='fw-bold mb-6'>Preferences</h4>

                  <div className='row mb-6'>
                    <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                      Preferred Language
                    </label>
                    <div className='col-lg-8'>
                      <select
                        className={`form-select form-select-solid ${
                          formik.touched.preferred_language && formik.errors.preferred_language ? 'is-invalid' : ''
                        }`}
                        {...formik.getFieldProps('preferred_language')}
                      >
                        <option value=''>Select preferred language</option>
                        {languages.map((language) => (
                          <option key={language.value} value={language.value}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                      {formik.touched.preferred_language && formik.errors.preferred_language && (
                        <div className='invalid-feedback'>{formik.errors.preferred_language}</div>
                      )}
                    </div>
                  </div>

                  <div className='row mb-6'>
                    <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                      Timezone
                    </label>
                    <div className='col-lg-8'>
                      <select
                        className={`form-select form-select-solid ${
                          formik.touched.timezone && formik.errors.timezone ? 'is-invalid' : ''
                        }`}
                        {...formik.getFieldProps('timezone')}
                      >
                        <option value=''>Select timezone</option>
                        {TIMEZONE_GROUPS.map((group) => (
                          <optgroup key={group.offset} label={group.label}>
                            {group.timezones.map((timezone) => (
                              <option key={timezone.value} value={timezone.value}>
                                {timezone.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {formik.touched.timezone && formik.errors.timezone && (
                        <div className='invalid-feedback'>{formik.errors.timezone}</div>
                      )}
                    </div>
                  </div>

                  <div className='row mb-6'>
                    <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
                      Theme
                    </label>
                    <div className='col-lg-8'>
                      <select
                        className={`form-select form-select-solid ${
                          formik.touched.theme && formik.errors.theme ? 'is-invalid' : ''
                        }`}
                        {...formik.getFieldProps('theme')}
                      >
                        {themes.map((theme) => (
                          <option key={theme.value} value={theme.value}>
                            {theme.label}
                          </option>
                        ))}
                      </select>
                      {formik.touched.theme && formik.errors.theme && (
                        <div className='invalid-feedback'>{formik.errors.theme}</div>
                      )}
                    </div>
                  </div>

                  {/* Notification Settings Section - Only for Teachers */}
                  {isTeachingStaff(currentUser?.role?.role_type) && (
                    <>
                      <div className='separator my-10'></div>
                      <h4 className='fw-bold mb-6'>Notification Settings</h4>

                      <div className='row mb-6'>
                        <label className='col-lg-4 col-form-label fw-semibold fs-6'>
                          Student Exercise Submission
                        </label>
                        <div className='col-lg-8'>
                          <div className='form-check form-switch form-check-custom form-check-solid'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id='exercise_submission_notifications'
                              checked={Boolean(formik.values.exercise_submission_notifications)}
                              onChange={(e) => {
                                formik.setFieldValue('exercise_submission_notifications', e.target.checked)
                              }}
                              name='exercise_submission_notifications'
                            />
                            <label className='form-check-label fw-semibold text-gray-400 ms-3' htmlFor='exercise_submission_notifications'>
                              Receive notifications when students submit exercises
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className='separator my-10'></div>

                  {/* Submit Button */}
                  <div className='d-flex justify-content-end'>
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
              </div>
            </div>
          </div>

      {/* Image Cropper Modal */}
      {showCropper && originalImage && (
            <div className='modal fade show d-block' style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <div className='modal-dialog modal-lg modal-dialog-centered'>
                <div className='modal-content'>
                  <div className='modal-header'>
                    <h5 className='modal-title'>Crop Profile Picture</h5>
                    <button type='button' className='btn-close' onClick={cancelCrop}></button>
                  </div>
                  <div className='modal-body'>
                    
                    
                    {/* Image Cropper */}
                    <div className='position-relative d-inline-block mx-auto'>
                      <div 
                        className='position-relative overflow-hidden'
                        style={{
                          width: '300px',
                          height: '300px',
                          border: '3px solid #e1e3ea'
                        }}
                      >
                        <img
                          src={originalImage}
                          alt='Crop preview'
                          style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: 'none',
                            maxHeight: 'none',
                            transform: `translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale})`,
                            transformOrigin: 'center center',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            transition: 'none',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'none'
                          }}
                          draggable={false}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        />
                      </div>
                      
                      {/* Crop overlay */}
                      <div 
                        className='position-absolute top-0 start-0 w-100 h-100'
                        style={{
                          borderRadius: '50%',
                          border: '2px dashed #3699ff',
                          pointerEvents: 'none'
                        }}
                      ></div>
                    </div>

                    {/* Controls */}
                    <div className='mt-4'>
                      <div className='row'>
                        <div className='col-md-6'>
                          <label className='form-label fw-semibold'>Scale</label>
                          <input
                            type='range'
                            className='form-range'
                            min='0.3'
                            max='3'
                            step='0.1'
                            value={cropState.scale}
                            onChange={(e) => handleCropChange({ scale: parseFloat(e.target.value) })}
                          />
                          <div className='text-muted fs-7'>{(cropState.scale * 100).toFixed(0)}%</div>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                  <div className='modal-footer'>
                    <button type='button' className='btn btn-secondary' onClick={cancelCrop}>
                      Cancel
                    </button>
                    <button type='button' className='btn btn-primary' onClick={applyCropAndUpload}>
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
      )}
    </form>
  )
}

export default UserSettingsPage
