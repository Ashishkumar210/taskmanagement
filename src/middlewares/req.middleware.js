// const logger = require('../config/logger');

// const reqLogger = (req, res, next) => {
//   logger.debug(`[${req.method}] ${req.origionalUrl}`);
//   const start = Date.now();


//   res.on('finish', () => {
//     const duration = Date.now() - start;
//     logger.info(`[${req.method}] ${req.origionalUrl}`);

//   });
//   next();
// };



const logger = require("../config/logger");

const reqLogger = (req, res, next) => {
  const start = Date.now();

  logger.debug(`[${req.method}] ${req.originalUrl}`);

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      `[${req.method}] ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = {
  reqLogger,
};