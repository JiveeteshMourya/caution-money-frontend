// ── Refund ────────────────────────────────────────────────────────
export const REFUND_AMOUNT = 5000;
export const REFUND_AMOUNT_DISPLAY = '₹5,000';

// ── Academic ──────────────────────────────────────────────────────
export const PASSOUT_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

export const DEPARTMENTS = ['CS', 'PHY', 'CHE', 'MATH', 'BIO-TECH'];

// ── Roles ─────────────────────────────────────────────────────────
export const ROLE_LABELS = {
  superadmin: 'Super Admin',
  library: 'Library Department',
  sports: 'Sports Department',
  hostel: 'Hostel Warden',
  department: 'Academic Department',
  accounts: 'Accounts Section',
};

export const ROLE_ICONS = {
  superadmin: '👑',
  library: '📚',
  sports: '⚽',
  hostel: '🏠',
  department: '🎓',
  accounts: '💳',
};

export const DEPT_ICONS = {
  library: '📚',
  sports: '⚽',
  hostel: '🏠',
  department: '🎓',
  accounts: '💳',
};

export const CLEARANCE_ROLES = ['library', 'sports', 'hostel', 'department'];
export const REFUND_ROLES = ['accounts', 'superadmin'];

export const CLEARANCE_ROLE_MAP = {
  library: ['library', 'superadmin'],
  sports: ['sports', 'superadmin'],
  hostel: ['hostel', 'superadmin'],
  department: ['department', 'superadmin'],
  accounts: ['accounts', 'superadmin'],
};

// ── Application status ────────────────────────────────────────────
export const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'partially_cleared', label: 'Partial Clearance' },
  { value: 'fully_cleared', label: 'Fully Cleared' },
  { value: 'refund_processed', label: 'Refund Processed' },
  { value: 'on_hold', label: 'On Hold' },
];

export const APPLICATION_STATUS_STEPS = {
  submitted: 1,
  under_review: 2,
  partially_cleared: 2,
  on_hold: 2,
  fully_cleared: 3,
  refund_processed: 4,
};

// ── Storage keys ──────────────────────────────────────────────────
export const TOKEN_KEY = 'iehe_token';
export const USER_KEY = 'iehe_user';

export const backendUrl = 'https://caution-money-backend.vercel.app/api';
