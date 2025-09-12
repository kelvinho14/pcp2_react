import {KTCard} from '../../../../_metronic/helpers'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {NotificationsTable} from './table/NotificationsTable'

const notificationsListBreadcrumbs: Array<PageLink> = [
  {
    title: 'Home',
    path: '/dashboard',
    isSeparator: false,
    isActive: false,
  },
  {
    title: 'Notifications',
    path: '/notifications',
    isSeparator: false,
    isActive: true,
  }
]

const NotificationsList = () => {
  return (
    <>
      <PageTitle breadcrumbs={notificationsListBreadcrumbs}>
        Notifications
      </PageTitle>
      
      <KTCard>
        <NotificationsTable />
      </KTCard>
    </>
  )
}

export {NotificationsList}
export default NotificationsList
