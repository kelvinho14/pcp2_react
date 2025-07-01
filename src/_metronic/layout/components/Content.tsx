import {FC, useEffect} from 'react'
import {useLocation} from 'react-router'
import clsx from 'clsx'
import {useLayout} from '../core'
import {DrawerComponent} from '../../assets/ts/components'
import {WithChildren} from '../../helpers'
import {useIsDesktop} from '../../hooks/useResponsive'

const Content: FC<WithChildren> = ({children}) => {
  const {classes} = useLayout()
  const location = useLocation()
  const isDesktop = useIsDesktop()
  
  useEffect(() => {
    // Only hide drawers on desktop, not on mobile to prevent closing the aside drawer
    if (isDesktop) {
      DrawerComponent.hideAll()
    }
  }, [location, isDesktop])

  // Handle window resize to ensure proper drawer behavior
  useEffect(() => {
    // If switching to desktop, hide all drawers
    if (isDesktop) {
      DrawerComponent.hideAll()
    }
  }, [isDesktop])

  return (
    <div id='kt_content_container' className={clsx(classes.contentContainer.join(' '))}>
      {children}
    </div>
  )
}

export {Content}
