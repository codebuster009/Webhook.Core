const { prisma } = require('../lib/prisma');
const { signPayload } = require('../utils/hmac');
const { postWebhook } = require('../utils/http');
const { backoffSecondsAfterFailure } = require('../utils/backoff');

function buildWebhookBody(event) {
  return JSON.stringify({
    id: event.id,
    event_type: event.eventType,
    transaction_id: event.transactionId,
    external_id: event.externalId,
    payload: event.payload,
  });
}

async function deliverClaimedRow(claimed) {
  const event = await prisma.event.findUnique({
    where: { id: claimed.id },
    include: { partner: true },
  });

  if (!event || !event.partner) {
    return;
  }

  if (event.partner.status !== 'active') {
    const startedAt = new Date();
    await prisma.$transaction([
      prisma.deliveryAttempt.create({
        data: {
          eventId: event.id,
          attemptNumber: event.attemptCount,
          startedAt,
          completedAt: startedAt,
          responseCode: null,
          responseBody: null,
          latencyMs: null,
          errorMessage: 'partner disabled',
          outcome: 'terminated',
        },
      }),
      prisma.event.update({
        where: { id: event.id },
        data: {
          status: 'failed',
          lastError: 'partner disabled',
          lockedAt: null,
          lockedBy: null,
        },
      }),
    ]);
    return;
  }

  const bodyString = buildWebhookBody(event);
  const timestampMs = Date.now().toString();
  const signature = signPayload(event.partner.signingSecret, bodyString);
  const attemptNumber = event.attemptCount;

  const startedAt = new Date();
  const httpResult = await postWebhook(event.partner.webhookUrl, {
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Id': event.id,
      'X-Webhook-Timestamp': timestampMs,
      'X-Webhook-Signature': signature,
      'X-Webhook-Attempt': String(attemptNumber),
    },
    body: bodyString,
  });

  const completedAt = new Date();
  const httpOk =
    httpResult.statusCode !== null &&
    httpResult.statusCode !== undefined &&
    httpResult.statusCode >= 200 &&
    httpResult.statusCode < 300;

  let outcome;
  let nextStatus;
  let nextAttemptAt = event.nextAttemptAt;
  let deliveredAt = event.deliveredAt;
  let lastError = event.lastError;

  if (httpOk) {
    outcome = 'success';
    nextStatus = 'delivered';
    deliveredAt = completedAt;
    lastError = null;
  } else if (event.attemptCount >= event.maxAttempts) {
    outcome = 'terminated';
    nextStatus = 'failed';
    lastError = httpResult.errorMessage || `HTTP ${httpResult.statusCode || 'ERR'}`;
  } else {
    outcome = 'retry';
    nextStatus = 'retrying';
    const delaySec = backoffSecondsAfterFailure(event.attemptCount);
    nextAttemptAt = new Date(Date.now() + delaySec * 1000);
    lastError = httpResult.errorMessage || `HTTP ${httpResult.statusCode || 'ERR'}`;
  }

  await prisma.$transaction([
    prisma.deliveryAttempt.create({
      data: {
        eventId: event.id,
        attemptNumber,
        startedAt,
        completedAt,
        responseCode: httpResult.statusCode,
        responseBody: httpResult.responseBody || null,
        latencyMs: httpResult.latencyMs,
        errorMessage: httpResult.errorMessage,
        outcome,
      },
    }),
    prisma.event.update({
      where: { id: event.id },
      data: {
        status: nextStatus,
        nextAttemptAt,
        deliveredAt,
        lastError,
        lockedAt: null,
        lockedBy: null,
      },
    }),
  ]);
}

module.exports = {
  deliverClaimedRow,
  buildWebhookBody,
};
