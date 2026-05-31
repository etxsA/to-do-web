import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { Placeholder } from '@/app/Placeholder'
import { Login } from '@/routes/Login'
import { Register } from '@/routes/Register'

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
      { index: true, element: <Placeholder title="Dashboard" /> },
      { path: 'lists/new', element: <Placeholder title="New List" /> },
      { path: 'lists/:id', element: <Placeholder title="List Detail" /> },
      { path: 'lists/:id/edit', element: <Placeholder title="Edit List" /> },
      { path: 'tasks/new', element: <Placeholder title="New Task" /> },
      { path: 'tasks/:id/edit', element: <Placeholder title="Edit Task" /> },
      { path: 'smart/:type', element: <Placeholder title="Smart List" /> },
      { path: 'search', element: <Placeholder title="Search" /> },
      { path: 'calendar', element: <Placeholder title="Calendar" /> },
      { path: 'board', element: <Placeholder title="Board" /> },
      { path: 'analytics', element: <Placeholder title="Analytics" /> },
      { path: 'profile', element: <Placeholder title="Profile" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Placeholder title="404 — Not Found" /> },
])
