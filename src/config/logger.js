



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



// const winston = require("winston");
// const DailyRotateFile = require("winston-daily-rotate-file");
// const path = require("path");

// const { config } = require("./index");

// const logDirectory = path.join(process.cwd(), "logs");

// const logFormat = winston.format.combine(
//   winston.format.timestamp({
//     format: "YYYY-MM-DD HH:mm:ss",
//   }),

//   winston.format.errors({
//     stack: true,
//   }),

//   winston.format.printf((info) => {
//     const {
//       timestamp,
//       level,
//       message,
//       service,
//       stack,
//       ...metadata
//     } = info;

//     const metadataString =
//       Object.keys(metadata).length > 0
//         ? ` ${JSON.stringify(metadata)}`
//         : "";

//     return stack
//       ? `[${timestamp}] [${level.toUpperCase()}] [${service}] ${message}${metadataString}\n${stack}`
//       : `[${timestamp}] [${level.toUpperCase()}] [${service}] ${message}${metadataString}`;
//   })
// );

// const logger = winston.createLogger({
//   level: config.LOG_LEVEL,

//   defaultMeta: {
//     service: config.SERVICE_NAME,
//   },

//   format: logFormat,

//   transports: [
//     /**
//      * Console
//      */
//     new winston.transports.Console(),

//     /**
//      * Application logs
//      *
//      * Creates:
//      * logs/application-2026-09-02.log
//      */
//     new DailyRotateFile({
//       dirname: logDirectory,
//       filename: "application-%DATE%.log",

//       datePattern: "YYYY-MM-DD",

//       maxSize: "20m",
//       maxFiles: "30d",

//       zippedArchive: true,
//     }),

//     /**
//      * Error logs
//      *
//      * Creates:
//      * logs/error-2026-09-02.log
//      */
//     new DailyRotateFile({
//       dirname: logDirectory,
//       filename: "error-%DATE%.log",

//       datePattern: "YYYY-MM-DD",

//       level: "error",

//       maxSize: "10m",
//       maxFiles: "1d",

//       zippedArchive: true,
//     }),
//   ],
// });

// module.exports = logger;
