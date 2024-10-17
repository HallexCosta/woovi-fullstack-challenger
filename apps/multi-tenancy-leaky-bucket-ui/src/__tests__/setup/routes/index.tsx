import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import App from '@/App'
import { AuthTabs } from '@/pages/auth'

type InitialRoute = '/' | '/dashboard'
export const Routes = ({ initialRoute }: { initialRoute?: InitialRoute }) => {
  initialRoute = initialRoute ?? '/'
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />
      }
    ],
    {
      initialEntries: [initialRoute]
    }
  )
  return <RouterProvider router={router} />
}
