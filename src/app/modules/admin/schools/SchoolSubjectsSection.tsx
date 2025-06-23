import {FC, useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../../../store'
import {SchoolSubject, updateSubjectStatus} from '../../../../store/schools/schoolsSlice'
import {KTCardBody} from '../../../../_metronic/helpers'
import toast from '../../../../_metronic/helpers/toast'

type Props = {
  schoolId: string
}

const SchoolSubjectsSection: FC<Props> = ({schoolId}) => {
  const dispatch = useDispatch<AppDispatch>()
  const currentSchool = useSelector((state: RootState) => state.schools.currentSchool)
  const loading = useSelector((state: RootState) => state.schools.loading)
  const [updatingSubjects, setUpdatingSubjects] = useState<Set<string>>(new Set())

  const schoolSubjects = currentSchool?.subjects || []

  const getStatusBadge = (status: number | null) => {
    if (status === null) {
      return <span className='badge badge-light-secondary'>Never Used</span>
    } else if (status === 0) {
      return <span className='badge badge-warning'>Inactive</span>
    } else if (status === 1) {
      return <span className='badge badge-success'>Active</span>
    }
    return <span className='badge badge-light-secondary'>Unknown</span>
  }

  const getStatusOptions = (currentStatus: number | null) => {
    if (currentStatus === null) {
      return [
        { value: 1, label: 'Add as Active' }
      ]
    } else if (currentStatus === 0) {
      return [
        { value: 1, label: 'Change to Active' }
      ]
    } else if (currentStatus === 1) {
      return [
        { value: 0, label: 'Change to Inactive' }
      ]
    }
    return []
  }

  const handleStatusChange = async (subjectId: string, newStatus: number) => {
    setUpdatingSubjects(prev => new Set(prev).add(subjectId))
    
    try {
      await dispatch(updateSubjectStatus({
        schoolId,
        subjectId,
        status: newStatus
      })).unwrap()
      
      toast.success('Subject status updated successfully!', 'Success')
    } catch (error) {
      console.error('Error updating subject status:', error)
      toast.error('Failed to update subject status. Please try again.', 'Error')
    } finally {
      setUpdatingSubjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(subjectId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <KTCardBody className='py-4'>
        <div className='d-flex justify-content-center'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading subjects...</span>
          </div>
        </div>
      </KTCardBody>
    )
  }

  return (
    <KTCardBody className='py-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h5 className='mb-0'>School Subjects</h5>
        <div className='d-flex gap-2'>
          <span className='badge badge-light-secondary me-2'>Never Used</span>
          <span className='badge badge-warning me-2'>Inactive</span>
          <span className='badge badge-success'>Active</span>
        </div>
      </div>

      {schoolSubjects.length === 0 ? (
        <div className='text-center text-muted'>
          <p>No subjects available for this school.</p>
        </div>
      ) : (
        <div className='table-responsive'>
          <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
            <thead>
              <tr className='fw-bold text-muted'>
                <th className='min-w-150px'>Subject</th>
                <th className='min-w-100px'>Code</th>
                <th className='min-w-100px'>Status</th>
                <th className='min-w-150px'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schoolSubjects.map((subject) => {
                const statusOptions = getStatusOptions(subject.status)
                const isUpdating = updatingSubjects.has(subject.subject_id)
                
                return (
                  <tr key={subject.subject_id}>
                    <td>
                      <div className='d-flex align-items-center'>
                        <div className='d-flex justify-content-start flex-column'>
                          <span className='text-dark fw-bold text-hover-primary fs-6'>
                            {subject.name}
                          </span>
                          {subject.custom_name && (
                            <span className='text-muted fw-semibold d-block fs-7'>
                              Custom: {subject.custom_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className='text-dark fw-bold d-block fs-6'>
                        {subject.code}
                      </span>
                    </td>
                    <td>
                      {getStatusBadge(subject.status)}
                    </td>
                    <td>
                      {statusOptions.length > 0 ? (
                        <div className='d-flex gap-2'>
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              className='btn btn-sm btn-light-primary'
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(subject.subject_id, option.value)}
                            >
                              {isUpdating ? 'Updating...' : option.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className='text-muted'>No actions available</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </KTCardBody>
  )
}

export {SchoolSubjectsSection}