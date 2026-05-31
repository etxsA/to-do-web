import { http } from '@/lib/http';
import type {
  CreateTaskListRequest,
  TaskList,
  TaskListPage,
  TaskListWithOldestPendingPage,
  UpdateTaskListRequest,
} from '@/types/api';

/** Task lists owned by the current user. All endpoints require auth. */

/** Paged list of the user's task lists (page is 1-indexed, size 20). */
export async function getTaskLists(page = 1): Promise<TaskListPage> {
  const { data } = await http.get<TaskListPage>('/tasklist', { params: { page } });
  return data;
}

/** Paged lists enriched with progress (0–100) + the oldest pending task. Drives Home. */
export async function getTaskListsWithProgress(
  page = 1,
): Promise<TaskListWithOldestPendingPage> {
  const { data } = await http.get<TaskListWithOldestPendingPage>(
    '/tasklist/with-oldest-pending',
    { params: { page } },
  );
  return data;
}

/** Page through every list the user owns (for client-side smart-list aggregation). */
export async function getAllTaskLists(): Promise<TaskList[]> {
  const all: TaskList[] = [];
  let page = 1;
  // Hard cap as a safety net against an unexpected hasMore loop.
  for (let i = 0; i < 50; i += 1) {
    const res = await getTaskLists(page);
    all.push(...res.items);
    if (!res.hasMore) break;
    page += 1;
  }
  return all;
}

export async function getTaskList(id: number): Promise<TaskList> {
  const { data } = await http.get<TaskList>(`/tasklist/${id}`);
  return data;
}

export async function createTaskList(body: CreateTaskListRequest): Promise<TaskList> {
  const { data } = await http.post<TaskList>('/tasklist', body);
  return data;
}

/** Partial update — send only changed fields (this PATCH really is partial). */
export async function updateTaskList(
  id: number,
  body: UpdateTaskListRequest,
): Promise<TaskList> {
  const { data } = await http.patch<TaskList>(`/tasklist/${id}`, body);
  return data;
}

/** Deletes the list (and orphan tasks). Returns the deleted list. */
export async function deleteTaskList(id: number): Promise<TaskList> {
  const { data } = await http.delete<TaskList>(`/tasklist/${id}`);
  return data;
}
