import React, { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleOAuthLogin } from '../app/modules/auth/core/_requests';
import webSocketService from '../app/services/WebSocketService';
import SchoolSelectionService from '../app/modules/auth/services/SchoolSelectionService';

interface UseGoogleAuthProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export const useGoogleAuth = ({ onSuccess, onError }: UseGoogleAuthProps = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Handle OAuth callback when user returns from Google
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      console.log('🔐 Google OAuth callback received:', { code, state });
      
      // Parse state to get school_subject_id and other data
      const stateData = JSON.parse(decodeURIComponent(state));
      const schoolSubjectId = stateData.school_subject_id;
      
      // Exchange authorization code for tokens via your backend
      const { data } = await googleOAuthLogin(code, schoolSubjectId);
      
      if (data.status === 'success' && data.data) {
        const user = data.data;
        
        // Connect WebSocket after successful login
        webSocketService.connect(true);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(user);
        } else {
          // Default behavior: redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Google OAuth callback failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onSuccess, onError, navigate]);

  // Handle school/subject parameters from URL after Google OAuth redirect
  const handleSchoolSubjectParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const school_id = urlParams.get('school_id');
    const school_name = urlParams.get('school_name');
    const subject_id = urlParams.get('subject_id');
    const subject_name = urlParams.get('subject_name');
    
    if (school_id && school_name && subject_id && subject_name) {
      console.log('🏫 Found school/subject parameters in URL:', {
        school_id,
        school_name: decodeURIComponent(school_name),
        subject_id,
        subject_name: decodeURIComponent(subject_name)
      });
      
      // Store school/subject selection using the same service as regular login
      const selection = {
        school_id,
        school_name: decodeURIComponent(school_name),
        subject_id,
        subject_name: decodeURIComponent(subject_name)
      };
      
      SchoolSelectionService.storeSelection(selection);
      
      // Clean up URL parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('school_id');
      newUrl.searchParams.delete('school_name');
      newUrl.searchParams.delete('subject_id');
      newUrl.searchParams.delete('subject_name');
      
      // Replace URL without reloading page
      window.history.replaceState({}, '', newUrl.toString());
      
      console.log('✅ School/subject selection stored from URL parameters BEFORE verify API call');
      
      return true; // Indicates parameters were found and stored
    }
    
    return false; // No parameters found
  }, []);

  // Generate Google OAuth URL for redirect
  const generateGoogleOAuthURL = useCallback(() => {
    const schoolSubjectId = searchParams.get('school_subject_id');
    
    // Create state parameter with school_subject_id and CSRF protection
    const state = encodeURIComponent(JSON.stringify({
      school_subject_id: schoolSubjectId,
      csrf: Math.random().toString(36).substring(7), // Simple CSRF token
      redirect: window.location.origin + '/dashboard'
    }));

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${API_URL}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
      access_type: 'offline',
      prompt: 'select_account'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, [searchParams, GOOGLE_CLIENT_ID, API_URL]);

  // Initiate Google OAuth redirect
  const initiateGoogleAuth = useCallback(() => {
    try {
      const oauthURL = generateGoogleOAuthURL();
      console.log('🔗 Redirecting to Google OAuth:', oauthURL);
      
      // Redirect to Google for authentication
      window.location.href = oauthURL;
    } catch (error) {
      console.error('❌ Failed to initiate Google OAuth:', error);
      if (onError) {
        onError('Failed to initiate Google sign-in');
      }
    }
  }, [generateGoogleOAuthURL, onError]);

  // Check if we're returning from Google OAuth callback or have school/subject params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    // CRITICAL: Handle school/subject parameters FIRST before any API calls
    // This ensures sessionStorage is set before verify API is called
    const hasSchoolSubjectParams = handleSchoolSubjectParams();

    if (error) {
      console.error('❌ Google OAuth error:', error);
      if (onError) {
        onError(`Google OAuth error: ${error}`);
      }
      return;
    }

    if (code && state) {
      // If we had school/subject params, they're now stored in sessionStorage
      // The backend verify API will now have the X-School-Subject-ID header
      handleOAuthCallback(code, state);
    }
  }, [handleOAuthCallback, handleSchoolSubjectParams, onError]);

  return {
    initiateGoogleAuth,
    generateGoogleOAuthURL,
  };
};
