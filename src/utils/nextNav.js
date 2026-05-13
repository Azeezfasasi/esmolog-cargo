'use client';

import { useRouter } from 'next/navigation';

export function useNextNavigate() {
  const router = useRouter();
  return {
    push: router.push,
    replace: router.replace,
    back: () => router.back(),
  };
}

