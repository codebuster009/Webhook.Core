export const webhookEventDetailTour = {
  id: 'webhookEventDetail',
  label: 'Event detail',
  steps: [
    {
      target: 'eventdetail-header',
      title: 'Event context',
      description:
        'Breadcrumb back to the list, event type, and transaction id. Use manual retry to re-queue delivery when the partner is ready.',
      placement: 'bottom',
    },
    {
      target: 'eventdetail-kpis',
      title: 'Status & attempts',
      description:
        'Current delivery state, how many attempts were used, and latency from the latest completed attempt.',
      placement: 'bottom',
    },
    {
      target: 'eventdetail-payload',
      title: 'Ingested payload',
      description:
        'The JSON your screening (or test) system sent. Copy for debugging or support tickets.',
      placement: 'top',
    },
    {
      target: 'eventdetail-attempts',
      title: 'Delivery attempts',
      description:
        'Every POST from the worker to the partner: HTTP status, latency, and outcome (success, retry, or terminated).',
      placement: 'top',
    },
    {
      target: 'eventdetail-trace',
      title: 'HTTP trace',
      description:
        'Expand to see captured outbound request headers and inbound response headers for each attempt (newer deliveries only).',
      placement: 'top',
    },
  ],
};
