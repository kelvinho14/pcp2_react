
import {FC, useEffect, useRef} from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {ThemeModeSwitcher,HeaderUserMenu,HeaderNotificationsMenu} from '../../../partials'
import {HeaderSchoolSubjectMenu} from '../../../partials/layout/header-menus/HeaderSchoolSubjectMenu'
import {useAuth} from '../../../../app/modules/auth'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../store'
import {fetchNotifications, markAllNotificationsAsRead} from '../../../../store/notifications/notificationsSlice'

const Topbar: FC = () => {
  const {currentUser} = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const {notifications} = useSelector((state: RootState) => state.notifications)
  const hasInitializedRef = useRef(false)

  // Fetch notifications when component mounts (only once)
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      dispatch(fetchNotifications({ page: 1, limit: 10 }))
    }
  }, [dispatch])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Handle bell icon click to mark all notifications as read
  const handleBellClick = () => {
    if (unreadCount > 0) {
      dispatch(markAllNotificationsAsRead()).then(() => {
        // Refresh notifications to show updated read status
        dispatch(fetchNotifications({ page: 1, limit: 10 }))
      })
    }
  }
/*
 <div className='d-flex align-items-center ms-3'>
 <div
   className='btn btn-icon btn-primary w-40px h-40px pulse pulse-white'
   id='kt_drawer_chat_toggle'
 >
   <KTIcon iconName='message-text-2' className='fs-2' />
   <span className='pulse-ring' />
 </div>
</div>
*/
  return (
  <div className='d-flex flex-shrink-0'>
    {/* begin::Theme mode */}
    <div className='d-flex align-items-center  ms-3'>
      <ThemeModeSwitcher toggleBtnClass=' flex-center bg-body btn-color-gray-600 btn-active-color-primary h-40px' />
    </div>
    {/* end::Theme mode */}
    
    {/* begin::School Subject Menu - Only for non-admin users */}
    {currentUser?.schools && currentUser.role?.role_type !== 1 && (
      <div className='d-flex align-items-center ms-3'>
        <div
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='School & Subject'
        >
          <i className="fa-solid fa-school fs-2"></i>
        </div>
        <HeaderSchoolSubjectMenu />
      </div>
    )}
    {/* end::School Subject Menu */}
    
    <div className='d-flex align-items-center ms-3'>
        {/* begin::Menu wrapper */}
        <div
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light position-relative'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='Notifications'
          onClick={handleBellClick}
        >
          <i className="fa-solid fa-bell fs-2"></i>
          {unreadCount > 0 && (
            <span className='position-absolute top-0 start-100 translate-middle badge badge-danger badge-circle badge-sm' style={{transform: 'translate(-80px, -20px)'}}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {/* end::Menu wrapper */}
        <HeaderNotificationsMenu backgrounUrl='media/misc/pattern-1.jpg' />
      </div>
    <div className='d-flex align-items-center ms-3' id='kt_header_user_menu_toggle'>
        {/* begin::Menu wrapper */}
        <div
          className='cursor-pointer symbol symbol-40px'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='false'
          data-kt-menu-placement='top-start'
          title='User profile'
        >
          <img src={toAbsoluteUrl('media/avatars/300-1.jpg')} alt='avatar' />
        </div>
        {/* end::Menu wrapper */}
        <HeaderUserMenu />
    </div>
  </div>
)
}

export {Topbar}
