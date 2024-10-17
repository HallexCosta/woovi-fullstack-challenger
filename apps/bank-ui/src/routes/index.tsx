import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { Dashboard } from '@/pages/app/Dashboard'
import { AuthTabs } from '@/pages/auth'

const router = createBrowserRouter(
  [
    {
      path: '/dashboard',
      element: <Dashboard />
    },
    {
      path: '/',
      element: <AuthTabs />
    }
  ],
  {}
)
export const Routes = () => <RouterProvider router={router} />
