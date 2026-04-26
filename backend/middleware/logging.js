const logger = require('../logger');

// Request-Logging Middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Fehler', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Error-Logging Middleware
const errorLogger = (err, req, res, next) => {
  logger.error('HTTP Fehler', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};
