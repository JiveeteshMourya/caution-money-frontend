import { useState, useEffect, useCallback } from 'react';
import { getMyApplication } from '@/services/applicationService';

export function useMyApplication() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    getMyApplication()
      .then(r => setApplication(r.data.application))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { application, loading, error, refresh };
}
