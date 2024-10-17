import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import App from '@/App'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />
    }
  ],
  {}
)
export const Routes = () => <RouterProvider router={router} />
