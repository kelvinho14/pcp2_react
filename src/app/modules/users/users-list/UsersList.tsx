import { ListViewProvider, useListView } from './core/ListViewProvider'
import { useState, useEffect } from 'react'
import { UsersListHeader } from './components/header/UsersListHeader'
import { UsersTable } from './table/UsersTable'
import { KTCard } from '../../../../_metronic/helpers'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../../../store'
import { useAuth } from '../../auth/core/Auth'
import { ROLES } from '../../../constants/roles'
import Select from 'react-select'
import { fetchSchools, fetchSubjects } from '../../../../store/user/userSlice'

const UsersList = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [schoolFilter, setSchoolFilter] = useState<string>('')
  const [subjectFilter, setSubjectFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { currentUser } = useAuth()
  
  // Redux state
  const roles = useSelector((state: RootState) => state.users.roles)
  const schools = useSelector((state: RootState) => state.users.schools)
  const subjects = useSelector((state: RootState) => state.users.subjects)
  const schoolsLoading = useSelector((state: RootState) => state.users.schoolsLoading)
  const subjectsLoading = useSelector((state: RootState) => state.users.subjectsLoading)
  
  const isAdmin = currentUser?.role?.role_type === ROLES.ADMIN
  
  // Local state for filter selections
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedSchools, setSelectedSchools] = useState<Array<{value: string, label: string}>>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')

  // Fetch data
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchSchools())
    }
  }, [isAdmin, dispatch])

  useEffect(() => {
    if (!isAdmin && currentUser?.school_id) {
      dispatch(fetchSubjects(currentUser.school_id))
    }
  }, [isAdmin, currentUser?.school_id, dispatch])

  // Auto-apply filters when selections change
  useEffect(() => {
    setRoleFilter(selectedRole)
  }, [selectedRole])

  useEffect(() => {
    if (isAdmin) {
      const schoolIds = selectedSchools.map(school => school.value).join(',')
      setSchoolFilter(schoolIds)
    }
  }, [selectedSchools, isAdmin])

  useEffect(() => {
    if (!isAdmin) {
      setSubjectFilter(selectedSubject)
    }
  }, [selectedSubject, isAdmin])

  // Reset filters
  const resetFilters = () => {
    setSelectedRole('')
    setSelectedSchools([])
    setSelectedSubject('')
    setRoleFilter('')
    setSchoolFilter('')
    setSubjectFilter('')
  }

  return (
    <>
      {/* Welcome Banner */}
      <div className='welcome-section'>
        <div className='welcome-content'>
          <div className='welcome-text'>
            <p className='welcome-subtitle'>
              Manage user accounts, roles, and permissions across your platform
            </p>
          </div>
          <div className='welcome-actions'>
            <button 
              className='btn btn-light-primary me-3'
              onClick={() => navigate('/users/add')}
            >
              <i className='fas fa-plus me-1'></i>
              Add User
            </button>
            
            {/* Filters Toggle */}
            <div className='d-flex align-items-center gap-2'>
              <button
                type='button'
                className='btn btn-light-dark btn-sm'
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} me-2`}></i>
                Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <div className='tag-filter-section mt-3 d-flex justify-content-end'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              
              {/* Role Filter */}
              {!isAdmin && (
                <div className='d-flex align-items-center gap-2'>
                  <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Role:</label>
                  <div style={{ width: '150px' }}>
                    <select
                      className='form-select form-select-sm'
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value=''>All Roles</option>
                      {roles?.map((role: any) => (
                        <option key={role.role_type} value={role.role_type.toString()}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* School Filter (Admin only) */}
              {isAdmin && (
                <div className='d-flex align-items-center gap-2'>
                  <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Schools:</label>
                  <div style={{ width: '200px' }}>
                    <Select
                      isMulti
                      options={schools?.map((school: any) => ({
                        value: school.school_id,
                        label: `${school.name} (${school.code})`
                      }))}
                      value={selectedSchools}
                      onChange={(selectedOptions) => {
                        setSelectedSchools(selectedOptions ? [...selectedOptions] : [])
                      }}
                      placeholder='Select...'
                      isLoading={schoolsLoading}
                      isClearable
                      isSearchable
                      styles={{
                        option: (provided, state) => ({
                          ...provided,
                          color: state.isSelected ? 'white' : '#000000',
                          backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8f9fa' : 'white',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: 'white',
                        }),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Subject Filter (Non-admin only) */}
              {!isAdmin && (
                <div className='d-flex align-items-center gap-2'>
                  <label className='form-label mb-0 text-white-50' style={{ fontSize: '0.875rem' }}>Subject:</label>
                  <div style={{ width: '150px' }}>
                    <select
                      className='form-select form-select-sm'
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={subjectsLoading}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value=''>All Subjects</option>
                      {subjects?.map((subject: any) => (
                        <option key={subject.id} value={subject.subject_id}>
                          {subject.custom_name || subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* Reset Button */}
              <div className='d-flex gap-2'>
                <button
                  type='button'
                  className='btn btn-sm btn-outline-light'
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <KTCard>
        <UsersListHeader 
          setSearch={setSearch} 
          setRoleFilter={setRoleFilter}
          setSchoolFilter={setSchoolFilter}
          setSubjectFilter={setSubjectFilter}
        />
        <UsersTable 
          search={search} 
          roleFilter={roleFilter}
          schoolFilter={schoolFilter}
          subjectFilter={subjectFilter}
        />
      </KTCard>
    </>
  )
}

const UsersListWrapper = () => {
  return (
    <ListViewProvider>
      <UsersList />
    </ListViewProvider>
  )
}

export { UsersListWrapper }
