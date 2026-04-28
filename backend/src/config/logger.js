const pino = require('pino');

function createLogger(config) {
  const options = { level: config.logLevel };
  if (config.nodeEnv !== 'production') {
    return pino(
      options,
      pino.transport({ target: 'pino-pretty', options: { colorize: true, singleLine: true } })
    );
  }
  return pino(options);
}

module.exports = { createLogger };
