import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import { Dashboard } from '@/pages/app/Dashboard'
import { AuthTabs } from '@/pages/auth'

type InitialRoute = '/' | '/dashboard'
export const Routes = ({ initialRoute }: { initialRoute?: InitialRoute }) => {
  initialRoute = initialRoute ?? '/'
  const router = createMemoryRouter(
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
    {
      initialEntries: [initialRoute]
    }
  )
  return <RouterProvider router={router} />
}
