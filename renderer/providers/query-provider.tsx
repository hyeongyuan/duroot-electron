import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAuthorizedError } from '../apis/github';

export const QueryProvider = ({ children }: { children: React.ReactNode}) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry(failureCount, error) {
          if (isAuthorizedError(error)) {
            return false;
          }
          return failureCount < 3;
        },
      }
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
