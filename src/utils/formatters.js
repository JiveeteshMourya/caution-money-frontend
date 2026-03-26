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
