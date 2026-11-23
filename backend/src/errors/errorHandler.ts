import type { ErrorRequestHandler } from "express";
import { ValidateError } from "@tsoa/runtime";
import { ApiError } from "./apiError";

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ApiError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
      ...(error.fields ? { fields: error.fields } : {}),
    });
    return;
  }

  if (error instanceof ValidateError) {
    const fields = Object.entries(error.fields).map(([field, detail]) => ({
      field,
      message: detail.message,
    }));
    response.status(422).json({ code: "VALIDATION_ERROR", message: "Check the highlighted fields.", fields });
    return;
  }

  if (isMalformedJson(error)) {
    response.status(400).json({ code: "INVALID_JSON", message: "Request body must be valid JSON." });
    return;
  }

  const status = readStatus(error);
  if (status === 401 || status === 403) {
    response.status(status).json({
      code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
      message: status === 401 ? "Sign in to continue." : "You do not have permission to perform this action.",
    });
    return;
  }

  console.error("Unexpected API error", error);
  response.status(500).json({ code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." });
};

function isMalformedJson(error: unknown): boolean {
  return typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed";
}

function readStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  const status = error.status;
  return typeof status === "number" ? status : undefined;
}
