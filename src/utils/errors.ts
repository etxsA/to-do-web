import axios, { type AxiosError } from 'axios';

/**
 * Validation violation shape returned by Quarkus + Hibernate Validator.
 * API.md §9: show `violations[].message`, never hard-code `field` paths.
 */
export interface Violation {
  field: string;
  message: string;
}

/** Normalized error used across the app. Screens read `message`/`violations`. */
export interface ApiError {
  /** HTTP status, or 0 for network/timeout/no-response errors. */
  status: number;
  /** Human-readable message safe to display. */
  message: string;
  /** Field-level validation messages, when the backend returned a 400 body. */
  violations?: Violation[];
  /** True when the request never reached the server (network down / timeout). */
  isNetworkError: boolean;
  /** Original error, for logging. */
  cause?: unknown;
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Some of the information is invalid. Please check and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have access to this item.",
  404: "We couldn't find what you were looking for.",
  500: 'Something went wrong on the server. Please try again later.',
};

function messageForStatus(status: number): string {
  return DEFAULT_MESSAGES[status] ?? `Request failed (HTTP ${status}).`;
}

/** Type guard so callers can do `if (isApiError(e))`. */
export function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    'message' in e &&
    'isNetworkError' in e
  );
}

/**
 * Convert any thrown value (Axios error, body, or unknown) into an ApiError.
 * Centralizes the messy details of the backend's mixed error bodies
 * (validation JSON, plain-text bodies, empty bodies) into one shape.
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (axios.isAxiosError(error)) {
    const axErr = error as AxiosError;

    // No response → network error / timeout / CORS / server down.
    if (!axErr.response) {
      const timedOut = axErr.code === 'ECONNABORTED';
      return {
        status: 0,
        message: timedOut
          ? 'The request timed out. Check your connection and try again.'
          : 'Network error. Check your connection and try again.',
        isNetworkError: true,
        cause: error,
      };
    }

    const status = axErr.response.status;
    const data = axErr.response.data as unknown;

    // Validation body: { title, status, violations: [{ field, message }] }
    if (
      data &&
      typeof data === 'object' &&
      Array.isArray((data as { violations?: unknown }).violations)
    ) {
      const violations = (data as { violations: Violation[] }).violations;
      return {
        status,
        message: violations[0]?.message ?? messageForStatus(status),
        violations,
        isNetworkError: false,
        cause: error,
      };
    }

    // Plain-text body (e.g. "User not found", "Error registering user").
    if (typeof data === 'string' && data.trim().length > 0) {
      return { status, message: data.trim(), isNetworkError: false, cause: error };
    }

    // Object body with a message field.
    if (data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string') {
      return {
        status,
        message: (data as { message: string }).message,
        isNetworkError: false,
        cause: error,
      };
    }

    return { status, message: messageForStatus(status), isNetworkError: false, cause: error };
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message, isNetworkError: false, cause: error };
  }

  return { status: 0, message: 'An unexpected error occurred.', isNetworkError: false, cause: error };
}
