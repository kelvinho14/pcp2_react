/* eslint-disable @typescript-eslint/no-explicit-any */
import {AuthModel, UserModel} from './_models'

export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = 'application/json'
  axios.defaults.withCredentials = true // Enable sending cookies with requests
}
