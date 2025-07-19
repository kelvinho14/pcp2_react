import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../core/Auth'
import { School } from '../core/_models'
import SchoolSelectionService, { StoredSchoolSelection } from '../services/SchoolSelectionService'

const SubjectSelectionPage: React.FC = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // If no user or admin, redirect to dashboard
  if (!currentUser) {
    navigate('/auth/login')
    return null
  }

  if (currentUser.role?.role_type === 1) {
    navigate('/dashboard')
    return null
  }

  // If no schools data, redirect to dashboard
  if (!currentUser.schools || currentUser.schools.length === 0) {
    navigate('/dashboard')
    return null
  }

  const handleSubjectSelection = (schoolId: string, schoolName: string, subjectId: string, subjectName: string) => {
    const selection: StoredSchoolSelection = {
      school_id: schoolId,
      school_name: schoolName,
      subject_id: subjectId,
      subject_name: subjectName
    }

    SchoolSelectionService.storeSelection(selection)
    navigate('/dashboard')
  }

  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-column-fluid">
        <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
          <div className="w-100 w-lg-800px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
            
            {/* Header */}
            <div className="text-center mb-10">
              <div className="d-flex align-items-center justify-content-center mb-6">
                <div className="symbol symbol-60px me-4">
                  <span className="symbol-label bg-light-primary">
                    <i className="fa-solid fa-school fs-1 text-primary"></i>
                  </span>
                </div>
                <div>
                  <h1 className="text-dark mb-2 fw-bold">Select Your School & Subject</h1>
                  <div className="text-muted fw-semibold fs-6">
                    Choose the school and subject you want to work with
                  </div>
                </div>
              </div>
            </div>

            {/* Schools and Subjects */}
            <div className="row g-6">
              {currentUser.schools.map((school) => (
                <div key={school.school_id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <div className="symbol symbol-40px me-3">
                          <span className="symbol-label bg-primary">
                            <i className="fa-solid fa-building fs-4 text-white"></i>
                          </span>
                        </div>
                        <h3 className="card-title text-dark fw-bold mb-0">
                          {school.school_name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="row g-4">
                        {school.school_subjects?.map((subject) => (
                          <div key={subject.subject_id} className="col-12 col-md-6 col-lg-4">
                            <div 
                              className="card card-hover cursor-pointer h-100 border-2 border-light hover-border-primary transition-all"
                              onClick={() => handleSubjectSelection(
                                school.school_id, 
                                school.school_name, 
                                subject.subject_id, 
                                subject.subject_name
                              )}
                            >
                              <div className="card-body text-center p-6 d-flex flex-column justify-content-center">
                                <div className="symbol symbol-50px mb-4 mx-auto">
                                  <div className="symbol-label bg-light-success">
                                    <i className="fa-solid fa-book-open fs-2x text-success"></i>
                                  </div>
                                </div>
                                <h4 className="text-dark fw-bold mb-2">{subject.subject_name}</h4>
                                <div className="text-muted fs-7 mb-3">{school.school_name}</div>
                                <div className="d-flex align-items-center justify-content-center">
                                  <span className="text-primary fs-7 fw-semibold">
                                    Click to Select
                                  </span>
                                  <i className="fa-solid fa-arrow-right text-primary ms-2 fs-8"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-10">
              <div className="text-muted fs-7">
                <i className="fa-solid fa-info-circle me-2"></i>
                You can change this selection later from your profile settings
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectSelectionPage 