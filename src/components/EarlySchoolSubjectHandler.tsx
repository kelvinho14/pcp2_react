import React from 'react';
import { useSchoolSubjectUrlParams } from '../hooks/useSchoolSubjectUrlParams';

/**
 * Component that should be rendered early in the app lifecycle to ensure
 * school/subject URL parameters are processed before any API calls
 * 
 * Usage: Add this component near the top of your app component tree
 */
export const EarlySchoolSubjectHandler: React.FC = () => {
  
  // This hook automatically processes school/subject URL parameters
  // and stores them in sessionStorage before any API calls
  useSchoolSubjectUrlParams();
  
  // This component doesn't render anything visible
  return null;
};
