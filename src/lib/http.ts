import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/config/env';
import { toApiError } from '@/utils/errors';

/**
 * Custom Axios instance + interceptors (required by the project spec).
 *
 * Auth is decoupled via a small "bridge": the auth layer (Phase 2) injects a
 * token getter and an on-expired callback with `configureHttpAuth`. This keeps
 * the networking layer independent of Firebase and easy to unit-test.
 */

export type TokenGetter = (forceRefresh?: boolean) => Promise<string | null>;

let getToken: TokenGetter = async () => null;
let onAuthExpired: () => void = () => {};

export function configureHttpAuth(opts: {
  getToken: TokenGetter;
  onAuthExpired?: () => void;
}): void {
  getToken = opts.getToken;
  if (opts.onAuthExpired) onAuthExpired = opts.onAuthExpired;
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach the Firebase ID token as a Bearer header.
// Calling the getter per request lets the auth layer refresh as needed.
http.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Response interceptor: on 401, try one forced token refresh + retry; if it
// still fails, signal the auth layer to log out. All errors are normalized to
// ApiError so the rest of the app deals with one shape.
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const fresh = await getToken(true);
        if (fresh) {
          original.headers.set('Authorization', `Bearer ${fresh}`);
          return http(original);
        }
      } catch {
        // fall through to logout
      }
      onAuthExpired();
    }

    return Promise.reject(toApiError(error));
  },
);
