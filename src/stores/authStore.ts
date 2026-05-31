import { create } from 'zustand';

import { configureHttpAuth } from '@/lib/http';
import { queryClient } from '@/lib/queryClient';
import {
  getIdToken,
  isFirebaseError,
  mapFirebaseAuthError,
  signIn,
  signOutFirebase,
  signUp,
  watchAuthState,
  type FirebaseUser,
} from '@/services/auth.service';
import { createUser, getUserByFirebaseUuid } from '@/services/user.service';
import type { User } from '@/types/api';

type AuthStatus = 'init' | 'authed' | 'guest';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  description: string;
  role?: string;
  interest?: string;
}

interface AuthState {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  /** Backend user record (role, description, …). Source of truth for profile. */
  user: User | null;
  error: string | null;

  /** Wire the http auth bridge + subscribe to Firebase auth state. Returns unsubscribe. */
  bootstrap: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// While onboarding (Firebase user created but backend row not yet written), the
// auth-state listener must not treat the missing backend row as "sign me out".
let isOnboarding = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'init',
  firebaseUser: null,
  user: null,
  error: null,

  bootstrap: () => {
    // Bridge: the http interceptor pulls the Firebase ID token per request and
    // logs out if a refreshed token still yields 401.
    configureHttpAuth({
      getToken: (forceRefresh) => getIdToken(forceRefresh),
      onAuthExpired: () => {
        void get().logout();
      },
    });

    return watchAuthState(async (firebaseUser) => {
      if (isOnboarding) return; // register() drives state during onboarding

      if (!firebaseUser) {
        set({ status: 'guest', firebaseUser: null, user: null });
        return;
      }

      try {
        const backendUser = await getUserByFirebaseUuid(firebaseUser.uid);
        if (backendUser) {
          set({ status: 'authed', firebaseUser, user: backendUser });
        } else {
          // Valid Firebase session but no backend row → unusable account.
          await signOutFirebase();
          set({ status: 'guest', firebaseUser: null, user: null });
        }
      } catch {
        // Network hiccup while restoring: don't trap the user in a spinner.
        set({ status: 'guest', firebaseUser, user: null });
      }
    });
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const cred = await signIn(email, password);
      const backendUser = await getUserByFirebaseUuid(cred.user.uid);
      if (!backendUser) {
        await signOutFirebase();
        set({ status: 'guest', error: 'This account has no profile. Please sign up again.' });
        return;
      }
      set({ status: 'authed', firebaseUser: cred.user, user: backendUser });
    } catch (error) {
      const message = isFirebaseError(error)
        ? mapFirebaseAuthError(error.code)
        : 'Sign in failed. Please try again.';
      set({ error: message });
      throw error;
    }
  },

  register: async ({ fullName, email, password, description, role = 'USER', interest }) => {
    set({ error: null });
    isOnboarding = true;
    try {
      const cred = await signUp(email, password);
      const backendUser = await createUser({
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        description: description.trim(),
        firebaseUuid: cred.user.uid,
        ...(interest ? { interest: interest.trim() } : {}),
      });
      set({ status: 'authed', firebaseUser: cred.user, user: backendUser });
    } catch (error) {
      // If Firebase succeeded but the backend row failed, sign back out so we
      // don't leave a half-created account that 401s on every call.
      await signOutFirebase().catch(() => {});
      const message = isFirebaseError(error)
        ? mapFirebaseAuthError(error.code)
        : 'Could not create your account. Please try again.';
      set({ status: 'guest', firebaseUser: null, user: null, error: message });
      throw error;
    } finally {
      isOnboarding = false;
    }
  },

  logout: async () => {
    await signOutFirebase().catch(() => {});
    queryClient.clear();
    set({ status: 'guest', firebaseUser: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
