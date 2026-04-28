/**
 * Overview page tour — targets `data-tour` on Overview and children.
 */
export const webhookOverviewTour = {
  id: 'webhookOverview',
  label: 'Operations overview',
  steps: [
    {
      target: 'overview-kpi',
      title: 'Live KPIs',
      description:
        'These cards refresh on a short interval: ingestion rate, success rate, active retries, and recent failures. Run the screening simulator to see them move in real time.',
      placement: 'bottom',
    },
    {
      target: 'overview-chart',
      title: 'Deliveries vs. latency',
      description:
        'Delivery volume and average latency are bucketed from successful attempts in the last 24 hours. Use it to spot partner slowdowns or outages.',
      placement: 'top',
    },
    {
      target: 'overview-live',
      title: 'Live events',
      description:
        'The five most recent events with their latest delivery status. Click through to the Events page for the full list and filters.',
      placement: 'left',
    },
    {
      target: 'overview-endpoints',
      title: 'Endpoint monitoring',
      description:
        'Per-partner health derived from delivery attempts. Use “View logs” to jump to that partner’s events and inspect delivery history.',
      placement: 'top',
    },
  ],
};
