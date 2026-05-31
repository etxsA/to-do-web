import { http } from '@/lib/http';
import type { RegisterUserRequest, User } from '@/types/api';
import { isApiError } from '@/utils/errors';

/**
 * Backend user records (the app-level user, linked to Firebase by firebaseUuid).
 * `GET /user` and `POST /user` are public endpoints (no token required).
 */

/** Look up the backend user row for a Firebase uid. Returns null on 404. */
export async function getUserByFirebaseUuid(firebaseUuid: string): Promise<User | null> {
  try {
    const { data } = await http.get<User>('/user', { params: { firebaseUuid } });
    return data;
  } catch (error) {
    if (isApiError(error) && error.status === 404) return null;
    throw error;
  }
}

/** Create the backend user row after Firebase sign-up. */
export async function createUser(body: RegisterUserRequest): Promise<User> {
  const { data } = await http.post<User>('/user', body);
  return data;
}
