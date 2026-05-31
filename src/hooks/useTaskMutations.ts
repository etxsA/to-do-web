import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from '@/services/task.service';
import type { CreateTaskRequest, Task, UpdateTaskRequest } from '@/types/api';
import { taskKeys, taskListKeys } from '@/utils/queryKeys';

/** Invalidate everything a task change can affect (lists progress + today + lists). */
function invalidateTaskDomains(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: taskKeys.all });
  qc.invalidateQueries({ queryKey: taskListKeys.all });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskRequest) => createTask(body),
    onSuccess: () => invalidateTaskDomains(qc),
  });
}

export function useUpdateTask(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTaskRequest) => updateTask(id, body),
    onSuccess: () => invalidateTaskDomains(qc),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => invalidateTaskDomains(qc),
  });
}

/** Toggle completion without a list scope (smart screens span multiple lists). */
export function useToggleTaskGlobal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      setTaskCompleted(id, completed),
    onSettled: () => invalidateTaskDomains(qc),
  });
}

/**
 * Toggle completion with an optimistic update on the list's tasks + the "today"
 * list, rolling back on error. Drives the instant-feeling checkbox/swipe.
 */
export function useToggleTaskCompleted(listId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      setTaskCompleted(id, completed),
    onMutate: async ({ id, completed }) => {
      await qc.cancelQueries({ queryKey: taskKeys.byList(listId) });
      await qc.cancelQueries({ queryKey: taskKeys.today() });

      const prevList = qc.getQueryData<Task[]>(taskKeys.byList(listId));
      const prevToday = qc.getQueryData<Task[]>(taskKeys.today());

      qc.setQueryData<Task[]>(taskKeys.byList(listId), (old) =>
        old?.map((t) => (t.id === id ? { ...t, completed } : t)),
      );
      // Completing a task removes it from "due today".
      qc.setQueryData<Task[]>(taskKeys.today(), (old) =>
        completed ? old?.filter((t) => t.id !== id) : old,
      );

      return { prevList, prevToday };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevList) qc.setQueryData(taskKeys.byList(listId), ctx.prevList);
      if (ctx?.prevToday) qc.setQueryData(taskKeys.today(), ctx.prevToday);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.byList(listId) });
      qc.invalidateQueries({ queryKey: taskKeys.today() });
      qc.invalidateQueries({ queryKey: taskListKeys.withProgress() });
    },
  });
}
