import {FC, useEffect} from 'react'
import {useAuth} from '../../../../app/modules/auth/core/Auth'
import {useNavigate, useLocation} from 'react-router-dom'
import SchoolSelectionService from '../../../../app/modules/auth/services/SchoolSelectionService'

const HeaderSchoolSubjectMenu: FC = () => {
  const {currentUser} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get current selection from session storage
  const currentSelection = SchoolSelectionService.getStoredSelection()
  const currentSchoolId = currentSelection?.school_id
  const currentSchoolName = currentSelection?.school_name
  const currentSubjectId = currentSelection?.subject_id
  const currentSubjectName = currentSelection?.subject_name

  // Direct event listener to bypass Bootstrap's menu interference
  useEffect(() => {
    const handleSubjectClick = (e: Event) => {
      const target = e.target as HTMLElement
      const subjectDiv = target.closest('[data-subject-id]')
      
      if (subjectDiv) {
        const schoolId = subjectDiv.getAttribute('data-school-id')!
        const schoolName = subjectDiv.getAttribute('data-school-name')!
        const subjectId = subjectDiv.getAttribute('data-subject-id')!
        const subjectName = subjectDiv.getAttribute('data-subject-name')!
        
        // Update session storage using service
        const selection = {
          school_id: schoolId,
          school_name: schoolName,
          subject_id: subjectId,
          subject_name: subjectName
        }
        SchoolSelectionService.storeSelection(selection)
        
        // Navigate or refresh based on current location
        if (location.pathname === '/dashboard') {
          window.location.reload()
        } else {
          navigate('/dashboard')
        }
      }
    }

    // Add event listeners with capture to bypass Bootstrap interference
    document.addEventListener('mousedown', handleSubjectClick, true)
    document.addEventListener('click', handleSubjectClick, true)
    
    return () => {
      document.removeEventListener('mousedown', handleSubjectClick, true)
      document.removeEventListener('click', handleSubjectClick, true)
    }
  }, [navigate, location.pathname])

  // Only show for non-admin users who have schools data
  if (!currentUser?.schools || currentUser.role?.role_type === 1) {
    return null
  }

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-300px'
      data-kt-menu='true'
    >
      {/* Header Section */}
      <div className='menu-item px-3'>
        <div className='menu-content px-3'>
          <div className='text-gray-900 fw-bolder fs-5 mb-1'>School & Subject</div>
          
        </div>
      </div>

      <div className='separator my-2'></div>

      {/* Content Section */}
      <div className='scroll-y mh-300px'>
        {currentUser.schools.map((school) => (
          <div key={school.school_id}>
            {/* School Header */}
            <div className='menu-item px-3'>
              <div className='menu-content px-3 py-2'>
                <span className='menu-section text-muted text-uppercase fs-8 ls-1 fw-bolder'>
                  <i className='fa-solid fa-building fs-4 me-2'></i>{school.school_name}
                </span>
              </div>
            </div>
            
            {/* School Subjects */}
            {school.school_subjects.map((subject) => {
              const isSelected = currentSchoolId === school.school_id && currentSubjectId === subject.subject_id
              
              return (
                <div key={subject.subject_id} className='menu-item px-3'>
                  <div
                    className={`menu-link px-3 py-3 cursor-pointer ${
                      isSelected ? 'active' : ''
                    }`}
                    data-school-id={school.school_id}
                    data-school-name={school.school_name}
                    data-subject-id={subject.subject_id}
                    data-subject-name={subject.subject_name}
                  >
                    <div className='d-flex align-items-center'>
                      <div className='symbol symbol-30px me-3'>
                        <span className={`symbol-label ${
                          isSelected ? 'bg-primary' : 'bg-light-gray-300'
                        }`}>
                          <i className={`fa-solid fa-book fs-3 ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`}></i>
                        </span>
                      </div>

                      <div className='flex-grow-1 me-3'>
                        <div className={`fw-bold ${
                          isSelected ? 'text-primary' : 'text-gray-800'
                        }`}>
                          {subject.subject_name}
                        </div>
                      </div>

                      {isSelected && (
                        <i className='fa-solid fa-check text-primary fs-6 ms-2'></i>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export {HeaderSchoolSubjectMenu} 