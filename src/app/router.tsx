import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { Placeholder } from '@/app/Placeholder'

/**
 * Route table (WEB_HANDOFF §2). Auth screens are top-level; the rest render
 * inside RootLayout. `<ProtectedRoute>` wrapping is added in feature/auth.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <Placeholder title="Login" /> },
  { path: '/register', element: <Placeholder title="Register" /> },
  {
    path: '/',
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
  { path: '*', element: <Placeholder title="404 — Not Found" /> },
])
