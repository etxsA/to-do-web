import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { Placeholder } from '@/app/Placeholder'
import { Login } from '@/routes/Login'
import { Register } from '@/routes/Register'
import { Dashboard } from '@/routes/Dashboard'
import { ListDetail } from '@/routes/ListDetail'
import { Search } from '@/routes/Search'
import { SmartList } from '@/routes/SmartList'
import { About } from '@/routes/About'
import { Calendar } from '@/routes/Calendar'
import { Board } from '@/routes/Board'
import { Analytics } from '@/routes/Analytics'

/**
 * Route table (WEB_HANDOFF §2). Auth screens are top-level; everything else is
 * guarded by <ProtectedRoute> and rendered inside RootLayout.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'lists/:id', element: <ListDetail /> },
          { path: 'smart/:type', element: <SmartList /> },
          { path: 'search', element: <Search /> },
          { path: 'calendar', element: <Calendar /> },
          { path: 'board', element: <Board /> },
          { path: 'analytics', element: <Analytics /> },
          { path: 'about', element: <About /> },
        ],
      },
    ],
  },
  { path: '*', element: <Placeholder title="404 — Not Found" /> },
])
