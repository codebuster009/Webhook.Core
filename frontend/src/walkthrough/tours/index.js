import { webhookOverviewTour } from './webhookOverviewTour.js';
import { webhookEventsTour } from './webhookEventsTour.js';
import { webhookPartnersTour } from './webhookPartnersTour.js';
import { webhookEventDetailTour } from './webhookEventDetailTour.js';

export const TOURS = {
  [webhookOverviewTour.id]: webhookOverviewTour,
  [webhookEventsTour.id]: webhookEventsTour,
  [webhookPartnersTour.id]: webhookPartnersTour,
  [webhookEventDetailTour.id]: webhookEventDetailTour,
};

export { webhookOverviewTour, webhookEventsTour, webhookPartnersTour, webhookEventDetailTour };
