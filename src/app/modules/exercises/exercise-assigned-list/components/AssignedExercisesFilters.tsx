import {FC, useState, useEffect, useRef, memo, useCallback, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {DatePicker} from '../../../../../_metronic/helpers/components/DatePicker'
import Select from 'react-select'
import {AppDispatch, RootState} from '../../../../../store'
import {setFilters, clearFilters, type AssignedExercisesFilters, toggleFiltersCollapsed, setLoadingFilters} from '../../../../../store/exercises/assignedExercisesSlice'
import {getHeadersWithSchoolSubject} from '../../../../../_metronic/helpers/axios'
import {ROLES} from '../../../../../app/constants/roles'
import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Module-level flag to prevent multiple fetches across component instances
let globalStudentsFetched = false

interface Student {
  user_id: string
  name: string
  email: string
  status: number
  user_subjects: any[]
}

interface StudentOption {
  value: string
  label: string
}

const AssignedExercisesFilters: FC = memo(() => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  // Only select the filters, not the entire state to prevent unnecessary re-renders
  const filters = useSelector((state: RootState) => state.assignedExercises.filters)
  const isCollapsed = useSelector((state: RootState) => state.assignedExercises.filtersCollapsed)

  // Custom styles for react-select
  const selectStyles = useMemo(() => ({
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: '#f5f8fa',
      borderColor: state.isFocused ? '#3699ff' : '#e1e3ea',
      borderRadius: '6px',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(54, 153, 255, 0.25)' : 'none',
      '&:hover': {
        borderColor: '#b5b5c3'
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3699ff' : state.isFocused ? '#e1f0ff' : 'white',
      color: state.isSelected ? 'white' : '#181c32',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3699ff' : '#e1f0ff'
      }
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#e1f0ff',
      borderRadius: '4px'
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#3699ff',
      fontWeight: '500'
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#3699ff',
      '&:hover': {
        backgroundColor: '#3699ff',
        color: 'white'
      }
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6c7293'
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#181c32'
    })
  }), [])

  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [students, setStudents] = useState<StudentOption[]>([])
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fetchInProgressRef = useRef(false)
  const studentsFetchedRef = useRef(false)

  // Fetch students on component mount
  useEffect(() => {
    if (globalStudentsFetched || fetchInProgressRef.current) return
    
    const fetchStudents = async () => {
      console.log('🔍 Fetching students...')
      fetchInProgressRef.current = true
      setLoadingStudents(true)
      try {
        const headers = getHeadersWithSchoolSubject(`${API_URL}/users`)
        console.log('🔍 Making API call to:', `${API_URL}/users/?all=1&role_type=${ROLES.STUDENT}`)
        console.log('🔍 Headers:', headers)
        console.log('🔍 Current user role:', sessionStorage.getItem('user_role'))
        
        const response = await axios.get(`${API_URL}/users/?all=1&role_type=${ROLES.STUDENT}`, {
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        })

        if (response.data.status === 'success') {
          const studentOptions: StudentOption[] = response.data.data.map((student: Student) => ({
            value: student.user_id,
            label: `${student.name} (${student.email})`
          }))
          setStudents(studentOptions)
          globalStudentsFetched = true
          console.log('✅ Students fetched successfully:', studentOptions.length)
        }
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoadingStudents(false)
        fetchInProgressRef.current = false
      }
    }

    fetchStudents()
  }, [])

  // Update selected students when student_ids filter changes
  useEffect(() => {
    if (filters.student_ids) {
      const selectedIds = filters.student_ids.split(',')
      const selected = students.filter(student => selectedIds.includes(student.value))
      setSelectedStudents(selected)
    } else {
      setSelectedStudents([])
    }
  }, [filters.student_ids, students])

  const handleClearFilters = useCallback(() => {
    // Clear search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    dispatchRef.current(clearFilters())
    setSearchValue('')
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for search - only update Redux when user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      dispatchRef.current(setFilters({ search: value }))
    }, 500)
  }, [])

  const handleDateChange = useCallback((field: keyof AssignedExercisesFilters, date: Date | null) => {
    let dateString = ''
    if (date) {
      // For "to" dates, set time to 23:59:59 to include the entire day
      if (field === 'due_to' || field === 'assigned_to') {
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
        dateString = localDate.toISOString()
      } else {
        // For "from" dates, set time to 00:00:00 (midnight)
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        dateString = localDate.toISOString()
      }
    }
    
    dispatchRef.current(setFilters({ [field]: dateString }))
  }, [])

  const handleInputChange = useCallback((field: keyof AssignedExercisesFilters, value: string) => {
    dispatchRef.current(setFilters({ [field]: value }))
  }, [])

  const handleSelectChange = useCallback((field: keyof AssignedExercisesFilters, value: string) => {
    dispatchRef.current(setFilters({ [field]: value }))
  }, [])

  const handleStudentChange = useCallback((selectedOptions: readonly StudentOption[] | null) => {
    const selected = selectedOptions || []
    setSelectedStudents([...selected])
    
    const studentIds = selected.map(option => option.value).join(',')
    dispatchRef.current(setFilters({ student_ids: studentIds }))
  }, [])

  return (
    <div className='card mb-8'>
      <div className='card-header'>
        <div className='d-flex align-items-center justify-content-between w-100'>
          <h3 className='card-title'>Filters</h3>
          <div className='card-toolbar'>
            <button 
              className='btn btn-sm btn-light-primary'
              onClick={() => dispatchRef.current(toggleFiltersCollapsed())}
            >
              <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'} me-1`}></i>
              {isCollapsed ? 'Show Filters' : 'Hide Filters'}
            </button>
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className='card-body'>
          <div className='row g-6'>
          {/* Search */}
          <div className='col-md-6'>
            <label className='form-label fw-bold'>Search</label>
            <div className='position-relative'>
              <i className='fas fa-search position-absolute top-50 translate-middle-y ms-3 text-muted'></i>
              <input
                type='text'
                className='form-control form-control-solid ps-10'
                placeholder='Search exercises by title or description...'
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Student Selection */}
          <div className='col-md-6'>
            <label className='form-label fw-bold'>Students</label>
            <Select
              isMulti
              isLoading={loadingStudents}
              options={students}
              value={selectedStudents}
              onChange={handleStudentChange}
              placeholder="Select students..."
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable={true}
              isSearchable={true}
              noOptionsMessage={() => "No students found"}
              loadingMessage={() => "Loading students..."}
              styles={selectStyles}
            />
            <div className='form-text'>Leave empty for all students</div>
          </div>

          {/* Due Date Range */}
          <div className='col-md-6'>
            <label className='form-label fw-bold'>Due Date Range</label>
            <div className='row g-3'>
              <div className='col-6'>
                <DatePicker
                  selected={filters.due_from ? new Date(filters.due_from) : null}
                  onChange={(date) => handleDateChange('due_from', date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="From date"
                  isClearable={true}
                  className="form-control form-control-solid"
                  wrapperClassName="w-100"
                />
              </div>
              <div className='col-6'>
                <DatePicker
                  selected={filters.due_to ? new Date(filters.due_to) : null}
                  onChange={(date) => handleDateChange('due_to', date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="To date"
                  isClearable={true}
                  className="form-control form-control-solid"
                  wrapperClassName="w-100"
                />
              </div>
            </div>
          </div>

          {/* Assigned Date Range */}
          <div className='col-md-6'>
            <label className='form-label fw-bold'>Assigned Date Range</label>
            <div className='row g-3'>
              <div className='col-6'>
                <DatePicker
                  selected={filters.assigned_from ? new Date(filters.assigned_from) : null}
                  onChange={(date) => handleDateChange('assigned_from', date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="From date"
                  isClearable={true}
                  className="form-control form-control-solid"
                  wrapperClassName="w-100"
                />
              </div>
              <div className='col-6'>
                <DatePicker
                  selected={filters.assigned_to ? new Date(filters.assigned_to) : null}
                  onChange={(date) => handleDateChange('assigned_to', date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="To date"
                  isClearable={true}
                  className="form-control form-control-solid"
                  wrapperClassName="w-100"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className='col-md-6'>
            <label className='form-label fw-bold'>Sort By</label>
            <select
              className='form-select form-select-solid'
              value={filters.order_by || 'due_date'}
              onChange={(e) => handleSelectChange('order_by', e.target.value)}
            >
              <option value='due_date'>Due Date</option>
              <option value='assigned_date'>Assigned Date</option>
              <option value='title'>Title</option>
              <option value='progress'>Progress</option>
            </select>
          </div>

          <div className='col-md-6'>
            <label className='form-label fw-bold'>Sort Order</label>
            <select
              className='form-select form-select-solid'
              value={filters.order || 'asc'}
              onChange={(e) => handleSelectChange('order', e.target.value)}
            >
              <option value='asc'>Ascending</option>
              <option value='desc'>Descending</option>
            </select>
          </div>
        </div>
        
        {/* Clear All button at the bottom */}
        <div className='d-flex justify-content-end mt-6'>
          <button 
            className='btn btn-light-secondary btn-sm'
            onClick={handleClearFilters}
          >
            <i className='fas fa-times me-1'></i>
            Clear All Filters
          </button>
        </div>
      </div>
      )}
    </div>
  )
})

export {AssignedExercisesFilters}
export default memo(AssignedExercisesFilters) 