import {FC, useEffect, useState, useCallback} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../store'
import {KTCard, KTCardBody} from '../../../_metronic/helpers'
import {useNavigate, useParams} from 'react-router-dom'
import toast from '../../../_metronic/helpers/toast'
import axios from 'axios'
import Select from 'react-select'
import {useAuth} from '../auth/core/Auth'
import {getSchoolSubjectId, getHeadersWithSchoolSubject} from '../../../_metronic/helpers/axios'
import {fetchUsers} from '../../../store/user/userSlice'
import {createGroup, updateGroup, fetchGroupById} from '../../../store/groups/groupsSlice'
import {ROLES} from '../../constants/roles'
import clsx from 'clsx'

const groupAddSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, 'Minimum 1 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Group name is required'),
  description: Yup.string()
    .max(200, 'Maximum 200 symbols'),
  student_ids: Yup.array()
    .of(Yup.string()),
})

interface Student {
  user_id: string
  name: string
  email: string
}

interface GroupFormValues {
  name: string
  description: string
  student_ids: string[]
}

const GroupAddPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const {group_id} = useParams<{group_id: string}>()
  const {currentUser} = useAuth()
  // Remove local isSubmitting state since we're using Redux
  const [selectedStudents, setSelectedStudents] = useState<Array<{value: string, label: string}>>([])
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Get students from Redux state
  const students = useSelector((state: RootState) => state.users.users)
  const studentsLoading = useSelector((state: RootState) => state.users.loading)
  
  // Get groups state from Redux
  const { creating, updating, error } = useSelector((state: RootState) => state.groups)

  // Check if this is edit mode
  useEffect(() => {
    if (group_id) {
      setIsEditMode(true)
      // Only fetch group data if students are already loaded
      if (students.length > 0) {
        fetchGroupData()
      }
    }
  }, [group_id, students])

  // Fetch students for the current school
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      // Use fetchUsers with student role_type and all=1 parameter
      await dispatch(fetchUsers({
        role_type: ROLES.STUDENT.toString(),
        all: 1
      }))
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students', 'Error')
    }
  }



  const formik = useFormik<GroupFormValues>({
    initialValues: {
      name: '',
      description: '',
      student_ids: []
    },
    validationSchema: groupAddSchema,
    onSubmit: async (values) => {
      try {
        const groupData = {
          name: values.name,
          description: values.description,
          user_ids: values.student_ids
        }

        if (isEditMode && group_id) {
          await dispatch(updateGroup({ ...groupData, group_id })).unwrap()
          toast.success('Group updated successfully', 'Success')
        } else {
          await dispatch(createGroup(groupData)).unwrap()
          toast.success('Group created successfully', 'Success')
        }
        
        navigate('/groups/list')
      } catch (error: any) {
        console.error('Error saving group:', error)
        const errorMessage = error.message || 'Failed to save group'
        toast.error(errorMessage, 'Error')
      }
    }
  })

  const fetchGroupData = useCallback(async () => {
    if (!group_id) return
    
    try {
      const result = await dispatch(fetchGroupById(group_id)).unwrap()
      if (result) {
        // Handle both old format (students array) and new format (member_user_ids)
        let studentIds: string[] = []
        let selectedStudentsData: Array<{value: string, label: string}> = []
        
        if (result.member_user_ids && Array.isArray(result.member_user_ids)) {
          // New format: member_user_ids array
          studentIds = result.member_user_ids
          // Find the corresponding student names from the students list
          selectedStudentsData = students
            .filter(student => studentIds.includes(student.user_id))
            .map(student => ({
              value: student.user_id,
              label: student.name
            }))
        } else if (result.students && Array.isArray(result.students)) {
          // Old format: students array
          studentIds = result.students.map((student: any) => student.user_id)
          selectedStudentsData = result.students.map((student: any) => ({
            value: student.user_id,
            label: student.name
          }))
        }
        
        // Update form values
        formik.setValues({
          name: result.name,
          description: result.description || '',
          student_ids: studentIds
        })
        
        // Set selected students for the select component
        setSelectedStudents(selectedStudentsData)
      }
    } catch (error) {
      console.error('Error fetching group data:', error)
      toast.error('Failed to load group data', 'Error')
    }
  }, [group_id, dispatch, students, formik])

  const handleStudentChange = (selectedOptions: any) => {
    setSelectedStudents(selectedOptions || [])
    const studentIds = selectedOptions?.map((option: any) => option.value) || []
    formik.setFieldValue('student_ids', studentIds)
  }

  const studentOptions = students.map(student => ({
    value: student.user_id,
    label: `${student.name} (${student.email})`
  }))



  return (
    <KTCard>
      <KTCardBody className='py-4'>
        <form onSubmit={formik.handleSubmit} className='form'>
          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Group Name</label>
            <div className='col-lg-8'>
              <input
                type='text'
                className={clsx(
                  'form-control form-control-solid',
                  {'is-invalid': formik.touched.name && formik.errors.name}
                )}
                placeholder='Enter group name'
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <div className='fv-plugins-message-container invalid-feedback'>
                  <span role='alert'>{formik.errors.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>Description</label>
            <div className='col-lg-8'>
              <textarea
                className='form-control form-control-solid'
                rows={3}
                placeholder='Enter group description (optional)'
                {...formik.getFieldProps('description')}
              />
              {formik.touched.description && formik.errors.description && (
                <div className='fv-plugins-message-container invalid-feedback'>
                  <span role='alert'>{formik.errors.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>Select Students (Optional)</label>
            <div className='col-lg-8'>
              <Select
                isMulti
                isLoading={studentsLoading}
                options={studentOptions}
                value={selectedStudents}
                onChange={handleStudentChange}
                placeholder='Select students to add to the group (optional)'
                className={clsx(
                  {'is-invalid': formik.touched.student_ids && formik.errors.student_ids}
                )}
              />
              {formik.touched.student_ids && formik.errors.student_ids && (
                <div className='fv-plugins-message-container invalid-feedback'>
                  <span role='alert'>{formik.errors.student_ids}</span>
                </div>
              )}
              {studentsLoading && (
                <div className='text-muted fs-7 mt-1'>Loading students...</div>
              )}
            </div>
          </div>

          <div className='card-footer d-flex justify-content-end py-6 px-9'>
            <button
              type='button'
              className='btn btn-light btn-active-light-primary me-2'
              onClick={() => navigate('/groups/list')}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={creating || updating}
            >
              {creating || updating ? (
                <>
                  <span className='indicator-progress' style={{display: 'inline-block'}}>
                    Please wait...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                </>
              ) : (
                <>{isEditMode ? 'Update Group' : 'Create Group'}</>
              )}
            </button>
          </div>
        </form>
      </KTCardBody>
    </KTCard>
  )
}

export default GroupAddPage 