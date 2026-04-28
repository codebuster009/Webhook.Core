const SCHEDULE_SEC = [60, 300, 900, 3600, 21600];

/**
 * Delay before the next attempt after a failed delivery.
 * Applies ±10% jitter on top of the fixed schedule to reduce herd effects.
 * @param {number} failedAttemptNumber 1-based attempt that just failed
 */
function backoffSecondsAfterFailure(failedAttemptNumber) {
  const idx = Math.min(Math.max(failedAttemptNumber - 1, 0), SCHEDULE_SEC.length - 1);
  const base = SCHEDULE_SEC[idx];
  const jitter = base * 0.1 * (Math.random() * 2 - 1);
  return Math.max(1, Math.round(base + jitter));
}

module.exports = {
  SCHEDULE_SEC,
  backoffSecondsAfterFailure,
};
