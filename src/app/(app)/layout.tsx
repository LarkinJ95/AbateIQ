
'use client';

import { AppShell } from '@/components/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // All authentication checks have been removed to allow for development.
  // The app will no longer redirect to the login page.
  // The useUser hook and related logic have been commented out.
  /*
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
  */

  return <AppShell>{children}</AppShell>;
}
