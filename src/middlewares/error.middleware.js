


const { AppError } = require("../utils/error");
const logger = require("../config/logger");

module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {



    logger.warn("Application error", {
      method: req.method,
      url: req.originalUrl,
      statusCode: err.statusCode,
      errorCode: err.code,
      message: err.message,
    });
    return res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message,
    });
  }

  // Unexpected errors
  logger.error("Unhandled server error", {
    method: req.method,
    url: req.originalUrl,
    statusCode: 500,
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong.",
  });
};