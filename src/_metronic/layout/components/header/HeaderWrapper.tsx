
import clsx from 'clsx'
import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {useLayout} from '../../core'
import {DrawerComponent} from '../../../assets/ts/components'
import {DefaultTitle} from './page-title/DefaultTitle'
import {Topbar} from './Topbar'
import {useIsMobile} from '../../../hooks/useResponsive'

export function HeaderWrapper() {
  const {config, classes, attributes} = useLayout()
  const {header} = config
  const [offset, setOffset] = useState<string>(`{default: '200px', lg: '300px'}`)
  const isMobile = useIsMobile()
  
  // Ensure drawer is properly initialized for mobile
  useEffect(() => {
    const initializeDrawer = () => {
      const aside = document.getElementById('kt_aside')
      if (aside && isMobile) {
        DrawerComponent.createInstances('[data-kt-drawer="true"]')
      }
    }
    
    // Initialize on mount
    initializeDrawer()
  }, [isMobile])
  useEffect(() => {
    let newString = `{default: '200px', lg: '300px'}`
    if (header.fixed.desktop) {
      if (!header.fixed.tabletAndMobile) {
        newString = `{lg: '300px'}`
      }
    } else {
      newString = `{default: '200px', lg: false}`
    }

    setOffset(newString)
  }, [header.fixed])

  return (
    <div
      id='kt_header'
      className={clsx('header', classes.header.join(' '))}
      {...attributes.headerMenu}
      data-kt-sticky='true'
      data-kt-sticky-name='header'
      data-kt-sticky-offset={offset}
    >
      {/* begin::Container */}
      <div
        className={clsx(
          classes.headerContainer.join(' '),
          'd-flex align-items-center justify-content-between'
        )}
        id='kt_header_container'
      >
        <DefaultTitle />
        {/* begin::Wrapper */}
        <div className={'d-flex d-lg-none align-items-center ms-n2 me-2'}>
          {/* begin::Aside mobile toggle */}
          <div 
            className='btn btn-icon btn-active-icon-primary aside-toggle' 
            id='kt_aside_toggle_mobile'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              
              // Ensure drawer is properly initialized
              const aside = document.getElementById('kt_aside')
              if (aside) {
                const drawer = DrawerComponent.getInstance('kt_aside')
                if (drawer) {
                  // Only toggle if not already shown, otherwise keep it open
                  if (!drawer.isShown()) {
                    drawer.show()
                  }
                } else {
                  // If drawer instance doesn't exist, reinitialize
                  DrawerComponent.createInstances('[data-kt-drawer="true"]')
                  const newDrawer = DrawerComponent.getInstance('kt_aside')
                  if (newDrawer) {
                    newDrawer.show()
                  }
                }
              }
            }}
          >
            <KTIcon iconName='abstract-14' className='fs-1' />
          </div>

          {/* begin::Logo */}
          <Link to='/dashboard' className='d-flex align-items-center'>
            <img alt='Logo' src={toAbsoluteUrl('media/logos/logo.png')} className='h-50px' />
          </Link>
          {/* end::Logo */}
        </div>
        {/* end::Wrapper */}
        <Topbar />
      </div>
      {/* end::Container */}
    </div>
  )
}
