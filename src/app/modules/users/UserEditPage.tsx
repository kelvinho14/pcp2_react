import {FC, useEffect, useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../store'
import {fetchSchools} from '../../../store/admin/adminSlice'
import {fetchSubjects} from '../../../store/user/userSlice'
import {KTCard, KTCardBody} from '../../../_metronic/helpers'
import {useNavigate, useParams, useLocation} from 'react-router-dom'
import toast from '../../../_metronic/helpers/toast'
import axios from 'axios'
import Select from 'react-select'
import {LANGUAGES, DEFAULT_LANGUAGE} from '../../constants/languages'
import {useAuth} from '../auth/core/Auth'
import {getHeadersWithSchoolSubject} from '../../../_metronic/helpers/axios'

const userEditSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Minimum 2 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Name is required'),
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  preferred_language: Yup.string()
    .required('Preferred language is required'),
  status: Yup.number()
    .required('Status is required'),
})

const UserEditPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const {currentUser} = useAuth()
  const {user_id} = useParams<{user_id: string}>()
  const {schools, loading} = useSelector((state: RootState) => state.admin)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<Array<{value: string, label: string}>>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [subjects, setSubjects] = useState<Array<{value: string, label: string}>>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsBySchool, setSubjectsBySchool] = useState<Map<string, Array<{value: string, label: string}>>>(new Map())
  const [schoolCards, setSchoolCards] = useState<Array<{
    id: string
    school_id: string
    subjects: Array<{
      subject_id: string
      role_id: string
      status: number
      user_subject_id?: string // Will be undefined for new subjects
    }>
  }>>([])
  
  // Check if this is a non-admin user (accessing from /users/edit)
  const isNonAdmin = location.pathname.startsWith('/users/')



  useEffect(() => {
    // Only fetch schools for admin users
    if (!isNonAdmin) {
      dispatch(fetchSchools({page: 1, items_per_page: 1000}))
    }
  }, [dispatch, isNonAdmin])

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

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!user_id) return
      
      setIsLoading(true)
      try {
        const headers = isNonAdmin ? getHeadersWithSchoolSubject(`${import.meta.env.VITE_APP_API_URL}/users/${user_id}`) : {}
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/users/${user_id}`, {
          headers,
          withCredentials: true
        })
        
        if (response.data.status === 'success' && response.data.data) {
          const userData = response.data.data
          
          // Set form values
          formik.setValues({
            name: userData.name || '',
            email: userData.email || '',
            preferred_language: userData.language || DEFAULT_LANGUAGE,
            status: userData.status || 1,
          })
          
          // Process user subjects into school cards
          if (userData.user_subjects && userData.user_subjects.length > 0) {
            const cardsMap = new Map<string, {
              id: string
              school_id: string
              subjects: Array<{
                subject_id: string
                role_id: string
                status: number
                user_subject_id?: string
              }>
            }>()
            
            userData.user_subjects.forEach((us: any) => {
              // Group by school_id instead of school_subject_id
              if (!cardsMap.has(us.school_id)) {
                cardsMap.set(us.school_id, {
                  id: `school-${us.school_id}`,
                  school_id: us.school_id,
                  subjects: [{
                    subject_id: us.school_subject_id,
                    role_id: us.role_id,
                    status: us.status,
                    user_subject_id: us.user_subject_id // Mark as existing enrollment
                  }]
                })
              } else {
                const card = cardsMap.get(us.school_id)!
                card.subjects.push({
                  subject_id: us.school_subject_id,
                  role_id: us.role_id,
                  status: us.status,
                  user_subject_id: us.user_subject_id // Mark as existing enrollment
                })
              }
            })
            
            setSchoolCards(Array.from(cardsMap.values()))
            
            // Fetch subjects for all schools to populate the subjects dropdowns
            const cards = Array.from(cardsMap.values())
            for (let i = 0; i < cards.length; i++) {
              const card = cards[i]
              if (card.school_id) {
                await fetchSubjectsForCard(card.school_id, i)
              }
            }
          }
          

        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Failed to load user data', 'Error')
        navigate('/admin/users/list')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [user_id])



  // Fetch subjects when school changes
  const fetchSubjectsForSchool = async (schoolId: string) => {
    if (!schoolId) {
      setSubjects([])
      return
    }
    
    setSubjectsLoading(true)
    try {
      const result = await dispatch(fetchSubjects(schoolId)).unwrap()
      const subjectsData = result.map((subject: any) => ({
        value: subject.id, // Use the 'id' field from the response
        label: subject.custom_name || subject.name // Use custom_name if available, otherwise use name
      }))
      setSubjects(subjectsData)
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
      const result = await dispatch(fetchSubjects(schoolId)).unwrap()
      const subjectsData = result.map((subject: any) => ({
        value: subject.id,
        label: subject.custom_name || subject.name
      }))
      
      // Store subjects by school ID
      setSubjectsBySchool(prev => new Map(prev.set(schoolId, subjectsData)))
    } catch (error) {
      console.error('Error fetching subjects for card:', error)
      toast.error('Failed to load subjects for this school', 'Error')
    }
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      preferred_language: DEFAULT_LANGUAGE,
      status: 1, // Default to active
    },
    validationSchema: userEditSchema,
    onSubmit: async (values, {setSubmitting, resetForm}) => {
      setIsSubmitting(true)
      try {
        // Transform form values to API payload format
        const payload = {
          email: values.email,
          name: values.name,
          language: values.preferred_language,
          status: values.status,
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

        const headers = isNonAdmin ? getHeadersWithSchoolSubject(`${import.meta.env.VITE_APP_API_URL}/users/${user_id}`) : {}
        const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/users/${user_id}`, payload, {
          headers,
          withCredentials: true
        })

        if (response.data.status === 'success') {
          toast.success('User updated successfully!', 'Success')
          navigate(isNonAdmin ? '/users/list' : '/admin/users/list')
        } else {
          throw new Error(response.data.message || 'Failed to update user')
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update user'
        toast.error(errorMessage, 'Error')
      } finally {
        setIsSubmitting(false)
        setSubmitting(false)
      }
    },
  })

  const languages = LANGUAGES

  if ((!isNonAdmin && loading) || rolesLoading || isLoading) {
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
                {!isNonAdmin && (
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
                )}
              </div>
              
              <div className='row'>
                {schoolCards.map((card, index) => (
                  <div key={card.id} className={isNonAdmin ? 'col-12 mb-4' : 'col-md-6 mb-4'}>
                    <div className='card h-100'>
                      <div className='card-body'>
                        <div className='d-flex gap-2 align-items-center mb-4'>
                          <div className='flex-grow-1'>
                            {!isNonAdmin && (
                              <>
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
                              </>
                            )}
                          </div>
                          {!isNonAdmin && (
                            <div className='pt-4 ms-auto'>
                              {/* Only show delete button if no existing subjects in this card */}
                              {!card.subjects.some(subject => subject.user_subject_id) && (
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
                              )}
                            </div>
                          )}
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
                                    role_id: existingSubject?.role_id || (roles.length > 0 ? roles[0].value : ''),
                                    status: existingSubject?.status || 1,
                                    user_subject_id: existingSubject?.user_subject_id // Preserve user_subject_id if it exists
                                  }
                                }) : []
                                
                                // Prevent removal of existing subjects - keep them if they were removed from selection
                                const existingSubjects = currentSubjects.filter(s => s.user_subject_id)
                                const finalSubjects = [...existingSubjects, ...selectedValues.filter(s => !s.user_subject_id)]
                                
                                // Check if any existing subjects were attempted to be removed
                                const attemptedRemovals = existingSubjects.filter(existing => 
                                  !selectedValues.some(selected => selected.subject_id === existing.subject_id)
                                )
                                
                                if (attemptedRemovals.length > 0) {
                                  toast.warning(
                                    'Existing enrollments cannot be removed. You can only modify their role and status.',
                                    'Cannot Remove Enrollment'
                                  )
                                }
                                
                                const newCards = [...schoolCards]
                                newCards[index].subjects = finalSubjects
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
                                      {/* Only show delete button for new subjects (not saved in DB) */}
                                      {!subject.user_subject_id ? (
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
                                      ) : (
                                        <button
                                          type='button'
                                          className='btn btn-sm btn-outline-secondary'
                                          onClick={() => {
                                            toast.warning(
                                              'Existing enrollments cannot be deleted. You can only modify their role and status.',
                                              'Cannot Delete Enrollment'
                                            )
                                          }}
                                          title='Cannot delete existing enrollment'
                                        >
                                          <i className='fas fa-lock'></i>
                                        </button>
                                      )}
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
                      Updating...
                    </>
                  ) : (
                    'Update User'
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

export default UserEditPage 