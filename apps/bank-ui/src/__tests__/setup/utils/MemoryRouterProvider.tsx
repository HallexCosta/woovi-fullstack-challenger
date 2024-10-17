import { useMemo } from 'react'
import { Router, createMemoryRouter } from 'react-router-dom'

import { RouterProvider } from 'react-router-dom'

export const MemoryRouterProvider = ({ defaultElement }) => {
  const router = useMemo(() => {
    return [
      {
        path: '/',
        element: defaultElement
      }
    ]
  }, [defaultElement])

  return (
    <RouterProvider
      router={createMemoryRouter(router, { initialEntries: ['/'] })}
    />
  )
}
