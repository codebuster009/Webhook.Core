const { config } = require('../config');
const { createLogger } = require('../config/logger');

const logger = createLogger(config);

function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: { code: 'NOT_FOUND', message: 'Resource not found' },
  });
}

function errorMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL');
  const message = err.expose && err.message ? err.message : 'Internal server error';
  if (status >= 500) {
    logger.error({ err, requestId: req.id }, 'request failed');
  }
  res.status(status).json({
    ok: false,
    error: { code, message: status === 500 ? 'Internal server error' : message },
  });
}

class HttpError extends Error {
  constructor(status, code, message, expose = true) {
    super(message);
    this.status = status;
    this.statusCode = status;
    this.code = code;
    this.expose = expose;
  }
}

module.exports = { notFoundHandler, errorMiddleware, HttpError, errorLogger: logger };
