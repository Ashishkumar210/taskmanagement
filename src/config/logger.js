// const winston = require('winston');

// const { config } = require('.');

// const logger = winston.createLogger({

//   level: config.LOG_LEVEL,
//   defaultMeta: { service: config.SERVICE_NAME },
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.printf(({
//       level, message, timestamp, service
//     }) => {
//       return `[${timestamp}] [${level}] [${service}]: ${message}`
//     })
//   ),
//   transports: [new winston.transports.console()]
// })



const winston = require("winston");

const { config } = require("./index");

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  defaultMeta: {
    service: config.SERVICE_NAME,
  },
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, service, stack }) => {
      return stack
        ? `[${timestamp}] [${level.toUpperCase()}] [${service}] ${message}\n${stack}`
        : `[${timestamp}] [${level.toUpperCase()}] [${service}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;