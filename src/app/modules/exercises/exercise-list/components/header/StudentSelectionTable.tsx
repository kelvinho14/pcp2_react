import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Select from 'react-select'
import { fetchUsers } from '../../../../../../store/user/userSlice'
import { RootState, AppDispatch } from '../../../../../../store'
import { User } from '../../../../users/users-list/core/_models'
import { KTCardBody } from '../../../../../../_metronic/helpers'
import { ROLES } from '../../../../../constants/roles'

type Props = {
  exerciseIds: string[]
  search: string
  selectedUsers: string[]
  onUserSelectionChange: (userId: string) => void
}

const StudentSelectionTable = ({ exerciseIds, search, selectedUsers, onUserSelectionChange }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  
  const users = useSelector((state: RootState) => state.users.users)
  const isLoading = useSelector((state: RootState) => state.users.loading)

  // Fetch students on component mount and when search changes
  useEffect(() => {
    console.log('🔍 StudentSelectionTable - Fetching students with role type:', ROLES.STUDENT)
    dispatchRef.current(
      fetchUsers({
        page: 1,
        items_per_page: 100, // Get more students for dropdown
        search: search || undefined,
        role_type: ROLES.STUDENT.toString(), // Students only
      })
    )
  }, [search])

  // Transform users data for react-select
  const options = useMemo(() => {
    if (!Array.isArray(users)) return []
    
    return users.map(user => ({
      value: String(user.user_id || ''),
      label: user.name,
      user: user,
      isDisabled: false // All students are selectable since we're not checking assignment status
    }))
  }, [users])

  // Get selected options
  const selectedOptions = useMemo(() => {
    return options.filter(option => selectedUsers.includes(option.value))
  }, [options, selectedUsers])

  const handleSelectionChange = (selectedOptions: any) => {
    if (!selectedOptions) {
      // Clear all selections
      selectedUsers.forEach((userId: string) => {
        onUserSelectionChange(userId)
      })
      return
    }
    
    const selectedIds = selectedOptions.map((option: any) => option.value)
    
    // Add new selections
    selectedIds.forEach((userId: string) => {
      if (!selectedUsers.includes(userId)) {
        onUserSelectionChange(userId)
      }
    })
    
    // Handle deselection
    selectedUsers.forEach((userId: string) => {
      if (!selectedIds.includes(userId)) {
        onUserSelectionChange(userId)
      }
    })
  }

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '45px',
      border: '1px solid #e1e3ea',
      borderRadius: '6px',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#f1f3f4',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3699ff' : state.isFocused ? '#f8f9fa' : 'white',
      color: state.isSelected ? 'white' : state.isDisabled ? '#a1a5b7' : '#3f4254',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      opacity: state.isDisabled ? 0.6 : 1,
    }),
  }

  return (
    <>
      
        
        <Select
          isMulti
          options={options}
          value={selectedOptions}
          onChange={handleSelectionChange}
          isLoading={isLoading}
          placeholder="Search and select students..."
          noOptionsMessage={() => "No students available"}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      
      
      {isLoading && (
        <div className='d-flex justify-content-center'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      )}
    </>
  )
}

export { StudentSelectionTable } 