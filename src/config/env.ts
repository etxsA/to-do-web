/**
 * Centralized, typed access to environment configuration.
 *
 * All values come from `VITE_*` vars (see `.env` / `.env.example`), which Vite
 * inlines into the client bundle at build time via `import.meta.env`. These are
 * public by design (the Firebase web apiKey is not a secret).
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? 'http://localhost:8080';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
} as const;

/** Warns early (dev only) if Firebase config is incomplete, to fail fast. */
export function assertFirebaseConfig(): void {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0 && import.meta.env.DEV) {
    console.warn(
      `[config] Missing Firebase env vars: ${missing.join(', ')}. ` +
        `Copy .env.example to .env and fill them in.`,
    );
  }
}
