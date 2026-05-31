import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { Placeholder } from '@/app/Placeholder'
import { Login } from '@/routes/Login'
import { Register } from '@/routes/Register'
import { Dashboard } from '@/routes/Dashboard'
import { ListDetail } from '@/routes/ListDetail'

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
          { path: 'smart/:type', element: <Placeholder title="Smart List" /> },
          { path: 'search', element: <Placeholder title="Search" /> },
          { path: 'calendar', element: <Placeholder title="Calendar" /> },
          { path: 'board', element: <Placeholder title="Board" /> },
          { path: 'analytics', element: <Placeholder title="Analytics" /> },
          { path: 'about', element: <Placeholder title="About" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Placeholder title="404 — Not Found" /> },
])
