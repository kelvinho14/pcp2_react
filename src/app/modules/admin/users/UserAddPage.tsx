import {FC, useEffect, useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchSchools} from '../../../../store/admin/adminSlice'
import {KTCard, KTCardBody} from '../../../../_metronic/helpers'
import {useNavigate} from 'react-router-dom'
import toast from '../../../../_metronic/helpers/toast'
import axios from 'axios'
import Select from 'react-select'
import {LANGUAGES, DEFAULT_LANGUAGE} from '../../../constants/languages'

const userAddSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Minimum 2 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Name is required'),
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .required('Password is required'),
  preferred_language: Yup.string()
    .required('Preferred language is required'),
  status: Yup.number()
    .required('Status is required'),
})

const UserAddPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const {schools, loading} = useSelector((state: RootState) => state.admin)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roles, setRoles] = useState<Array<{value: number, label: string}>>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [subjects, setSubjects] = useState<Array<{value: string, label: string}>>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [schoolCards, setSchoolCards] = useState<Array<{
    id: string
    school_id: string
    subjects: Array<{
      subject_id: string
      role_id: string
      status: number
    }>
  }>>([])
  const [subjectsBySchool, setSubjectsBySchool] = useState<Map<string, Array<{value: string, label: string}>>>(new Map())

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    let feedback = []
    
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[@$!%*?&]/.test(password)) score += 1
    
    let label = ''
    let color = ''
    
    if (score <= 1) {
      label = 'Very Weak'
      color = 'danger'
    } else if (score === 2) {
      label = 'Weak'
      color = 'warning'
    } else if (score === 3) {
      label = 'Fair'
      color = 'info'
    } else if (score === 4) {
      label = 'Good'
      color = 'primary'
    } else {
      label = 'Strong'
      color = 'success'
    }
    
    return { score, label, color }
  }

  // Generate random password
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '@$!%*?&'
    const allChars = lowercase + uppercase + numbers + symbols
    
    let password = ''
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Fill the rest with random characters
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    formik.setFieldValue('password', password)
  }

  useEffect(() => {
    dispatch(fetchSchools({page: 1, items_per_page: 1000}))
  }, [dispatch])

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true)
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/roles`, {
          withCredentials: true
        })
        if (response.data.status === 'success' && response.data.data) {
          const rolesData = response.data.data.map((role: any) => ({
            value: role.role_id, // Use role_id (UUID) instead of role_type
            label: role.name
          }))
          setRoles(rolesData)
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
        toast.error('Failed to load roles', 'Error')
      } finally {
        setRolesLoading(false)
      }
    }

    fetchRoles()
  }, [])

  // Fetch subjects when school changes
  const fetchSubjects = async (schoolId: string) => {
    if (!schoolId) {
      setSubjects([])
      return
    }
    
    setSubjectsLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/subjects/school-subjects/?school_id=${schoolId}&all=1`, {
        withCredentials: true
      })
      if (response.data.status === 'success' && response.data.data) {
        const subjectsData = response.data.data.map((subject: any) => ({
          value: subject.id, // Use the 'id' field from the response
          label: subject.custom_name || subject.name // Use custom_name if available, otherwise use name
        }))
        setSubjects(subjectsData)
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to load subjects for this school', 'Error')
      setSubjects([])
    } finally {
      setSubjectsLoading(false)
    }
  }

  // Fetch subjects for a specific card
  const fetchSubjectsForCard = async (schoolId: string, cardIndex: number) => {
    if (!schoolId) return
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/subjects/school-subjects/?school_id=${schoolId}&all=1`, {
        withCredentials: true
      })
      if (response.data.status === 'success' && response.data.data) {
        const subjectsData = response.data.data.map((subject: any) => ({
          value: subject.id,
          label: subject.custom_name || subject.name
        }))
        
        // Store subjects by school ID
        setSubjectsBySchool(prev => new Map(prev.set(schoolId, subjectsData)))
      }
    } catch (error) {
      console.error('Error fetching subjects for card:', error)
      toast.error('Failed to load subjects for this school', 'Error')
    }
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      preferred_language: DEFAULT_LANGUAGE,
      status: 1, // Default to active
    },
    validationSchema: userAddSchema,
    onSubmit: async (values, {setSubmitting, resetForm}) => {
      setIsSubmitting(true)
      try {
        // Transform form values to API payload format
        const payload = {
          email: values.email,
          name: values.name,
          language: values.preferred_language,
          status: values.status,
          password: values.password,
          user_subjects: schoolCards.map(card => {
            // Group subjects by role and status for this school
            const subjectsByRoleStatus = new Map<string, Array<{
              subject_id: string
              role_id: string
              status: number
            }>>()
            
            card.subjects.forEach(subject => {
              const key = `${subject.role_id}-${subject.status}`
              if (!subjectsByRoleStatus.has(key)) {
                subjectsByRoleStatus.set(key, [])
              }
              subjectsByRoleStatus.get(key)!.push(subject)
            })
            
            // Create a user_subject entry for each unique role-status combination
            return Array.from(subjectsByRoleStatus.entries()).map(([key, subjects]) => ({
              school_id: card.school_id,
              role_id: subjects[0].role_id,
              status: subjects[0].status,
              school_subject_ids: subjects.map(s => s.subject_id)
            }))
          }).flat()
        }

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/users/`, payload, {
          withCredentials: true
        })

        if (response.data.status === 'success') {
          toast.success('User created successfully!', 'Success')
          resetForm()
          navigate('/admin/users/list')
        } else {
          throw new Error(response.data.message || 'Failed to create user')
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create user'
        toast.error(errorMessage, 'Error')
      } finally {
        setIsSubmitting(false)
        setSubmitting(false)
      }
    },
  })

  const languages = LANGUAGES

  if (loading || rolesLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{minHeight: '400px'}}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <KTCard>
      <KTCardBody className='py-4'>
        <form onSubmit={formik.handleSubmit} className='form'>
          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
              Name
            </label>
            <div className='col-lg-8'>
              <input
                type='text'
                className={`form-control form-control-lg form-control-solid ${
                  formik.touched.name && formik.errors.name ? 'is-invalid' : ''
                }`}
                placeholder='Enter full name'
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <div className='invalid-feedback'>{formik.errors.name}</div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
              Email
            </label>
            <div className='col-lg-8'>
              <input
                type='email'
                className={`form-control form-control-lg form-control-solid ${
                  formik.touched.email && formik.errors.email ? 'is-invalid' : ''
                }`}
                placeholder='Enter email address'
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <div className='invalid-feedback'>{formik.errors.email}</div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
              Password
            </label>
            <div className='col-lg-8'>
              <div className='input-group'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control form-control-lg form-control-solid ${
                    formik.touched.password && formik.errors.password ? 'is-invalid' : ''
                  }`}
                  placeholder='Enter password'
                  {...formik.getFieldProps('password')}
                />
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={generatePassword}
                >
                  Generate
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className='invalid-feedback'>{formik.errors.password}</div>
              )}
              {formik.values.password && (
                <div className='mt-2'>
                  <div className='d-flex align-items-center mb-1'>
                    <span className='fw-semibold me-2'>Password Strength:</span>
                    <span className={`badge badge-${getPasswordStrength(formik.values.password).color}`}>
                      {getPasswordStrength(formik.values.password).label}
                    </span>
                  </div>
                  <div className='progress' style={{height: '12px', width: '200px'}}>
                    <div 
                      className={`progress-bar bg-${getPasswordStrength(formik.values.password).color}`}
                      style={{width: `${(getPasswordStrength(formik.values.password).score / 5) * 100}%`}}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
              Status
            </label>
            <div className='col-lg-8'>
              <select
                className={`form-select form-select-lg form-select-solid ${
                  formik.touched.status && formik.errors.status ? 'is-invalid' : ''
                }`}
                {...formik.getFieldProps('status')}
                value={formik.values.status}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  formik.setFieldValue('status', value)
                }}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {formik.touched.status && formik.errors.status && (
                <div className='invalid-feedback'>{formik.errors.status}</div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label required fw-semibold fs-6'>
              Preferred Language
            </label>
            <div className='col-lg-8'>
              <select
                className={`form-select form-select-lg form-select-solid ${
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

          {/* School Cards Section */}
          <div className='separator my-10'></div>
          
          <div className='row mb-6'>
            <div className='col-12'>
              <div className='d-flex justify-content-between align-items-center mb-5'>
                <h3 className='fw-bold mb-0'>School Enrollments</h3>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => {
                    const newCard = {
                      id: `new-${Date.now()}`,
                      school_id: '',
                      subjects: []
                    }
                    setSchoolCards([...schoolCards, newCard])
                  }}
                >
                  <i className='fas fa-plus'></i> Add School Enrollment
                </button>
              </div>
              
              <div className='row'>
                {schoolCards.map((card, index) => (
                  <div key={card.id} className='col-md-6 mb-4'>
                    <div className='card h-100'>
                      <div className='card-body'>
                        <div className='d-flex gap-2 align-items-center mb-4'>
                          <div className='flex-grow-1'>
                            <label className='form-label fw-semibold'>School</label>
                            <select
                              className='form-select form-select-solid'
                              value={card.school_id}
                              onChange={(e) => {
                                const newCards = [...schoolCards]
                                newCards[index].school_id = e.target.value
                                newCards[index].subjects = [] // Reset subjects when school changes
                                setSchoolCards(newCards)
                                if (e.target.value) {
                                  fetchSubjectsForCard(e.target.value, index)
                                }
                              }}
                            >
                              <option value=''>Select a school</option>
                              {schools
                                .filter(school => {
                                  // Show all schools if this card has no school selected
                                  if (!card.school_id) {
                                    // Filter out schools that are already selected in other cards
                                    return !schoolCards.some((otherCard, otherIndex) => 
                                      otherIndex !== index && otherCard.school_id === school.school_id
                                    )
                                  }
                                  // If this card has a school selected, show only that school
                                  return school.school_id === card.school_id
                                })
                                .map((school) => (
                                  <option key={school.school_id} value={school.school_id}>
                                    {school.name} ({school.code})
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className='pt-4 ms-auto'>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-danger'
                              onClick={() => {
                                const newCards = schoolCards.filter((_, i) => i !== index)
                                setSchoolCards(newCards)
                              }}
                              title='Remove school enrollment'
                            >
                              <i className='fas fa-trash'></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className='mb-3'>
                          <Select
                            isMulti
                            options={subjectsBySchool.get(card.school_id) || []}
                            value={(subjectsBySchool.get(card.school_id) || []).filter(subject => 
                              card.subjects.some(s => s.subject_id === subject.value)
                            )}
                            onChange={(selectedOptions) => {
                              const currentSubjects = card.subjects
                              const selectedValues = selectedOptions ? selectedOptions.map(option => {
                                // Check if this subject already exists and preserve its role/status
                                const existingSubject = currentSubjects.find(s => s.subject_id === option.value)
                                return {
                                  subject_id: option.value,
                                  role_id: existingSubject?.role_id || (roles.length > 0 ? roles[0].value.toString() : ''),
                                  status: existingSubject?.status || 1
                                }
                              }) : []
                              const newCards = [...schoolCards]
                              newCards[index].subjects = selectedValues
                              setSchoolCards(newCards)
                            }}
                            placeholder='Select subjects...'
                            className='react-select-container'
                            classNamePrefix='react-select'
                            isDisabled={!card.school_id}
                            noOptionsMessage={() => 
                              card.school_id ? 'No subjects available for this school' : 'Please select a school first'
                            }
                          />
                        </div>

                        {/* Subject details */}
                        {card.subjects.length > 0 && (
                          <div className='mb-3'>
                            <div className='border-top border-dashed pt-3 px-3 pb-2'>
                              <h6 className='text-muted mb-3'>Subject Details</h6>
                              {card.subjects.map((subject, subjectIndex) => {
                                const subjectData = (subjectsBySchool.get(card.school_id) || []).find(s => s.value === subject.subject_id)
                                return (
                                  <div key={subject.subject_id} className='mb-3'>
                                    <div className='d-flex justify-content-between align-items-center mb-2'>
                                      <div className='fw-semibold text-primary'>{subjectData?.label}</div>
                                      <button
                                        type='button'
                                        className='btn btn-sm btn-outline-danger'
                                        onClick={() => {
                                          const newCards = [...schoolCards]
                                          newCards[index].subjects = newCards[index].subjects.filter((_, i) => i !== subjectIndex)
                                          setSchoolCards(newCards)
                                        }}
                                        title='Remove subject'
                                      >
                                        <i className='fas fa-times'></i>
                                      </button>
                                    </div>
                                    <div className='row g-2'>
                                      <div className='col-md-6'>
                                        <select
                                          className='form-select form-select-sm'
                                          value={subject.role_id}
                                          onChange={(e) => {
                                            const newCards = [...schoolCards]
                                            newCards[index].subjects[subjectIndex].role_id = e.target.value
                                            setSchoolCards(newCards)
                                          }}
                                        >
                                          <option value=''>Select a role</option>
                                          {roles.map((role) => (
                                            <option key={role.value} value={role.value}>
                                              {role.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className='col-md-6'>
                                        <select
                                          className='form-select form-select-sm'
                                          value={subject.status}
                                          onChange={(e) => {
                                            const newCards = [...schoolCards]
                                            newCards[index].subjects[subjectIndex].status = parseInt(e.target.value)
                                            setSchoolCards(newCards)
                                          }}
                                        >
                                          <option value={1}>Active</option>
                                          <option value={0}>Inactive</option>
                                        </select>
                                      </div>
                                    </div>
                                    {subjectIndex < card.subjects.length - 1 && (
                                      <div className='border-bottom border-dashed mt-3'></div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='row mb-6'>
            <div className='col-12 text-center'>
              <div className='d-flex gap-3 justify-content-center'>
                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={isSubmitting || !formik.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => navigate('/admin/users/list')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </KTCardBody>
    </KTCard>
  )
}

export default UserAddPage 