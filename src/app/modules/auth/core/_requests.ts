import axios from "axios";
import { AuthModel, UserModel, ApiResponse } from "./_models";
import { getHeadersWithSchoolSubject } from "../../../../_metronic/helpers/axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const LOGIN_URL = `${API_URL}/users/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;

// Server should return AuthModel
export function login(email: string, password: string) {
  return axios.post<ApiResponse<UserModel>>(LOGIN_URL, {
    email,
    password,
  }, { withCredentials: true })
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
}

export function getCurrentUser() {
  const headers = getHeadersWithSchoolSubject(`${API_URL}/session/verify`)
  return axios.get<ApiResponse<UserModel>>(`${API_URL}/session/verify`, { 
    headers,
    withCredentials: true 
  })
}

// Google OAuth endpoints
export const GOOGLE_OAUTH_LOGIN_URL = `${API_URL}/auth/google/callback`;

export function googleOAuthLogin(authorizationCode: string, schoolSubjectId?: string) {
  return axios.post<ApiResponse<UserModel>>(GOOGLE_OAUTH_LOGIN_URL, {
    code: authorizationCode,
    school_subject_id: schoolSubjectId,
  }, { withCredentials: true });
}
