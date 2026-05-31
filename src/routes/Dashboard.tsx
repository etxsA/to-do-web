import { useEffect, useState } from 'react'
import { Circle, Plus } from 'lucide-react'
import { toast } from 'sonner'

import type { TaskList } from '@/types/api'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useToday } from '@/hooks/useTasks'
import { useTaskListsWithProgress } from '@/hooks/useTaskLists'
import { useDeleteTaskList } from '@/hooks/useTaskListMutations'
import { isApiError } from '@/utils/errors'
import { formatDueTime } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { TaskListCard } from '@/components/lists/TaskListCard'
import { ListFormDialog } from '@/components/lists/ListFormDialog'
import { SmartCardsRow } from '@/components/lists/SmartCardsRow'

export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const today = useToday()
  const lists = useTaskListsWithProgress()
  const del = useDeleteTaskList()

  const [createOpen, setCreateOpen] = useState(false)
  const [editList, setEditList] = useState<TaskList | undefined>()
  const [deleteList, setDeleteList] = useState<TaskList | undefined>()

  // Allow the ⌘K palette to open the create-list dialog.
  const uiCreateOpen = useUiStore((s) => s.createListOpen)
  const setUiCreateOpen = useUiStore((s) => s.setCreateListOpen)
  useEffect(() => {
    if (uiCreateOpen) {
      setCreateOpen(true)
      setUiCreateOpen(false)
    }
  }, [uiCreateOpen, setUiCreateOpen])

  const firstName = user?.fullName?.split(' ')[0] ?? 'Scholar'
  const todayTasks = today.data ?? []
  const hasHigh = todayTasks.some((t) => t.priority === 'HIGH')
  const allLists = lists.data?.pages.flatMap((p) => p.items) ?? []

  const onDelete = async () => {
    if (!deleteList) return
    try {
      await del.mutateAsync(deleteList.id)
      toast.success('List deleted')
      setDeleteList(undefined)
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Could not delete the list')
    }
  }

  return (
    <div className="space-y-10">
      {/* Header cards */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {todayTasks.length > 0
              ? `You have ${todayTasks.length} task${todayTasks.length === 1 ? '' : 's'} scheduled for today. Here's a quick overview of your progress.`
              : 'Nothing due today — a great time to plan ahead.'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">Due Today</h2>
            {hasHigh && (
              <span className="text-xs font-semibold text-destructive">High Priority</span>
            )}
          </div>
          {today.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">All clear for today. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {todayTasks.slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <Circle
                    className="mt-0.5 size-3 shrink-0"
                    style={{ color: t.priority === 'HIGH' ? '#BA1A1A' : '#005BBF' }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.title}</p>
                    {t.dueDate && (
                      <p className="text-xs text-muted-foreground">{formatDueTime(t.dueDate)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Smart lists */}
      <SmartCardsRow />

      {/* Study Lists */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">Study Lists</h2>
          <Button
            variant="outline"
            className="border-2 border-primary font-bold text-primary hover:bg-primary-soft"
            onClick={() => setCreateOpen(true)}
            data-testid="btn-create-list"
          >
            <Plus className="size-4" /> Create New List
          </Button>
        </div>

        {lists.isPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : lists.isError ? (
          <ErrorState error={lists.error} onRetry={() => lists.refetch()} />
        ) : allLists.length === 0 ? (
          <EmptyState
            title="No lists yet"
            description="Create your first study list to start organizing tasks."
            action={
              <Button className="btn-gradient" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" /> Create New List
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allLists.map((list) => (
                <TaskListCard
                  key={list.id}
                  list={list}
                  onEdit={() => setEditList(list)}
                  onDelete={() => setDeleteList(list)}
                />
              ))}
            </div>
            {lists.hasNextPage && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => lists.fetchNextPage()}
                  disabled={lists.isFetchingNextPage}
                >
                  {lists.isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <ListFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ListFormDialog
        open={Boolean(editList)}
        onOpenChange={(o) => !o && setEditList(undefined)}
        list={editList}
      />
      <ConfirmDialog
        open={Boolean(deleteList)}
        onOpenChange={(o) => !o && setDeleteList(undefined)}
        title="Delete this list?"
        description={`"${deleteList?.name}" and its tasks will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onConfirm={onDelete}
      />
    </div>
  )
}
