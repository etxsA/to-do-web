import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createTaskList,
  deleteTaskList,
  updateTaskList,
} from '@/services/tasklist.service';
import type { CreateTaskListRequest, UpdateTaskListRequest } from '@/types/api';
import { taskKeys, taskListKeys } from '@/utils/queryKeys';

export function useCreateTaskList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskListRequest) => createTaskList(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskListKeys.all }),
  });
}

export function useUpdateTaskList(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTaskListRequest) => updateTaskList(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskListKeys.all });
      qc.invalidateQueries({ queryKey: taskListKeys.detail(id) });
    },
  });
}

export function useDeleteTaskList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTaskList(id),
    onSuccess: () => {
      // A deleted list can orphan/remove tasks, so refresh both domains.
      qc.invalidateQueries({ queryKey: taskListKeys.all });
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
