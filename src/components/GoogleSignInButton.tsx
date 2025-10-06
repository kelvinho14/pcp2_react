import React from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  className = '',
  disabled = false,
}) => {
  const { initiateGoogleAuth } = useGoogleAuth({
    onSuccess,
    onError,
  });

  if (disabled) {
    return (
      <button 
        type="button"
        disabled
        className={`btn btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100 ${className}`}
      >
        <img
          alt="Google Logo"
          src="/media/svg/brand-logos/google-icon.svg"
          className="h-15px me-3"
        />
        Continue with Google (Disabled)
      </button>
    );
  }

  return (
    <button 
      type="button"
      className={`btn btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100 ${className}`}
      onClick={initiateGoogleAuth}
    >
      <img
        alt="Google Logo"
        src="/media/svg/brand-logos/google-icon.svg"
        className="h-15px me-3"
      />
      Continue with Google
    </button>
  );
};
