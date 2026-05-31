import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Circle, Search as SearchIcon, X } from 'lucide-react'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useSearch } from '@/hooks/useSearch'
import { formatDueDate } from '@/utils/format'
import { ListIcon } from '@/components/lists/ListIcon'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'

export function Search() {
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const debounced = useDebouncedValue(term, 350)
  const query = useSearch(debounced)

  // Keep the URL ?q in sync with the debounced term (shareable / back-button).
  useEffect(() => {
    setParams(debounced ? { q: debounced } : {}, { replace: true })
  }, [debounced, setParams])

  const result = query.data
  const matches = (result?.taskLists.length ?? 0) + (result?.tasks.length ?? 0)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Search
        </h1>
        <p className="text-muted-foreground">Find anything across your projects and tasks.</p>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search lists and tasks…"
          aria-label="Search"
          data-testid="input-search"
          className="h-14 rounded-xl pl-14 pr-12 text-lg"
        />
        {term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {debounced.trim() && (
        <p className="text-sm text-muted-foreground">
          Search results for <span className="font-medium text-foreground">"{debounced}"</span>
          {result && (
            <>
              {' '}
              · <span className="font-semibold text-primary">{matches} matches found</span>
            </>
          )}
        </p>
      )}

      {!debounced.trim() ? (
        <EmptyState
          icon={SearchIcon}
          title="Start typing to search"
          description="Search across your lists and tasks by name or description."
        />
      ) : query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : matches === 0 ? (
        <EmptyState title="No matches" description={`Nothing found for "${debounced}".`} />
      ) : (
        <div className="space-y-1">
          <p className="border-b border-border pb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Matched Items
          </p>
          {result?.taskLists.map((list) => (
            <Link
              key={`list-${list.id}`}
              to={`/lists/${list.id}`}
              className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-muted"
            >
              <ListIcon icon={list.icon} color={list.color} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display font-bold text-foreground">{list.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">LIST</Badge>
                </div>
                {list.description && (
                  <p className="truncate text-sm text-muted-foreground">{list.description}</p>
                )}
              </div>
            </Link>
          ))}
          {result?.tasks.map((task) => (
            <div
              key={`task-${task.id}`}
              className="flex items-center gap-4 rounded-xl p-4"
              data-testid="search-task"
            >
              <div
                className="flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: task.completed ? '#DCFCE7' : `${task.taskListColor ?? '#005BBF'}1F` }}
              >
                {task.completed ? (
                  <CheckCircle2 className="size-5 text-success" />
                ) : (
                  <Circle className="size-5" style={{ color: task.taskListColor ?? '#005BBF' }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      'truncate font-display font-bold',
                      task.completed ? 'text-muted-foreground line-through' : 'text-foreground',
                    )}
                  >
                    {task.title}
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {task.completed ? 'DONE' : 'TASK'}
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {task.completed
                    ? task.dueDate
                      ? `Completed · ${formatDueDate(task.dueDate)}`
                      : 'Completed'
                    : task.dueDate
                      ? `Due ${formatDueDate(task.dueDate)}`
                      : 'No due date'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
