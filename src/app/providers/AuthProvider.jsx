import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../shared/api/axios';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data?.user ?? response.data ?? null);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
      }

      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await api.get('/auth/profile');

        if (active) {
          setUser(response.data?.user ?? response.data ?? null);
        }
      } catch (error) {
        if (active && error.response?.status === 401) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      refreshProfile,
      logout,
      setUser,
    }),
    [user, loading, refreshProfile, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;