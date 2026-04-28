export const webhookEventsTour = {
  id: 'webhookEvents',
  label: 'Events',
  steps: [
    {
      target: 'events-header',
      title: 'Event monitoring',
      description:
        'The list updates frequently so you can watch ingestion and delivery in real time. Use test events or the screening simulator to add traffic.',
      placement: 'bottom',
    },
    {
      target: 'events-filters',
      title: 'Filters & search',
      description:
        'Narrow by partner, status, type, or time range. Deep links from the dashboard (e.g. View logs) pre-fill the partner filter.',
      placement: 'bottom',
    },
    {
      target: 'events-body',
      title: 'Event table',
      description:
        'Each row is a delivery record. Open a row for full payload, attempt history, and HTTP trace from the worker to the partner.',
      placement: 'top',
    },
  ],
};
