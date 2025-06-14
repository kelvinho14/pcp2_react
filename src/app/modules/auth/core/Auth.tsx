/* eslint-disable react-refresh/only-export-components */
import {FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {AuthModel, UserModel} from './_models'
import {getCurrentUser} from './_requests'
import {WithChildren} from '../../../../_metronic/helpers'
import webSocketService from '../../../services/WebSocketService'
import axios from 'axios'

type AuthContextProps = {
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({children}) => {
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()

  const logout = async () => {
    console.log('Logging out')
    try {
      // Call backend to clear the HttpOnly cookie
      await axios.post(`${import.meta.env.VITE_APP_THEME_API_URL}/auth/logout`, {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      webSocketService.disconnect()
      setCurrentUser(undefined)
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({children}) => {
  const {setCurrentUser, currentUser} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {data} = await getCurrentUser()
        if (data.status === 'success' && data.data) {
          const user = data.data
          setCurrentUser(user)
          webSocketService.connect(true)
        } else {
          setCurrentUser(undefined)
          webSocketService.disconnect()
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
        setCurrentUser(undefined)
        webSocketService.disconnect()
      } finally {
        setShowSplashScreen(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      webSocketService.disconnect()
    }
  }, [currentUser])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export {AuthProvider, AuthInit, useAuth}
