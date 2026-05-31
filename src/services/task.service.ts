import { http } from '@/lib/http';
import type {
  CreateTaskRequest,
  SetTaskCompletedRequest,
  Task,
  UpdateTaskRequest,
} from '@/types/api';

/** Tasks. NOTE: /task/{id} endpoints have NO ownership check server-side — the
 *  client must only ever act on the current user's own tasks (API.md §12). */

/** The current user's incomplete tasks due today (includes taskListColor). */
export async function getTodayTasks(): Promise<Task[]> {
  const { data } = await http.get<Task[]>('/task/today');
  return data;
}

/** Tasks belonging to a list, ordered by due date ascending. */
export async function getTasksByList(listId: number): Promise<Task[]> {
  const { data } = await http.get<Task[]>(`/tasklist/${listId}/task`);
  return data;
}

export async function getTask(id: number): Promise<Task> {
  const { data } = await http.get<Task>(`/task/${id}`);
  return data;
}

export async function createTask(body: CreateTaskRequest): Promise<Task> {
  const { data } = await http.post<Task>('/task', body);
  return data;
}

/** PATCH /task/{id} is a FULL REPLACE — always send every field incl. isCompleted. */
export async function updateTask(id: number, body: UpdateTaskRequest): Promise<Task> {
  const { data } = await http.patch<Task>(`/task/${id}`, body);
  return data;
}

/** Flip the completed flag without resending the whole task. */
export async function setTaskCompleted(id: number, completed: boolean): Promise<Task> {
  const body: SetTaskCompletedRequest = { completed };
  const { data } = await http.patch<Task>(`/task/${id}/completed`, body);
  return data;
}

export async function deleteTask(id: number): Promise<Task> {
  const { data } = await http.delete<Task>(`/task/${id}`);
  return data;
}
