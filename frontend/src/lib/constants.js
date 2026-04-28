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

export const EVENT_TYPE_BADGE = {
  KYC_REGISTERED: 'bg-orange-100 text-orange-800 border-orange-200',
  TXN_SCREENED: 'bg-blue-100 text-blue-800 border-blue-200',
  TXN_BLOCKED: 'bg-red-100 text-red-800 border-red-200',
  TXN_RELEASED: 'bg-teal-100 text-teal-800 border-teal-200',
  INVALID_TXN: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const STATUS_STYLE = {
  pending: { dot: 'bg-gray-400', text: 'text-gray-700' },
  in_flight: { dot: 'bg-amber-400', text: 'text-amber-700' },
  retrying: { dot: 'bg-red-500', text: 'text-red-700' },
  delivered: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  failed: { dot: 'bg-red-600', text: 'text-red-700' },
};
