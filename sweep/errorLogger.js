const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'sweep-errors.log')
    })
  ]
});

async function logError(type, details) {
  logger.error({
    type,
    ...details,
    timestamp: new Date().toISOString()
  });
}

module.exports = { logError };