import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getApplicationById, updateClearance, processRefund } from '@/services/applicationService';
import { REFUND_AMOUNT_DISPLAY } from '@/config/constants';

export function useApplicationDetail(id) {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    getApplicationById(id)
      .then(r => setApplication(r.data.application))
      .catch(() => navigate('/admin/applications'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateClearanceStatus = async (clearanceType, status, reason) => {
    if (status === 'hold' && !reason?.trim()) {
      toast.error('Please provide a reason for putting on hold.');
      return false;
    }
    setUpdating(true);
    try {
      await updateClearance(id, clearanceType, status, reason);
      toast.success(`${clearanceType} clearance updated to ${status}`);
      refresh();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const triggerRefund = async () => {
    if (
      !window.confirm(
        `Are you sure you want to process the ${REFUND_AMOUNT_DISPLAY} refund for this student?`
      )
    )
      return;
    try {
      const r = await processRefund(id);
      toast.success(`Refund processed! Txn: ${r.data.transactionId}`);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Refund processing failed');
    }
  };

  return { application, loading, updating, updateClearanceStatus, triggerRefund, refresh };
}
