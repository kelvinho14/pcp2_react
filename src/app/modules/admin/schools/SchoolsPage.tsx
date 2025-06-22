import {FC} from 'react'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {SchoolsListWrapper} from './schools-list/SchoolsList'

const schoolsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Admin',
    path: '/admin',
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
    title: 'Schools',
    path: '/admin/schools/list',
    isSeparator: false,
    isActive: true,
  },
]

const SchoolsPage: FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={schoolsBreadcrumbs}>Schools</PageTitle>
      <SchoolsListWrapper />
    </>
  )
}

export default SchoolsPage 