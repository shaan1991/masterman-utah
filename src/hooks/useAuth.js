// ===== Updated src/hooks/useAuth.js =====
import { useState } from 'react';
import { signInWithGoogle as authSignInWithGoogle, signOut as authSignOut } from '../services/auth';

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const result = await authSignInWithGoogle();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    const result = await authSignOut();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    return result;
  };

  return {
    signInWithGoogle,
    signOut,
    loading,
    error
  };
};