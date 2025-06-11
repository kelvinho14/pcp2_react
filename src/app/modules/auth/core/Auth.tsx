/* eslint-disable react-refresh/only-export-components */
import {FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {AuthModel, UserModel} from './_models'
import * as authHelper from './AuthHelpers'
import {getCurrentUser} from './_requests'
import {WithChildren} from '../../../../_metronic/helpers'

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => {},
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

  const logout = () => {
    setCurrentUser(undefined)
  }

  return (
    <AuthContext.Provider value={{
      auth: undefined, // We don't need to track auth state since it's in the cookie
      saveAuth: () => {}, // No-op since we don't store auth state
      currentUser,
      setCurrentUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({children}) => {
  const {setCurrentUser} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {data} = await getCurrentUser()
        if (data.status === 'success' && data.data) {
          const user = data.data
          setCurrentUser(user)
        } else {
          setCurrentUser(undefined)
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
        setCurrentUser(undefined)
      } finally {
        setShowSplashScreen(false)
      }
    }

    checkAuth()
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export {AuthProvider, AuthInit, useAuth}
