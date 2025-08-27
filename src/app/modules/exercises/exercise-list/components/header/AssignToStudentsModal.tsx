import {FC, useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {DatePicker} from '../../../../../../_metronic/helpers/components/DatePicker'
import {AppDispatch, RootState} from '../../../../../../store'
import {assignExercisesToStudents, Exercise} from '../../../../../../store/exercises/exercisesSlice'
import {fetchGroups} from '../../../../../../store/groups/groupsSlice'
import {toast} from '../../../../../../_metronic/helpers/toast'
import {StudentSelectionTable} from './StudentSelectionTable'
import Select from 'react-select'

type Props = {
  show: boolean
  onHide: () => void
  exerciseIds: string[]
}

const AssignToStudentsModal: FC<Props> = ({show, onHide, exerciseIds}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [messageToStudent, setMessageToStudent] = useState<string>('')
  const isAssigning = useSelector((state: RootState) => state.exercises.assigning)
  
  // Get exercises data to check question count
  const exercises = useSelector((state: RootState) => state.exercises.exercises)
  const selectedExercises = exercises.filter((exercise: Exercise) => exerciseIds.includes(exercise.exercise_id))
  
  // Get groups data
  const { groups, loading: groupsLoading } = useSelector((state: RootState) => state.groups)
  
  // Check if any selected exercises have no questions
  const exercisesWithoutQuestions = selectedExercises.filter((exercise: Exercise) => exercise.question_count === 0)
  const hasExercisesWithoutQuestions = exercisesWithoutQuestions.length > 0

  console.log('🔍 AssignToStudentsModal - show:', show, 'exerciseIds:', exerciseIds)

  // Fetch groups when modal opens
  useEffect(() => {
    if (show) {
      dispatch(fetchGroups({ page: 1, items_per_page: 1000 }))
    }
  }, [show, dispatch])

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleGroupChange = (selectedOptions: any) => {
    const groupIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : []
    setSelectedGroups(groupIds)
  }

  const handleSubmit = async () => {
    if (selectedStudents.length === 0 && selectedGroups.length === 0) {
      toast.warning('Please select at least one group or student', 'Warning')
      return
    }

    // Check if any exercises have no questions
    if (hasExercisesWithoutQuestions) {
      const exerciseNames = exercisesWithoutQuestions.map(ex => ex.title).join(', ')
      toast.error(`Cannot assign exercises without questions: ${exerciseNames}`, 'Error')
      return
    }

    try {
      // Prepare exercises data for API
      const exercisesData = exerciseIds.map(exerciseId => ({
        exercise_id: exerciseId,
        due_date: dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59).toISOString() : undefined,
        message_for_student: messageToStudent.trim() || undefined,
      }))

      console.log('Assigning exercises:', exercisesData, 'to students:', selectedStudents, 'to groups:', selectedGroups, 'due date:', dueDate)
      console.log(dueDate);
      
      await dispatch(assignExercisesToStudents({
        studentIds: selectedStudents,
        groupIds: selectedGroups,
        exercises: exercisesData
      })).unwrap()
      
      onHide()
      setSelectedStudents([])
      setSelectedGroups([])
      setDueDate(null)
      setMessageToStudent('')
    } catch (error) {
      console.error('Error assigning exercises to students:', error)
      // Error handling is done in the thunk
    }
  }

  const handleClose = () => {
    setSelectedStudents([])
    setSelectedGroups([])
    setDueDate(null)
    setMessageToStudent('')
    onHide()
  }

  if (!show) return null

  return (
    <>
      <div className={`modal fade show`} 
           style={{display: 'block', zIndex: 1050}}
           tabIndex={-1}
           role="dialog">
        <div className="modal-dialog modal-xl" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Assign Exercises to Students</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className='mb-4'>
                <h6>Selected Exercises: {exerciseIds.length}</h6>
                <p className='text-muted'>Choose at least one group or student to assign these exercises to:</p>
                
                {/* Warning for exercises without questions */}
                {hasExercisesWithoutQuestions && (
                  <div className='alert alert-warning mt-3'>
                    <i className='fas fa-exclamation-triangle me-2'></i>
                    <strong>Warning:</strong> The following exercises have no questions and cannot be assigned:
                    <ul className='mb-0 mt-2'>
                      {exercisesWithoutQuestions.map((exercise: Exercise) => (
                        <li key={exercise.exercise_id}>{exercise.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* User Groups Selection */}
              <div className='mb-4'>
                <label className='form-label fw-bold'>Select Groups</label>
                <div className="mb-3">
                  <Select
                    options={groups.map((group) => ({
                      value: group.group_id,
                      label: `${group.name} (${group.member_count || 0} students)`,
                      data: group,
                      isDisabled: !group.member_count || group.member_count === 0
                    }))}
                    isMulti
                    onChange={handleGroupChange}
                    placeholder="Select groups..."
                    isLoading={groupsLoading}
                    isClearable
                    isSearchable
                    isDisabled={isAssigning}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    noOptionsMessage={() => {
                      if (groupsLoading) {
                        return "Loading groups..."
                      }
                      if (groups.length === 0) {
                        return "No groups available"
                      }
                      return "No groups found"
                    }}
                  />
                </div>
                <div className='form-text text-muted'>
                  <i className='fas fa-info-circle me-1'></i>
                  Selecting groups will assign exercises to all students in those groups. Groups with 0 students are disabled.
                </div>
              </div>

              <div className='mb-4'>
                <label className='form-label fw-bold'>Select Students</label>
                <StudentSelectionTable 
                  exerciseIds={exerciseIds} // Pass all exercise IDs
                  search="" 
                  selectedUsers={selectedStudents}
                  onUserSelectionChange={handleStudentToggle}
                />
              </div>

              <div className='mb-4'>
                <label className='form-label fw-bold'>Due Date (Optional)</label>
                <DatePicker
                  selected={dueDate}
                  onChange={(date: Date | null) => setDueDate(date)}
                  placeholderText="Select due date"
                  minDate={new Date()}
                  isClearable={true}
                  dayClassName={(date) => 
                    date.getTime() === dueDate?.getTime() ? 'bg-primary text-white' : ''
                  }
                />
              </div>
              <div className='mb-4'>
                <label className='form-label fw-bold'>Message to Students (Optional)</label>
                <textarea
                  className="form-control form-control-solid"
                  rows={3}
                  placeholder="Enter a message to include with the exercise assignment..."
                  value={messageToStudent}
                  onChange={(e) => setMessageToStudent(e.target.value)}
                  style={{
                    backgroundColor: '#f5f8fa',
                    borderColor: '#e1e3ea',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isAssigning || (selectedStudents.length === 0 && selectedGroups.length === 0) || hasExercisesWithoutQuestions}
              >
                {isAssigning ? 'Assigning...' : `Assign to ${selectedStudents.length + selectedGroups.length} Selection(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{zIndex: 1040}}></div>
    </>
  )
}

export {AssignToStudentsModal} 