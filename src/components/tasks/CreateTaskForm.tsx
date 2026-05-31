import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import type { Priority } from '@/types/api'
import { taskSchema, type TaskValues } from '@/utils/validation'
import { inputToDueDate } from '@/utils/taskDates'
import { isApiError } from '@/utils/errors'
import { useCreateTask } from '@/hooks/useTaskMutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PrioritySelect } from '@/components/tasks/PrioritySelect'

const defaults = (listId: number): TaskValues => ({
  title: '',
  description: '',
  priority: 'LOW' as Priority,
  dueDate: '',
  taskListIds: [listId],
  isCompleted: false,
})

/** Inline "Create New Task" form on the list-detail screen (Figma). */
export function CreateTaskForm({ listId }: { listId: number }) {
  const create = useCreateTask()
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskValues>({ resolver: zodResolver(taskSchema), defaultValues: defaults(listId) })

  const onSubmit = async (values: TaskValues) => {
    try {
      await create.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        priority: values.priority as Priority,
        dueDate: inputToDueDate(values.dueDate),
        taskListIds: [listId],
      })
      toast.success('Task added')
      reset(defaults(listId))
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Could not add the task')
    }
  }

  return (
    <div className="rounded-2xl bg-secondary/40 p-6">
      <h3 className="mb-5 flex items-center gap-2 font-display text-xl font-extrabold text-foreground">
        <CheckCircle2 className="size-5 text-primary" /> Create New Task
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Task Title
          </Label>
          <Input
            placeholder="e.g. Study for finals"
            className="bg-card"
            data-testid="input-task-title"
            {...register('title')}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Description
          </Label>
          <Textarea
            rows={3}
            placeholder="Add more details about this task…"
            className="bg-card"
            data-testid="input-task-description"
            {...register('description')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Due Date
            </Label>
            <Input type="date" className="bg-card" data-testid="input-task-due" {...register('dueDate')} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Priority
            </Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <PrioritySelect value={field.value as Priority} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="btn-gradient w-full"
          size="lg"
          disabled={create.isPending}
          data-testid="btn-add-task"
        >
          {create.isPending && <Loader2 className="size-4 animate-spin" />}
          Add to List
        </Button>
      </form>
    </div>
  )
}
