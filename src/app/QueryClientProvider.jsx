'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ProfileProvider } from '@/components/context-api/UseProfile';

const queryClient = new QueryClient();

export default function QuerClientProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </QueryClientProvider>
  );
}
