export const webhookPartnersTour = {
  id: 'webhookPartners',
  label: 'Partners',
  steps: [
    {
      target: 'partners-header',
      title: 'Partner registry',
      description:
        'Each partner is a webhook URL plus signing policy. Register endpoints that should receive signed delivery POSTs from the worker.',
      placement: 'bottom',
    },
    {
      target: 'partners-kpis',
      title: 'At a glance',
      description:
        'Quick counts: how many partners you have, how many are active, and an average success rate from recent delivery stats.',
      placement: 'bottom',
    },
    {
      target: 'partners-body',
      title: 'Cards & actions',
      description:
        'Edit a partner, send a synthetic test event, or jump to that partner’s events. The signing secret is shown only at registration time.',
      placement: 'top',
    },
    {
      target: 'partners-config',
      title: 'Sample config',
      description:
        'A redacted JSON shape you can copy for integration docs. Real secrets never appear in the UI after creation.',
      placement: 'top',
    },
  ],
};
