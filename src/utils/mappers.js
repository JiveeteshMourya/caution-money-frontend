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
