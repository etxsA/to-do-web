import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import type { TaskList } from '@/types/api'
import { taskListSchema, type TaskListValues } from '@/utils/validation'
import { isApiError } from '@/utils/errors'
import { useCreateTaskList, useUpdateTaskList } from '@/hooks/useTaskListMutations'
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
import { ColorPicker } from '@/components/lists/ColorPicker'
import { IconPicker } from '@/components/lists/IconPicker'

const DEFAULTS: TaskListValues = {
  name: '',
  description: '',
  color: '#005BBF',
  iconId: 1,
}

export function ListFormDialog({
  open,
  onOpenChange,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present → edit mode; absent → create mode. */
  list?: TaskList
}) {
  const isEdit = Boolean(list)
  const create = useCreateTaskList()
  const update = useUpdateTaskList(list?.id ?? 0)
  const pending = create.isPending || update.isPending

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskListValues>({ resolver: zodResolver(taskListSchema), defaultValues: DEFAULTS })

  // Sync form when opening (prefill for edit, clear for create).
  useEffect(() => {
    if (!open) return
    reset(
      list
        ? { name: list.name, description: list.description, color: list.color, iconId: list.icon?.id ?? 1 }
        : DEFAULTS,
    )
  }, [open, list, reset])

  const color = watch('color')

  const onSubmit = async (values: TaskListValues) => {
    try {
      if (isEdit && list) {
        await update.mutateAsync(values)
        toast.success('List updated')
      } else {
        await create.mutateAsync(values)
        toast.success('List created')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Could not save the list')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">
            {isEdit ? 'Edit List' : 'Create New List'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Thesis Research"
              data-testid="input-list-name"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Optional notes about this list…"
              data-testid="input-list-description"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Theme Color</Label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-3">
            <Label>Icon</Label>
            <Controller
              control={control}
              name="iconId"
              render={({ field }) => (
                <IconPicker value={field.value} onChange={field.onChange} color={color} />
              )}
            />
            {errors.iconId && <p className="text-sm text-destructive">{errors.iconId.message}</p>}
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-gradient flex-1"
              disabled={pending}
              data-testid="btn-save-list"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
