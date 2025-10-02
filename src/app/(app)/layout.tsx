'use client';

import { AppShell } from '@/components/app-shell';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
             <div className="flex flex-col items-center gap-4">
                <ShieldAlert className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Loading & Securing Workspace...</p>
            </div>
        </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
