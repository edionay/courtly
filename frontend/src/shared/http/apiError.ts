export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  fields?: ApiFieldError[];
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly fields?: ApiFieldError[];

  constructor(params: {
    message: string;
    code: string;
    status?: number;
    fields?: ApiFieldError[];
  }) {
    super(params.message);
    this.name = "ApiClientError";
    this.code = params.code;
    this.status = params.status;
    this.fields = params.fields;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isNetworkError(): boolean {
    return this.code === "NETWORK_ERROR";
  }
}

export function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.fields === undefined || Array.isArray(candidate.fields))
  );
}

export function normalizeError(error: unknown, status?: number): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (isApiErrorPayload(error)) {
    return new ApiClientError({
      code: error.code,
      message: error.message,
      status,
      fields: error.fields,
    });
  }

  if (status === 401) {
    return new ApiClientError({
      code: "UNAUTHENTICATED",
      message: "Authentication required.",
      status: 401,
    });
  }

  if (status === 403) {
    return new ApiClientError({
      code: "FORBIDDEN",
      message: "Access denied.",
      status: 403,
    });
  }

  return new ApiClientError({
    code: "UNKNOWN_ERROR",
    message: "Something went wrong. Please try again.",
    status,
  });
}
