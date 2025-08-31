import { PageLink, PageTitle } from '../../../../_metronic/layout/core'
import { MigrationsListWrapper } from './migrations-list/MigrationsList'

const migrationsBreadcrumbs: Array<PageLink> = [
  {
    title: 'Admin',
    path: '/admin',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Migrations',
    path: '/admin/migrations',
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

const MigrationsPage = () => {
  return (
    <>
      <PageTitle breadcrumbs={migrationsBreadcrumbs}>Migrations History</PageTitle>
      <MigrationsListWrapper />
    </>
  )
}

export default MigrationsPage

