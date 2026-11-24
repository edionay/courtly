import { ApiClientError, normalizeError } from "./apiError";
import { tokenStorage } from "../../features/auth/tokenStorage";

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
};

function serializeRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }
  if (body instanceof FormData) {
    return body;
  }
  return JSON.stringify(body);
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const rawText = await response.text();
  const isEmptyBody = rawText.trim().length === 0;
  if (isEmptyBody) {
    return null;
  }
  try {
    const parsedData: unknown = JSON.parse(rawText);
    return parsedData;
  } catch (error) {
    const isMalformedJson = error instanceof SyntaxError;
    if (isMalformedJson) {
      return null;
    }
    throw error;
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", headers = {}, body, signal } = options;

  const resolvedHeaders: Record<string, string> = { ...headers };
  const hasBody = body !== undefined;
  const isFormData = body instanceof FormData;

  if (hasBody && !isFormData) {
    resolvedHeaders["Content-Type"] = "application/json";
  }

  const token = tokenStorage.getToken();
  const hasAuthHeader = Boolean(resolvedHeaders["Authorization"]);
  if (token && !hasAuthHeader) {
    resolvedHeaders["Authorization"] = `Bearer ${token}`;
  }

  const serializedBody = serializeRequestBody(body);

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: resolvedHeaders,
      body: serializedBody,
      signal,
    });
  } catch (error) {
    const isAborted = error instanceof DOMException && error.name === "AbortError";
    if (isAborted) {
      throw error;
    }
    throw new ApiClientError({
      code: "NETWORK_ERROR",
      message: "Could not connect to the server. Please check your connection.",
    });
  }

  const isSuccess = response.ok;
  if (!isSuccess) {
    const errorPayload = await parseJsonSafely(response);
    throw normalizeError(errorPayload, response.status);
  }

  const isNoContent =
    response.status === 204 || response.headers.get("content-length") === "0";
  if (isNoContent) {
    return undefined as unknown as T;
  }

  const data = await parseJsonSafely(response);
  return data as T;
}

export const httpClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },
  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<T> {
    return request<T>(path, { ...options, method: "PATCH", body });
  },
  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
