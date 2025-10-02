
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { exceedances, personnel, projects } from '@/lib/data';
import { RecentExceedances } from '@/components/dashboard/recent-exceedances';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import Link from 'next/link';
import { Users, Briefcase, AlertTriangle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function DashboardPage() {
    const recentExceedances = exceedances.filter(e => {
        const exceedanceDate = new Date(e.exceedanceDate); // Correctly parse the date
        return differenceInDays(new Date(), exceedanceDate) <= 30;
    });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <Link href="/personnel">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{personnel.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Manage active personnel.
                  </p>
                </CardContent>
            </Link>
          </Card>
           <Card>
            <Link href="/projects">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.filter(p => p.status === 'Active').length}</div>
                  <p className="text-xs text-muted-foreground">
                    View projects with ongoing monitoring.
                  </p>
                </CardContent>
            </Link>
          </Card>
           <Card className={recentExceedances.length > 0 ? "hover:bg-destructive/10" : ""}>
             <Link href="/dashboard">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Exceedances
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${recentExceedances.length > 0 ? "text-destructive" : ""}`}>{recentExceedances.length}</div>
                   <p className="text-xs text-muted-foreground">
                    {recentExceedances.length > 0 ? 'Recent exposure limit alerts.' : 'No recent exposure alerts.'}
                  </p>
                </CardContent>
              </Link>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Personnel Exposure History</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <OverviewChart />
            </CardContent>
          </Card>
          <div className="space-y-4 md:space-y-8">
            <RecentExceedances exceedances={recentExceedances} />
          </div>
        </div>
      </main>
    </div>
  );
}
