/**
 * API contract types — mirror the backend DTOs documented in API.md §10.
 *
 * Wire conventions to remember (JSON-B / Yasson serialization):
 *  - Null properties are OMITTED from responses → every nullable field is optional here.
 *  - Boolean fields drop the `is` prefix on output: `isCompleted` → `"completed"`.
 *  - Dates are ISO-8601 LocalDateTime strings ("2026-05-28T17:00:00", no timezone).
 *  - TaskList/Task/Icon ids are numbers (Java Long); User id is a UUID string.
 */

// ---------- Enums ----------
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export const PRIORITIES: readonly Priority[] = ['HIGH', 'MEDIUM', 'LOW'] as const;

export type MemberStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'; // sharing (not active yet)
export type MemberRole = 'VIEWER' | 'EDITOR'; // sharing (not active yet)

// ---------- Core read models (responses) ----------
export interface Icon {
  id: number;
  iosName: string; // SF Symbol, e.g. "house.fill"
  androidName: string; // Material icon, e.g. "home"
  name: string; // display name, e.g. "Home"
}

export interface User {
  id: string; // UUID
  fullName: string;
  email: string;
  role: string; // free-form ("USER", "Teacher", ...)
  interest?: string;
  description?: string;
  firebaseImage?: string; // stored firebaseImageUuid (URL or ref)
  createdAt?: string; // ISO LocalDateTime
}

export interface TaskList {
  id: number;
  name: string;
  color: string; // hex, e.g. "#3357FF"
  description: string;
  ownerId: string; // UUID of the owner
  icon?: Icon; // omitted if the list has no resolvable icon
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string; // ISO LocalDateTime
  priority: Priority;
  completed: boolean; // NOTE: response key is "completed"
  taskListIds: number[]; // the lists this task belongs to
  taskListColor?: string; // only present in /task/today and /search results
}

export interface TaskListWithOldestPending extends TaskList {
  progress: number; // 0..100
  oldestPendingTask?: Task; // omitted if none
}

// ---------- Paginated envelopes ----------
export interface Page<T> {
  items: T[];
  count: number; // total across all pages
  hasMore: boolean;
}
export type TaskListPage = Page<TaskList>;
export type TaskListWithOldestPendingPage = Page<TaskListWithOldestPending>;

// ---------- Search ----------
export interface SearchResult {
  taskLists: TaskList[];
  tasks: Task[];
}

// ---------- Status ----------
export interface StatusResponse {
  status: string;
  name: string;
  version: string;
}

// ---------- Write models (request bodies) ----------
export interface RegisterUserRequest {
  fullName: string;
  email: string;
  role: string; // required
  description: string; // required
  firebaseUuid: string; // required: the Firebase uid
  interest?: string;
  firebaseImageUuid?: string;
}

export interface CreateTaskListRequest {
  name: string; // required
  color: string; // required (hex)
  description: string; // required
  iconId: number; // required, must exist
}

export interface UpdateTaskListRequest {
  // partial — send only what changes
  name?: string;
  color?: string;
  description?: string;
  iconId?: number;
}

export interface CreateTaskRequest {
  title: string; // required, <=100
  priority: Priority; // required
  taskListIds: number[]; // required (may be empty)
  description?: string; // <=500
  dueDate?: string; // ISO date-time
  isCompleted?: boolean; // NOTE: request key is "isCompleted"
}

// PATCH /task/{id} is a FULL REPLACE — send every field you want to keep.
export type UpdateTaskRequest = CreateTaskRequest;

export interface SetTaskCompletedRequest {
  completed: boolean; // required
}
