import {useEffect, useState, useMemo} from 'react'
import {MenuComponent} from '../../../../../../_metronic/assets/ts/components'
import {KTIcon} from '../../../../../../_metronic/helpers'
import {useSelector} from 'react-redux'
import {RootState} from '../../../../../../store'
import {useAuth} from '../../../../auth/core/Auth'
import {ROLES} from '../../../../../constants/roles'
import axios from 'axios'
import Select from 'react-select'
import {getSchoolSubjectId} from '../../../../../../_metronic/helpers/axios'

type Props = {
  setRoleFilter: (role: string) => void
  setSchoolFilter?: (school: string) => void
  setSubjectFilter?: (subject: string) => void
}

const UsersListFilter = ({ setRoleFilter, setSchoolFilter, setSubjectFilter }: Props) => {
  const { currentUser } = useAuth()
  const isLoading = useSelector((state: RootState) => state.users.loading)
  const roles = useSelector((state: RootState) => state.users.roles)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedSchools, setSelectedSchools] = useState<Array<{value: string, label: string}>>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [schools, setSchools] = useState<Array<{school_id: string, name: string, code: string}>>([])
  const [subjects, setSubjects] = useState<Array<{id: string, subject_id: string, name: string, custom_name: string | null}>>([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const isAdmin = currentUser?.role?.role_type === ROLES.ADMIN

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  // Fetch schools for admin users
  useEffect(() => {
    if (isAdmin) {
      const fetchSchools = async () => {
        setSchoolsLoading(true)
        try {
          const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/schools`, {
            withCredentials: true
          })
          if (response.data.status === 'success' && response.data.data) {
            setSchools(response.data.data)
          }
        } catch (error) {
          console.error('Error fetching schools:', error)
        } finally {
          setSchoolsLoading(false)
        }
      }
      fetchSchools()
    }
  }, [isAdmin])

  // Fetch subjects for non-admin users
  useEffect(() => {
    if (!isAdmin && currentUser?.school_id) {
      const fetchSubjects = async () => {
        setSubjectsLoading(true)
        try {
          const schoolSubjectId = getSchoolSubjectId()
          console.log('🔍 school_subject_id from sessionStorage:', schoolSubjectId)
          console.log('🔍 currentUser.school_id:', currentUser.school_id)
          
          if (!schoolSubjectId) {
            console.error('No school_subject_id found in sessionStorage')
            return
          }
          
          const headers = {
            'X-School-Subject-ID': schoolSubjectId
          }
          
          console.log('🔍 === SUBJECTS API CALL DEBUG ===')
          console.log('🔍 URL:', `${import.meta.env.VITE_APP_API_URL}/subjects/school-subjects/?school_id=${currentUser.school_id}&all=1`)
          console.log('🔍 Headers being sent:', headers)
          console.log('🔍 Headers JSON:', JSON.stringify(headers, null, 2))
          console.log('🔍 Header keys:', Object.keys(headers))
          console.log('🔍 X-School-Subject-ID value:', headers['X-School-Subject-ID'])
          console.log('🔍 ================================')
          
          const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/subjects/school-subjects/?school_id=${currentUser.school_id}&all=1`, {
            headers,
            withCredentials: true
          })
          if (response.data.status === 'success' && response.data.data) {
            setSubjects(response.data.data)
          }
        } catch (error: any) {
          console.error('Error fetching subjects:', error)
          console.error('Error response:', error.response?.data)
          console.error('Error status:', error.response?.status)
        } finally {
          setSubjectsLoading(false)
        }
      }
      fetchSubjects()
    }
  }, [isAdmin, currentUser?.school_id])

  // Use roles from API response
  const availableRoles = useMemo(() => {
    console.log('🔍 UsersListFilter - roles from store:', roles)
    if (!roles || !Array.isArray(roles)) {
      console.log('🔍 UsersListFilter - no roles available')
      return []
    }
    
    const mappedRoles = roles.map(role => [role.role_type, role.name]).sort((a, b) => a[0] - b[0])
    console.log('🔍 UsersListFilter - mapped roles:', mappedRoles)
    return mappedRoles
  }, [roles])

  const resetData = () => {
    setSelectedRole('')
    setSelectedSchools([])
    setSelectedSubject('')
    setRoleFilter('')
    if (setSchoolFilter) {
      setSchoolFilter('')
    }
    if (setSubjectFilter) {
      setSubjectFilter('')
    }
  }

  const filterData = () => {
    setRoleFilter(selectedRole)
    if (setSchoolFilter) {
      const schoolIds = selectedSchools.map(school => school.value).join(',')
      setSchoolFilter(schoolIds)
    }
    if (setSubjectFilter) {
      setSubjectFilter(selectedSubject)
    }
  }

  return (
    <>
      {/* begin::Filter Button */}
      <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-3'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        <KTIcon iconName='filter' className='fs-2' />
        Filter
      </button>
      {/* end::Filter Button */}
      {/* begin::SubMenu */}
      <div className='menu menu-sub menu-sub-dropdown w-300px w-md-325px' data-kt-menu='true'>
        {/* begin::Header */}
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>Filter Options</div>
        </div>
        {/* end::Header */}

        {/* begin::Separator */}
        <div className='separator border-gray-200'></div>
        {/* end::Separator */}

        {/* begin::Content */}
        <div className='px-7 py-5' data-kt-user-table-filter='form'>
          {/* begin::Input group */}
          {!isAdmin ? (
            <>
              <div className='mb-10'>
                <label className='form-label fs-6 fw-bold'>Role:</label>
                <select
                  className='form-select form-select-solid fw-bolder'
                  data-kt-select2='true'
                  data-placeholder='Select option'
                  data-allow-clear='true'
                  data-kt-user-table-filter='role'
                  data-hide-search='true'
                  onChange={(e) => setSelectedRole(e.target.value)}
                  value={selectedRole}
                >
                  <option value=''>All Roles</option>
                  {availableRoles.map(([roleType, roleName]) => (
                    <option key={roleType} value={roleType.toString()}>
                      {roleName}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-10'>
                <label className='form-label fs-6 fw-bold'>Subject:</label>
                <select
                  className='form-select form-select-solid fw-bolder'
                  data-kt-select2='true'
                  data-placeholder='Select option'
                  data-allow-clear='true'
                  data-kt-user-table-filter='subject'
                  data-hide-search='true'
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  value={selectedSubject}
                  disabled={subjectsLoading}
                >
                  <option value=''>All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.subject_id}>
                      {subject.custom_name || subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className='mb-10'>
              <label className='form-label fs-6 fw-bold'>School:</label>
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  isMulti
                  options={schools.map(school => ({
                    value: school.school_id,
                    label: `${school.name} (${school.code})`
                  }))}
                  value={selectedSchools}
                  onChange={(selectedOptions) => {
                    setSelectedSchools(selectedOptions ? [...selectedOptions] : [])
                  }}
                  placeholder='Select schools...'
                  className='react-select-container'
                  classNamePrefix='react-select'
                  isDisabled={schoolsLoading}
                  noOptionsMessage={() => 'No schools available'}
                />
              </div>
            </div>
          )}
          {/* end::Input group */}

          {/* begin::Actions */}
          <div className='d-flex justify-content-end'>
            <button
              type='button'
              disabled={isLoading}
              onClick={resetData}
              className='btn btn-light btn-active-light-primary fw-bold me-2 px-6'
              data-kt-menu-dismiss='true'
              data-kt-user-table-filter='reset'
            >
              Reset
            </button>
            <button
              disabled={isLoading}
              type='button'
              onClick={filterData}
              className='btn btn-primary fw-bold px-6'
              data-kt-menu-dismiss='true'
              data-kt-user-table-filter='filter'
            >
              Apply
            </button>
          </div>
          {/* end::Actions */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::SubMenu */}
    </>
  )
}

export {UsersListFilter}
