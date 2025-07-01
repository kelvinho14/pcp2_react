import {useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {AsideDefault} from './components/aside/AsideDefault'
import {Footer} from './components/Footer'
import {HeaderWrapper} from './components/header/HeaderWrapper'
import {RightToolbar} from '../partials/layout/RightToolbar'
import {ScrollTop} from './components/ScrollTop'
import {Content} from './components/Content'
import {PageDataProvider} from './core'
import {ActivityDrawer, DrawerMessenger, InviteUsers, UpgradePlan} from '../partials'
import {MenuComponent} from '../assets/ts/components'
import {useIsDesktop} from '../hooks/useResponsive'

const MasterLayout = () => {
  const location = useLocation()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization()
    }, 500)
  }, [location.key])

  const handleWrapperClick = () => {
    // Only handle this on desktop to avoid interfering with mobile touch events
    if (isDesktop) {
      console.log('handleWrapperClick - desktop only')
      // Close the aside secondary panel if it's currently open
      // The aside secondary panel is controlled by data-kt-aside-minimize attribute
      // When data-kt-aside-minimize is "on", the secondary panel is hidden
      // When data-kt-aside-minimize is not set, the secondary panel is visible
      if (!document.body.getAttribute('data-kt-aside-minimize')) {
        // Secondary panel is visible, so we need to minimize it
        const toggleButton = document.getElementById('kt_aside_toggle_desktop')
        if (toggleButton) {
          toggleButton.click()
        }
      }
    }
  }

  return (
    <PageDataProvider>
      <div className='d-flex flex-column flex-root'>
        {/* begin::Page */}
        <div className='page d-flex flex-row flex-column-fluid'>
          <AsideDefault />
          {/* begin::Wrapper */}
                      <div className='wrapper d-flex flex-column flex-row-fluid' id='kt_wrapper' onMouseOver={handleWrapperClick}>
            <HeaderWrapper />

            {/* begin::Content */}
            <div id='kt_content' className='content d-flex flex-column flex-column-fluid'>
              <Content>
                <Outlet />
              </Content>
            </div>
            {/* end::Content */}
            <Footer />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Page */}
      </div>

      {/* begin:: Drawers */}
      <ActivityDrawer />
      <RightToolbar />
      <DrawerMessenger />
      {/* end:: Drawers */}

      {/* begin:: Modals */}
      <InviteUsers />
      <UpgradePlan />
      {/* end:: Modals */}
      <ScrollTop />
    </PageDataProvider>
  )
}

export {MasterLayout}
