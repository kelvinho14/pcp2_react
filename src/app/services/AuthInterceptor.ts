import axios, { AxiosResponse, AxiosError } from 'axios'

class AuthInterceptor {
  private logoutFunction: (() => void) | null = null

  /**
   * Set the logout function to be called when validation fails
   */
  public setLogoutFunction(logoutFn: () => void): void {
    this.logoutFunction = logoutFn
  }

  /**
   * Setup axios interceptors for user validation
   */
  public setupInterceptors(): void {
    // Request interceptor to validate user data before each API call
    axios.interceptors.request.use(
      (config) => {
        // Skip validation for auth endpoints
        if (this.isAuthEndpoint(config.url)) {
          return config
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle validation errors
    axios.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        // Handle 401 Unauthorized responses
        if (error.response?.status === 401) {
          console.warn('Received 401 response, forcing logout')
          this.forceLogout()
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Validate user metadata against current user
   */
  public validateUserData(currentUser: any): boolean {
    if (!currentUser) {
      console.error('No current user provided for validation')
      return false
    }

    /*const isValid = JWTService.validateUserData(currentUser)
    if (!isValid) {
      console.error('User metadata validation failed, forcing logout')
      this.forceLogout()
      return false
    }*/

    return true
  }

  /**
   * Force logout when validation fails
   */
  private forceLogout(): void {
    console.log('Forcing logout due to user validation failure')
    
    // Call logout function if available
    if (this.logoutFunction) {
      this.logoutFunction()
    } else {
      // Fallback: redirect to login page
      window.location.href = '/auth/login'
    }
  }

  /**
   * Check if the URL is an auth endpoint (login, logout, etc.)
   */
  private isAuthEndpoint(url: string | undefined): boolean {
    if (!url) return false
    
    const authEndpoints = [
      '/users/login',
      '/users/logout',
      '/session/verify',
      '/verify_token',
      '/register'
    ]
    
    return authEndpoints.some(endpoint => url.includes(endpoint))
  }

  /**
   * Clear interceptors (useful for cleanup)
   */
  public clearInterceptors(): void {
    axios.interceptors.request.clear()
    axios.interceptors.response.clear()
  }
}

export default new AuthInterceptor() 