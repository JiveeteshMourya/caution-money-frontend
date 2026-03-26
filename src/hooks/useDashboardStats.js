import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/services/applicationService';

export function useDashboardStats() {
  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => {
        setStats(r.data.stats || {});
        setRecentApplications(r.data.recentApplications || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, recentApplications, loading };
}
