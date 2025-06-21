import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {SubjectsListWrapper} from './subjects-list/SubjectsList'

const subjectsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Admin',
    path: '/admin',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Subjects',
    path: '/admin/subjects/list',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const SubjectsPage = () => {
  return (
    <>
      <PageTitle breadcrumbs={subjectsBreadcrumbs}>Subjects List</PageTitle>
      <SubjectsListWrapper />
    </>
  )
}

export default SubjectsPage 