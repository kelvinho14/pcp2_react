import {FC, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../store'
import {createSchool} from '../../../../store/schools/schoolsSlice'
import {SchoolForm} from './SchoolForm'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {KTCard} from '../../../../_metronic/helpers'
import toast from '../../../../_metronic/helpers/toast'

const schoolCreateBreadcrumbs: Array<PageLink> = [
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
    title: 'Create School',
    path: '/admin/schools/create',
    isSeparator: false,
    isActive: true,
  },
]

const SchoolCreatePage: FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (schoolData: {
    name: string
    code: string
    address?: string
    phone?: string
    email?: string
  }) => {
    setIsSubmitting(true)
    try {
      await dispatch(createSchool(schoolData)).unwrap()
      toast.success('School created successfully!', 'Success')
      navigate('/admin/schools/list')
    } catch (error) {
      console.error('Error creating school:', error)
      toast.error('Failed to create school. Please try again.', 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageTitle breadcrumbs={schoolCreateBreadcrumbs}>Create School</PageTitle>
      <KTCard>
        <SchoolForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </KTCard>
    </>
  )
}

export default SchoolCreatePage 