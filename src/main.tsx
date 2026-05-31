import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { router } from '@/app/router'
import { queryClient } from '@/lib/queryClient'
import { AppBoot } from '@/app/AppBoot'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import '@/stores/themeStore' // initialize persisted theme (applies `dark` class)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppBoot>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster richColors closeButton />
        </TooltipProvider>
      </AppBoot>
    </QueryClientProvider>
  </StrictMode>,
)
