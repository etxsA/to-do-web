import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  Download,
  KanbanSquare,
  LayoutDashboard,
  ListTodo,
  Plus,
  Search as SearchIcon,
  User,
} from 'lucide-react'

import { useTaskListsWithProgress } from '@/hooks/useTaskLists'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useUiStore } from '@/stores/uiStore'
import { exportTasks } from '@/utils/export'
import { SMART_LIST_ORDER, SMART_LISTS } from '@/utils/smartLists'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

/** Global ⌘K / Ctrl+K command palette: jump to any screen, list, or task and
 *  run quick actions (create list, export). */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const setCreateListOpen = useUiStore((s) => s.setCreateListOpen)
  const lists = useTaskListsWithProgress()
  const { tasks } = useAllTasks()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  const allLists = lists.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Search and jump">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => navigate('/'))}>
            <LayoutDashboard className="size-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/search'))}>
            <SearchIcon className="size-4" /> Search
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/calendar'))}>
            <CalendarDays className="size-4" /> Calendar
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/board'))}>
            <KanbanSquare className="size-4" /> Board
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/analytics'))}>
            <BarChart3 className="size-4" /> Analytics
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/about'))}>
            <User className="size-4" /> About / Profile
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Smart lists">
          {SMART_LIST_ORDER.map((type) => (
            <CommandItem key={type} onSelect={() => run(() => navigate(`/smart/${type}`))}>
              <ListTodo className="size-4" /> {SMART_LISTS[type].title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              run(() => {
                navigate('/')
                setCreateListOpen(true)
              })
            }
          >
            <Plus className="size-4" /> Create new list
          </CommandItem>
          <CommandItem onSelect={() => run(() => exportTasks(tasks, 'csv'))}>
            <Download className="size-4" /> Export tasks (CSV)
          </CommandItem>
          <CommandItem onSelect={() => run(() => exportTasks(tasks, 'json'))}>
            <Download className="size-4" /> Export tasks (JSON)
          </CommandItem>
          <CommandItem onSelect={() => run(() => exportTasks(tasks, 'ics'))}>
            <Download className="size-4" /> Export tasks (iCal)
          </CommandItem>
        </CommandGroup>

        {allLists.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Lists">
              {allLists.map((list) => (
                <CommandItem
                  key={list.id}
                  value={`list ${list.name}`}
                  onSelect={() => run(() => navigate(`/lists/${list.id}`))}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: list.color }} />
                  {list.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {tasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {tasks.slice(0, 50).map((task) => (
                <CommandItem
                  key={task.id}
                  value={`task ${task.title}`}
                  onSelect={() =>
                    run(() => navigate(`/lists/${task.taskListIds[0] ?? ''}`))
                  }
                >
                  <ListTodo className="size-4" /> {task.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
