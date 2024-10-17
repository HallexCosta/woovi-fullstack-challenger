import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/fonts.css'
import './index.css'
import { Routes } from '@/routes'
import { Providers } from './components/Providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <Routes />
    </Providers>
  </StrictMode>
)
