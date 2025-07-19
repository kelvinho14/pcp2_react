import React from 'react'
import { useNavigate } from 'react-router-dom'
import { School, SchoolSubject } from '../core/_models'

interface SubjectSelectionProps {
  schools: School[]
  onSubjectSelect: (schoolId: string, schoolName: string, subjectId: string, subjectName: string) => void
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ schools, onSubjectSelect }) => {
  const navigate = useNavigate()

  const handleSubjectClick = (schoolId: string, schoolName: string, subjectId: string, subjectName: string) => {
    onSubjectSelect(schoolId, schoolName, subjectId, subjectName)
    navigate('/dashboard')
  }

  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-column-fluid">
        <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
          <div className="w-100 w-lg-400px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-dark mb-3">Select Your Subject</h1>
              <div className="text-muted fw-semibold fs-6">
                Choose the subject you want to work with
              </div>
            </div>

            <div className="space-y-6">
              {schools.map((school) => (
                <div key={school.school_id} className="card shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title text-dark fw-bold">{school.school_name}</h3>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      {school.school_subjects.map((subject) => (
                        <div key={subject.subject_id} className="col-12 col-md-6">
                          <div 
                            className="card card-hover cursor-pointer h-100"
                            onClick={() => handleSubjectClick(
                              school.school_id, 
                              school.school_name, 
                              subject.subject_id, 
                              subject.subject_name
                            )}
                          >
                            <div className="card-body text-center p-6">
                              <div className="symbol symbol-50px mb-4">
                                <div className="symbol-label bg-light-primary">
                                  <i className="ki-duotone ki-book fs-2x text-primary">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                </div>
                              </div>
                              <h4 className="text-dark fw-bold mb-2">{subject.subject_name}</h4>
                              <div className="text-muted fs-7">{school.school_name}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectSelection 