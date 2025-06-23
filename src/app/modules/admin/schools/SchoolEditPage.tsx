import {FC, useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchSchoolById, updateSchool} from '../../../../store/schools/schoolsSlice'
import {SchoolForm} from './SchoolForm'
import {SchoolSubjectsSection} from './SchoolSubjectsSection'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import toast from '../../../../_metronic/helpers/toast'

const SchoolEditPage: FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const {id} = useParams<{id: string}>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentSchool = useSelector((state: RootState) => state.schools.currentSchool)
  const loading = useSelector((state: RootState) => state.schools.loading)

  useEffect(() => {
    if (id) {
      dispatch(fetchSchoolById(id))
    }
  }, [dispatch, id])

  const handleSubmit = async (schoolData: {
    name: string
    code: string
    address?: string
    phone?: string
    email?: string
  }) => {
    if (!id) return
    
    setIsSubmitting(true)
    try {
      await dispatch(updateSchool({id, schoolData})).unwrap()
      toast.success('School updated successfully!', 'Success')
      navigate('/admin/schools/list')
    } catch (error) {
      console.error('Error updating school:', error)
      toast.error('Failed to update school. Please try again.', 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const schoolEditBreadcrumbs: Array<PageLink> = [
    {
      title: 'Admin',
      path: '/admin',
      isSeparator: false,
      isActive: false,
    },
    {
      title: 'Schools',
      path: '/admin/schools/list',
      isSeparator: false,
      isActive: false,
    },
    {
      title: '',
      path: '',
      isSeparator: true,
      isActive: false,
    },
    {
      title: 'Edit School',
      path: `/admin/schools/edit/${id}`,
      isSeparator: false,
      isActive: true,
    },
  ]

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{minHeight: '400px'}}>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    )
  }

  if (!currentSchool) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{minHeight: '400px'}}>
        <div className='text-center'>
          <h3>School not found</h3>
          <button className='btn btn-primary' onClick={() => navigate('/admin/schools/list')}>
            Back to Schools
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle breadcrumbs={schoolEditBreadcrumbs}>Edit School</PageTitle>
      <KTCard>
        <SchoolForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialValues={{
            name: currentSchool.name,
            code: currentSchool.code || '',
            address: currentSchool.address || '',
            phone: currentSchool.phone || '',
            email: currentSchool.email || '',
          }}
        />
      </KTCard>
      
      <KTCard className='mt-6'>
        <SchoolSubjectsSection schoolId={id || ''} />
      </KTCard>
    </>
  )
}

export default SchoolEditPage 