import { useCallback, useEffect } from 'react';
import SchoolSelectionService from '../app/modules/auth/services/SchoolSelectionService';

/**
 * Hook to handle school/subject parameters from URL and store them in sessionStorage
 * This should be called EARLY in the app lifecycle to ensure sessionStorage is set
 * before any API calls that need the X-School-Subject-ID header
 * 
 * Example URL: /dashboard?school_id=123&school_name=ABC%20School&subject_id=456&subject_name=MATH
 */
export const useSchoolSubjectUrlParams = () => {
  const handleSchoolSubjectParams = useCallback(() => {
    console.log('🔍 useSchoolSubjectUrlParams: Checking URL:', window.location.href);
    const urlParams = new URLSearchParams(window.location.search);
    
    const school_id = urlParams.get('school_id');
    const school_name = urlParams.get('school_name');
    const subject_id = urlParams.get('subject_id');
    const subject_name = urlParams.get('subject_name');
    
    if (school_id && school_name && subject_id && subject_name) {
      console.log("HEY!");
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
      
      console.log('✅ School/subject selection stored from URL parameters BEFORE any API calls');
      
      return true; // Indicates that parameters were found and processed
    }
    
    return false; // No parameters found
  }, []);

  // Automatically handle URL parameters when hook is used
  useEffect(() => {
    handleSchoolSubjectParams();
  }, [handleSchoolSubjectParams]);

  return {
    handleSchoolSubjectParams,
  };
};
