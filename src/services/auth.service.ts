import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

/**
 * Thin wrappers around Firebase Auth. All Firebase auth access in the app goes
 * through this module (and `@/lib/firebase`) so the SDK build stays consistent.
 */

export type { FirebaseUser };

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export function signOutFirebase() {
  return firebaseSignOut(auth);
}

/** Subscribe to auth state; returns an unsubscribe function. */
export function watchAuthState(cb: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, cb);
}

/** Current Firebase ID token, or null if signed out. `forceRefresh` bypasses cache. */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  return user ? user.getIdToken(forceRefresh) : null;
}

export function currentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

/** Map Firebase auth error codes to friendly, user-facing messages. */
export function mapFirebaseAuthError(code: string | undefined): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is invalid.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'That email is already registered.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

/** True when a thrown value looks like a FirebaseError ({ code, message }). */
export function isFirebaseError(e: unknown): e is { code: string; message: string } {
  return typeof e === 'object' && e !== null && 'code' in e && typeof (e as { code: unknown }).code === 'string';
}
