export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface ToastOptions {
  title?: string
  message: string
  type?: ToastType
  duration?: number
  position?: ToastPosition
  closable?: boolean
  autoClose?: boolean
}

export interface ToastConfig {
  defaultDuration: number
  defaultPosition: ToastPosition
  maxToasts: number
  animationDuration: number
}

class ToastManager {
  private container: HTMLDivElement | null = null
  private config: ToastConfig
  private activeToasts: Set<HTMLDivElement> = new Set()

  constructor(config: Partial<ToastConfig> = {}) {
    this.config = {
      defaultDuration: 5000,
      defaultPosition: 'top-right',
      maxToasts: 5,
      animationDuration: 300,
      ...config
    }
  }

  private createContainer(position: ToastPosition) {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'kt-toast-container'
      
      const positionStyles = this.getPositionStyles(position)
      this.container.style.cssText = `
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        ${positionStyles}
      `
      document.body.appendChild(this.container)
    }
  }

  private getPositionStyles(position: ToastPosition): string {
    switch (position) {
      case 'top-right':
        return 'top: 20px; right: 20px;'
      case 'top-left':
        return 'top: 20px; left: 20px;'
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;'
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;'
      case 'top-center':
        return 'top: 20px; left: 50%; transform: translateX(-50%);'
      case 'bottom-center':
        return 'bottom: 20px; left: 50%; transform: translateX(-50%);'
      default:
        return 'top: 20px; right: 20px;'
    }
  }

  private getToastVariant(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'success'
      case 'error':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'info'
    }
  }

  private getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'check-circle'
      case 'error':
        return 'cross-circle'
      case 'warning':
        return 'shield-tick'
      case 'info':
        return 'information-5'
      default:
        return 'information-5'
    }
  }

  private createToastElement(options: ToastOptions): HTMLDivElement {
    const { 
      title, 
      message, 
      type = 'info', 
      closable = true 
    } = options
    
    const toastElement = document.createElement('div')
    toastElement.className = `toast mb-3 border-0 shadow-sm`
    toastElement.style.cssText = `
      min-width: 350px;
      pointer-events: auto;
      display: block;
      opacity: 0;
      transform: translateX(100%);
      transition: all ${this.config.animationDuration}ms ease;
    `

    const variant = this.getToastVariant(type)
    const icon = this.getIcon(type)
    const displayTitle = title || type.charAt(0).toUpperCase() + type.slice(1)

    const closeButton = closable 
      ? '<button type="button" class="btn-close btn-close-white" aria-label="Close"></button>'
      : ''

    toastElement.innerHTML = `
      <div class="toast-header bg-${variant} text-white border-0" style="padding: 0.75rem 1.25rem; font-size: 1.1rem;">
        <i class="ki ki-${icon} fs-2 text-white me-2"></i>
        <strong class="me-auto" style="font-size: 1.1rem; font-weight: 600;">${displayTitle}</strong>
        ${closeButton}
      </div>
      <div class="toast-body bg-body" style="padding: 1.25rem; font-size: 1.1rem; line-height: 1.5;">
        ${message}
      </div>
    `

    // Add close functionality if closable
    if (closable) {
      const closeBtn = toastElement.querySelector('.btn-close')
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.removeToast(toastElement)
        })
      }
    }

    return toastElement
  }

  private removeToast(toastElement: HTMLDivElement) {
    this.activeToasts.delete(toastElement)
    
    toastElement.style.opacity = '0'
    toastElement.style.transform = 'translateX(100%)'
    toastElement.style.transition = `all ${this.config.animationDuration}ms ease`
    
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement)
      }
    }, this.config.animationDuration)
  }

  private enforceMaxToasts() {
    if (this.activeToasts.size >= this.config.maxToasts) {
      const oldestToast = this.activeToasts.values().next().value
      if (oldestToast) {
        this.removeToast(oldestToast)
      }
    }
  }

  show(options: ToastOptions) {
    const {
      duration = this.config.defaultDuration,
      position = this.config.defaultPosition,
      autoClose = true
    } = options

    this.createContainer(position)
    this.enforceMaxToasts()
    
    const toastElement = this.createToastElement(options)
    this.activeToasts.add(toastElement)
    
    // Add to container
    if (this.container) {
      this.container.appendChild(toastElement)
    }

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toastElement.style.opacity = '1'
      toastElement.style.transform = 'translateX(0)'
    })

    // Auto-remove after duration
    if (autoClose && duration > 0) {
      setTimeout(() => {
        this.removeToast(toastElement)
      }, duration)
    }
  }

  success(message: string, title?: string, options?: Partial<ToastOptions>) {
    this.show({ message, title, type: 'success', ...options })
  }

  error(message: string, title?: string, options?: Partial<ToastOptions>) {
    this.show({ message, title, type: 'error', ...options })
  }

  warning(message: string, title?: string, options?: Partial<ToastOptions>) {
    this.show({ message, title, type: 'warning', ...options })
  }

  info(message: string, title?: string, options?: Partial<ToastOptions>) {
    this.show({ message, title, type: 'info', ...options })
  }

  clear() {
    this.activeToasts.forEach(toast => this.removeToast(toast))
    this.activeToasts.clear()
  }

  // Configuration methods
  setConfig(newConfig: Partial<ToastConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): ToastConfig {
    return { ...this.config }
  }
}

// Create singleton instance with default config
const toastManager = new ToastManager()

// Export convenience methods
export const toast = {
  success: (message: string, title?: string, options?: Partial<ToastOptions>) => 
    toastManager.success(message, title, options),
  error: (message: string, title?: string, options?: Partial<ToastOptions>) => 
    toastManager.error(message, title, options),
  warning: (message: string, title?: string, options?: Partial<ToastOptions>) => 
    toastManager.warning(message, title, options),
  info: (message: string, title?: string, options?: Partial<ToastOptions>) => 
    toastManager.info(message, title, options),
  clear: () => toastManager.clear(),
  show: (options: ToastOptions) => toastManager.show(options),
  setConfig: (config: Partial<ToastConfig>) => toastManager.setConfig(config),
  getConfig: () => toastManager.getConfig()
}

export default toast 