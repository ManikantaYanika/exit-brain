import { QueryClient } from '@tanstack/react-query'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Don't hammer the API on auth/permission errors; retry transient ones once.
        retry: (failureCount, error) => {
          const status = (error as { status?: number } | null)?.status
          if (status === 401 || status === 403 || status === 404) return false
          return failureCount < 1
        },
      },
    },
  })
}
