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
  const isObject = typeof value === "object" && value !== null;
  if (!isObject) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const hasCode = typeof candidate.code === "string";
  const hasMessage = typeof candidate.message === "string";
  const hasValidFields =
    candidate.fields === undefined || Array.isArray(candidate.fields);

  return hasCode && hasMessage && hasValidFields;
}

export function normalizeError(payload: unknown, status?: number): ApiClientError {
  const isAlreadyApiClientError = payload instanceof ApiClientError;
  if (isAlreadyApiClientError) {
    return payload;
  }

  const isApiResponse = isApiErrorPayload(payload);
  if (isApiResponse) {
    return new ApiClientError({
      code: payload.code,
      message: payload.message,
      status,
      fields: payload.fields,
    });
  }

  return new ApiClientError({
    code: "UNKNOWN_ERROR",
    message: "Something went wrong. Please try again.",
    status,
  });
}
