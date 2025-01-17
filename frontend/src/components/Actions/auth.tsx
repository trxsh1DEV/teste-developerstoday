'use client';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutButton({ name }: { name: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      {name}
    </Button>
  );
}
