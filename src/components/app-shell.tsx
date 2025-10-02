
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  FileText,
  Folder,
  LayoutDashboard,
  ShieldAlert,
  Users,
  TestTube
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/lib/types';
import Image from 'next/image';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [companyName, setCompanyName] = React.useState('AbateIQ');
  const [companyLogo, setCompanyLogo] = React.useState<string | null>(null);

  React.useEffect(() => {
    // In a real app, this would be fetched from a global state/context
    const storedName = localStorage.getItem('companyName');
    const storedLogo = localStorage.getItem('companyLogo');
    if (storedName) {
      setCompanyName(storedName);
    }
    if (storedLogo) {
      setCompanyLogo(storedLogo);
    }
  }, []);

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: Briefcase },
    { href: '/personnel', label: 'Personnel', icon: Users },
    { href: '/samples', label: 'Samples', icon: TestTube },
    { href: '/nea', label: 'NEA Tool', icon: FileText },
    { href: '/documents', label: 'Documents', icon: Folder },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            {companyLogo ? (
              <Image src={companyLogo} alt={`${companyName} Logo`} width={32} height={32} className="object-contain size-8" />
            ) : (
               <ShieldAlert className="text-primary size-8" />
            )}
            <h1 className="text-xl font-headline font-bold text-sidebar-foreground">
              {companyName}
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                 <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Can add user settings or other footer items here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
