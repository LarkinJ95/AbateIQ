
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
  TestTube,
  FlaskConical,
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
import { Logo } from './logo';

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
    { href: '/air-monitoring', label: 'Air Monitoring', icon: FlaskConical },
    { href: '/surveys', label: 'Surveys', icon: FileText },
    { href: '/nea', label: 'NEA Tool', icon: FileText },
    { href: '/documents', label: 'Documents', icon: Folder },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center p-2">
            {companyLogo ? (
              <Image src={companyLogo} alt={`${companyName} Logo`} width={48} height={48} className="object-contain size-12" />
            ) : (
              <Logo className="w-auto h-10" />
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                 <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
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
