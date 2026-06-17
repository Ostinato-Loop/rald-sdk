// @rald/sdk — Error Classes
// LILCKY STUDIO LIMITED · 2026-06-17

export class RaldError extends Error {
  readonly statusCode: number;
  readonly code:       string | undefined;
  readonly details:    unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.name       = "RaldError";
    this.statusCode = statusCode;
    this.code       = code;
    this.details    = details;
  }

  get isNotFound():     boolean { return this.statusCode === 404; }
  get isUnauthorized(): boolean { return this.statusCode === 401; }
  get isForbidden():    boolean { return this.statusCode === 403; }
  get isRateLimit():    boolean { return this.statusCode === 429; }
  get isServerError():  boolean { return this.statusCode >= 500; }
}

export class RaldNotFoundError extends RaldError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "RaldNotFoundError";
  }
}

export class RaldAuthError extends RaldError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "RaldAuthError";
  }
}

export class RaldForbiddenError extends RaldError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
    this.name = "RaldForbiddenError";
  }
}

export class RaldRateLimitError extends RaldError {
  constructor(retryAfter?: number) {
    super("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RaldRateLimitError";
  }
}

export class RaldValidationError extends RaldError {
  constructor(message: string, details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
    this.name = "RaldValidationError";
  }
}

export class RaldNetworkError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "RaldNetworkError";
  }
}
