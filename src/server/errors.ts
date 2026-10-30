export type FieldErrors = Record<string, string[]>;

export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, fieldErrors?: FieldErrors) {
    super(400, message, fieldErrors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Please sign in to continue.") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do that.") {
    super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fieldErrors?: FieldErrors) {
    super(409, message, fieldErrors);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(503, message);
  }
}

export class UpstreamError extends AppError {
  constructor(message: string) {
    super(502, message);
  }
}
