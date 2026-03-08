/**
 * Base application error.
 * Extend this for all domain-specific errors.
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    // Restore prototype chain (required when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a request requires authentication but no session is present.
 * Maps to HTTP 401.
 */
export class AuthenticationError extends AppError {
  constructor(message = "You must be signed in to access this resource") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when an authenticated user lacks the required permissions.
 * Maps to HTTP 403.
 */
export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "FORBIDDEN", 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Thrown when a requested resource cannot be found.
 * Maps to HTTP 404.
 */
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

/**
 * Thrown when user input fails schema validation.
 * Maps to HTTP 422.
 */
export class ValidationError extends AppError {
  readonly issues: unknown[];

  constructor(message = "Invalid input data", issues: unknown[] = []) {
    super(message, "VALIDATION_ERROR", 422);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

/**
 * Thrown when an upstream service or dependency is unavailable.
 * Maps to HTTP 503.
 */
export class ServiceUnavailableError extends AppError {
  constructor(service = "Service") {
    super(`${service} is temporarily unavailable`, "SERVICE_UNAVAILABLE", 503);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Type guard to check whether an unknown value is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Returns the HTTP status code for any error.
 * Defaults to 500 for non-AppError instances.
 */
export function getStatusCode(error: unknown): number {
  if (isAppError(error)) return error.statusCode;
  return 500;
}
