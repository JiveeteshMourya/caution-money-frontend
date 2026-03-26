import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = d => {
  if (!d) return '—';
  try {
    return format(new Date(d), 'dd MMM yyyy');
  } catch {
    return '—';
  }
};

export const formatDateTime = d => {
  if (!d) return '—';
  try {
    return format(new Date(d), 'dd MMM yyyy, h:mm a');
  } catch {
    return '—';
  }
};

export const timeAgo = d => {
  if (!d) return '—';
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true });
  } catch {
    return '—';
  }
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const maskAccount = (num = '') => (num.length > 4 ? '****' + num.slice(-4) : num);

export const statusLabel = s =>
  ({
    submitted: 'Submitted',
    under_review: 'Under Review',
    partially_cleared: 'Partial Clearance',
    fully_cleared: 'Fully Cleared',
    refund_processed: 'Refund Processed ✓',
    on_hold: 'On Hold',
    rejected: 'Rejected',
  })[s] || s;

export const statusPill = s =>
  ({
    submitted: 'pill-submitted',
    under_review: 'pill-review',
    partially_cleared: 'pill-review',
    fully_cleared: 'pill-cleared',
    refund_processed: 'pill-refunded',
    on_hold: 'pill-hold',
    rejected: 'pill-hold',
    pending: 'pill-pending',
    cleared: 'pill-cleared',
    hold: 'pill-hold',
    na: 'pill-na',
  })[s] || 'pill-pending';

export const clearanceLabel = s =>
  ({
    pending: 'Awaiting Review',
    cleared: 'Cleared ✓',
    hold: 'On Hold',
    na: 'Not Applicable',
  })[s] || s;

export const deptIcons = {
  library: '📚',
  sports: '⚽',
  hostel: '🏠',
  department: '🎓',
  accounts: '💳',
};

export const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'ME', 'CE', 'EE', 'MCA', 'MBA', 'Other'];

export const ROLE_LABELS = {
  superadmin: 'Super Admin',
  library: 'Library Department',
  sports: 'Sports Department',
  hostel: 'Hostel Warden',
  department: 'Academic Department',
  accounts: 'Accounts Section',
};
