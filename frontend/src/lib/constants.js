export const EVENT_TYPES = [
  'KYC_REGISTERED',
  'TXN_SCREENED',
  'TXN_BLOCKED',
  'TXN_RELEASED',
  'INVALID_TXN',
];

export const EVENT_STATUSES = [
  'pending',
  'in_flight',
  'retrying',
  'delivered',
  'failed',
];

/** Distinct colors per Stitch spec */
export const EVENT_TYPE_BADGE = {
  KYC_REGISTERED: 'bg-blue-100 text-blue-800 border-blue-200',
  TXN_SCREENED: 'bg-green-100 text-green-800 border-green-200',
  TXN_BLOCKED: 'bg-red-100 text-red-800 border-red-200',
  TXN_RELEASED: 'bg-teal-100 text-teal-800 border-teal-200',
  INVALID_TXN: 'bg-orange-100 text-orange-800 border-orange-200',
};

/** Pill backgrounds + text (Tailwind gray/blue/orange/green/red scale) */
export const STATUS_PILL_CLASS = {
  pending: 'bg-gray-100 text-gray-700',
  in_flight: 'bg-blue-100 text-blue-700',
  retrying: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};
