import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import type { Priority, Task } from '@/types/api'
import { taskSchema, type TaskValues } from '@/utils/validation'
import { dueDateToInput, inputToDueDate } from '@/utils/taskDates'
import { isApiError } from '@/utils/errors'
import { useUpdateTask } from '@/hooks/useTaskMutations'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PrioritySelect } from '@/components/tasks/PrioritySelect'

/**
 * Edit-task modal. PATCH /task/{id} is a FULL REPLACE, so we resend every field
 * — including the unchanged `isCompleted` and `taskListIds` (API.md §12).
 */
export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task?: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const update = useUpdateTask(task?.id ?? 0)
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskValues>({ resolver: zodResolver(taskSchema) })

  useEffect(() => {
    if (open && task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        dueDate: dueDateToInput(task.dueDate),
        taskListIds: task.taskListIds,
        isCompleted: task.completed,
      })
    }
  }, [open, task, reset])

  const onSubmit = async (values: TaskValues) => {
    if (!task) return
    try {
      await update.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        priority: values.priority as Priority,
        dueDate: inputToDueDate(values.dueDate),
        taskListIds: task.taskListIds,
        isCompleted: task.completed,
      })
      toast.success('Task updated')
      onOpenChange(false)
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Could not update the task')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-xs uppercase tracking-wide text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input id="edit-title" data-testid="input-edit-title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-desc" className="text-xs uppercase tracking-wide text-muted-foreground">
              Description
            </Label>
            <Textarea id="edit-desc" rows={3} data-testid="input-edit-description" {...register('description')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Date</Label>
              <Input type="date" data-testid="input-edit-due" {...register('dueDate')} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <PrioritySelect value={field.value as Priority} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-gradient"
              disabled={update.isPending}
              data-testid="btn-save-task"
            >
              {update.isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
