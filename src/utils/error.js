class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

/**
 * 401
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

/**
 * 403
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/**
 * 404
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * 405
 */
class MethodNotAllowedError extends AppError {
  constructor(message = 'Method not allowed', code = 'METHOD_NOT_ALLOWED') {
    super(message, 405, code);
  }
}

/**
 * 409
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * 410
 */
class GoneError extends AppError {
  constructor(message = 'Resource no longer available', code = 'GONE') {
    super(message, 410, code);
  }
}

/**
 * 415
 */
class UnsupportedMediaTypeError extends AppError {
  constructor(message = 'Unsupported media type', code = 'UNSUPPORTED_MEDIA_TYPE') {
    super(message, 415, code);
  }
}

/**
 * 422
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = [], code = 'VALIDATION_ERROR') {
    super(message, 422, code);
    this.errors = errors;
  }
}

/**
 * 429
 */
class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', code = 'TOO_MANY_REQUESTS') {
    super(message, 429, code);
  }
}

/**
 * 500
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal server error', code = 'INTERNAL_SERVER_ERROR') {
    super(message, 500, code);
  }
}

/**
 * 501
 */
class NotImplementedError extends AppError {
  constructor(message = 'Not implemented', code = 'NOT_IMPLEMENTED') {
    super(message, 501, code);
  }
}

/**
 * 502
 */
class BadGatewayError extends AppError {
  constructor(message = 'Bad gateway', code = 'BAD_GATEWAY') {
    super(message, 502, code);
  }
}

/**
 * 503
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE') {
    super(message, 503, code);
  }
}

/**
 * 504
 */
class GatewayTimeoutError extends AppError {
  constructor(message = 'Gateway timeout', code = 'GATEWAY_TIMEOUT') {
    super(message, 504, code);
  }
}

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  GoneError,
  UnsupportedMediaTypeError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  NotImplementedError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
};