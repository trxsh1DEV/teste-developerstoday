'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store/userStore';
import { useEffect } from 'react';

function SessionSync() {
  const { data: session } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      clearUser();
    }
  }, [session, setUser, clearUser]);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SessionSync />
      {children}
    </NextAuthSessionProvider>
  );
}
