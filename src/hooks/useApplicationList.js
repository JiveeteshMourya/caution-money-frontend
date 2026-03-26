import { useState, useEffect, useCallback } from 'react';
import { getAllApplications } from '@/services/applicationService';

export function useApplicationList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;
      const r = await getAllApplications(params);
      setApplications(r.data.applications);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deptFilter, page]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    applications,
    loading,
    total,
    pages,
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    deptFilter,
    setDeptFilter,
    refetch,
  };
}
