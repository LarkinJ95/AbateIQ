
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { exceedances, personnel, projects, samples, surveys, existingNeas } from '@/lib/data';
import { RecentExceedances } from '@/components/dashboard/recent-exceedances';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import Link from 'next/link';
import { Users, Briefcase, AlertTriangle, FlaskConical, FileText, CheckCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function DashboardPage() {
    const recentExceedances = exceedances.filter(e => {
        const exceedanceDate = new Date(e.exceedanceDate);
        return differenceInDays(new Date(), exceedanceDate) <= 30;
    });

    const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
    const surveysInProgressCount = surveys.filter(s => s.status === 'In Progress').length;
    const activeNeasCount = existingNeas.filter(nea => {
        const effDate = new Date(nea.effectiveDate);
        const reviewDate = new Date(effDate.setFullYear(effDate.getFullYear() + 1));
        return new Date() < reviewDate;
    }).length;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Average Results (Last 90 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <OverviewChart />
            </CardContent>
          </Card>
          
          {/* Stat Cards */}
          <div className="space-y-4">
              <Card>
                <Link href="/projects">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Projects
                      </CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{activeProjectsCount}</div>
                      <p className="text-xs text-muted-foreground">
                        View projects with ongoing monitoring.
                      </p>
                    </CardContent>
                </Link>
              </Card>
              <Card>
                <Link href="/air-monitoring">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Air Samples
                      </CardTitle>
                      <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{samples.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Manage all logged air samples.
                      </p>
                    </CardContent>
                </Link>
              </Card>
              <Card>
                <Link href="/surveys">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Surveys In Progress
                      </CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{surveysInProgressCount}</div>
                      <p className="text-xs text-muted-foreground">
                        View and manage ongoing surveys.
                      </p>
                    </CardContent>
                </Link>
              </Card>
              <Card>
                <Link href="/nea">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active NEAs
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{activeNeasCount}</div>
                      <p className="text-xs text-muted-foreground">
                        Manage negative exposure assessments.
                      </p>
                    </CardContent>
                </Link>
              </Card>
          </div>
        </div>

        <div className="grid gap-4 md:gap-8">
            <RecentExceedances exceedances={recentExceedances} />
        </div>
      </main>
    </div>
  );
}
