
import {FC} from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {ThemeModeSwitcher,HeaderUserMenu,HeaderNotificationsMenu} from '../../../partials'
import {HeaderSchoolSubjectMenu} from '../../../partials/layout/header-menus/HeaderSchoolSubjectMenu'
import {useAuth} from '../../../../app/modules/auth'

const Topbar: FC = () => {
  const {currentUser} = useAuth()
  
  return (
  <div className='d-flex flex-shrink-0'>
    {/* begin::Invite user */}
    <div className='d-flex ms-3'>
      <a
        href='#'
        className='btn btn-flex flex-center bg-body btn-color-gray-700 btn-active-color-primary w-40px w-md-auto h-40px px-0 px-md-6'
        data-bs-toggle='modal'
        data-bs-target='#kt_modal_invite_friends'
      >
        <KTIcon iconName='plus' className='fs-2 text-primary me-0 me-md-2' />
        <span className='d-none d-md-inline'>New Member</span>
      </a>
    </div>
    {/* end::Invite user */}
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
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='Notifications'
        >
          <i className="fa-solid fa-bell fs-2"></i>
        </div>
        {/* end::Menu wrapper */}
        <HeaderNotificationsMenu backgrounUrl='media/misc/pattern-1.jpg' />
      </div>
    {/* CHAT */}
    <div className='d-flex align-items-center ms-3'>
      {/* begin::Menu wrapper */}
      <div
        className='btn btn-icon btn-primary w-40px h-40px pulse pulse-white'
        id='kt_drawer_chat_toggle'
      >
        <KTIcon iconName='message-text-2' className='fs-2' />
        <span className='pulse-ring' />
      </div>
      {/* end::Menu wrapper */}
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
