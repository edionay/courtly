export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  fields?: FieldError[];
}

export class ApiError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: FieldError[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function validationError(fields: FieldError[]): ApiError {
  return new ApiError(422, "VALIDATION_ERROR", "Check the highlighted fields.", fields);
}
