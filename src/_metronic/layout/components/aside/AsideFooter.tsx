import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {HeaderNotificationsMenu, HeaderUserMenu, QuickLinks} from '../../../partials'

const AsideFooter = () => {
  return (
    <div
      className='aside-footer d-flex flex-column align-items-center flex-column-auto'
      id='kt_aside_footer'
    >
      {/* begin::Quick links */}
      <div className='d-flex align-items-center mb-2'>
        {/* begin::Menu wrapper */}
        <div
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='Quick links'
        >
          <KTIcon iconName='element-plus' className='fs-2 text-lg-1' />
        </div>
        {/* end::Menu wrapper */}
        <QuickLinks backgroundUrl='media/misc/pattern-1.jpg' />
      </div>
      {/* end::Quick links */}

      {/* begin::Activities */}
      <div className='d-flex align-items-center mb-3'>
        {/* begin::Drawer toggle */}
        <div
          className='btn btn-icon btn-active-color-primary btn-color-gray-500 btn-active-light'
          data-kt-menu-trigger='click'
          data-kt-menu-overflow='true'
          data-kt-menu-placement='top-start'
          data-bs-toggle='tooltip'
          data-bs-placement='right'
          data-bs-dismiss='click'
          title='Activity Logs'
          id='kt_activities_toggle'
        >
          <KTIcon iconName='chart-simple' className='fs-2 text-lg-1' />
        </div>
        {/* end::drawer toggle */}
      </div>
      {/* end::Activities */}

      
      
    
      
    </div>
  )
}

export {AsideFooter}
