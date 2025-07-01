import {FC} from 'react'
import clsx from 'clsx'
import {Link, useNavigate} from 'react-router-dom'
import {useLocation} from 'react-router'
import {checkIsActive, KTIcon, WithChildren} from '../../../helpers'
import {useLayout} from '../../core'
import {DrawerComponent} from '../../../assets/ts/components'
import {useIsDesktop} from '../../../hooks/useResponsive'



type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  textAlign?: 'start' | 'end'
}

const AsideMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
  textAlign = 'start',
}) => {
  const {pathname} = useLocation()
  const navigate = useNavigate()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {aside} = config
  const isDesktop = useIsDesktop()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isDesktop) {
      // Desktop: Toggle the aside
      const toggleButton = document.getElementById('kt_aside_toggle_desktop')
      if (toggleButton) {
        toggleButton.click()
      }
      // Navigate immediately on desktop
      navigate(to)
    } else {
      // Mobile: Close the drawer when clicking sub-menu items
      const aside = document.getElementById('kt_aside')
      if (aside) {
        const drawer = DrawerComponent.getInstance('kt_aside')
        if (drawer && drawer.isShown()) {
          drawer.hide()
        }
      }
      // Navigate after a longer delay to ensure drawer closes first
      setTimeout(() => {
        navigate(to)
      }, 100)
    }
  }

  return (
    <div className='menu-item'>
      <Link
        className={clsx('menu-link without-sub d-flex', {active: isActive})}
        to={to}
        onClick={handleClick}
        style={textAlign === 'end' ? {justifyContent: 'flex-end', width: '100%'} : {}}
      >
        <div className='d-flex align-items-center'>
          {hasBullet && (
            <span className='menu-bullet'>
              <span className='bullet bullet-dot'></span>
            </span>
          )}
          {icon && aside.menuIcon === 'svg' && (
            <span className='menu-icon'>
              <KTIcon iconName={icon} className='fs-2' />
            </span>
          )}
          {fontIcon && aside.menuIcon === 'font' && <i className={clsx('fs-3 me-2', fontIcon)}></i>}
          <span className='menu-title'>{title}</span>
        </div>
      </Link>
      {children}
    </div>
  )
}

export {AsideMenuItem}
