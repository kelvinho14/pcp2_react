import React, {useEffect} from 'react'
import {Modal} from 'react-bootstrap'
import './SubjectSelectionModal.css'

interface School {
  school_id: string
  school_name: string
  school_subjects: Array<{
    subject_id: string
    subject_name: string
  }>
}

interface SubjectSelectionModalProps {
  show: boolean
  schools: School[]
  onSubjectSelect: (schoolId: string, schoolName: string, subjectId: string, subjectName: string) => void
}

const SubjectSelectionModal: React.FC<SubjectSelectionModalProps> = ({
  show,
  schools,
  onSubjectSelect,
}) => {
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null)
  const [selectedSubject, setSelectedSubject] = React.useState<any>(null)

  const handleSubjectClick = (school: School, subject: any) => {
    onSubjectSelect(school.school_id, school.school_name, subject.subject_id, subject.subject_name)
  }

  // Add direct event listeners to bypass Bootstrap's modal interference
  useEffect(() => {
    if (!show) return

    const handleDirectClick = (e: Event) => {
      const target = e.target as HTMLElement
      const subjectDiv = target.closest('[data-subject-id]')
      if (subjectDiv) {
        const schoolId = subjectDiv.getAttribute('data-school-id')!
        const schoolName = subjectDiv.getAttribute('data-school-name')!
        const subjectId = subjectDiv.getAttribute('data-subject-id')!
        const subjectName = subjectDiv.getAttribute('data-subject-name')!
        
        console.log('🔍 Modal - Direct click handler triggered:', {
          schoolId, schoolName, subjectId, subjectName
        })
        
        onSubjectSelect(schoolId, schoolName, subjectId, subjectName)
      }
    }

    // Add event listeners with capture to bypass Bootstrap interference
    document.addEventListener('mousedown', handleDirectClick, true)
    document.addEventListener('click', handleDirectClick, true)
    
    return () => {
      document.removeEventListener('mousedown', handleDirectClick, true)
      document.removeEventListener('click', handleDirectClick, true)
    }
  }, [show, onSubjectSelect])

  return (
    <Modal 
      show={show} 
      backdrop="static" 
      keyboard={false} 
      size="lg" 
      centered
      dialogClassName="modal-dialog-centered subject-selection-modal"
    >
      <Modal.Header>
        <Modal.Title className="fw-bold">Select School & Subject</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {/* Header Section */}
        <div className="d-flex flex-column bgi-no-repeat rounded-top p-8">
          <div className="d-flex align-items-center mb-6">
            <div className="symbol symbol-50px me-4">
              <span className="symbol-label bg-light-primary">
                <i className="fa-solid fa-school fs-1 text-primary"></i>
              </span>
            </div>
            <div className="mb-0">
              <div className="fs-4 fw-bolder text-gray-800">Welcome!</div>
              <div className="text-gray-600 fs-6">
                Please select your school and subject to continue
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="scroll-y mh-400px px-8 pb-8">
          {schools.map((school) => (
            <div key={school.school_id} className="mb-6">
              <h6 className="text-gray-800 fw-bold mb-3">{school.school_name}</h6>
              
              {school.school_subjects.map((subject) => (
                <div
                  key={subject.subject_id}
                  className="d-flex flex-stack cursor-pointer rounded subject-item"
                  data-school-id={school.school_id}
                  data-school-name={school.school_name}
                  data-subject-id={subject.subject_id}
                  data-subject-name={subject.subject_name}
                >
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-35px me-4">
                      <span className="symbol-label bg-light-gray-300">
                        <i className="fa-solid fa-book fs-2 text-gray-600"></i>
                      </span>
                    </div>

                    <div className="mb-0 me-2">
                      <div className="fs-6 fw-bolder text-gray-800">
                        {subject.subject_name}
                      </div>
                      
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-arrow-right text-gray-400"></i>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SubjectSelectionModal 