
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import Link from 'next/link';
import { Briefcase, FlaskConical, FileText, CheckCircle } from 'lucide-react';
import { differenceInDays, subDays } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Exceedance, Project, Sample, Survey, ExistingNea } from '@/lib/types';
import { useMemo } from 'react';
import { RecentExceedances } from '@/components/dashboard/recent-exceedances';


export default function DashboardPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const orgId = user?.orgId;

    const projectsQuery = useMemoFirebase(() => {
        if (!orgId) return null;
        return query(collection(firestore, 'orgs', orgId, 'jobs'));
    }, [firestore, orgId]);
    const { data: projectsData } = useCollection<Project>(projectsQuery);

    const samplesQuery = useMemoFirebase(() => {
        if (!orgId) return null;
        return query(collection(firestore, 'orgs', orgId, 'samples'));
    }, [firestore, orgId]);
    const { data: samplesData } = useCollection<Sample>(samplesQuery);

    const surveysQuery = useMemoFirebase(() => {
        if (!orgId) return null;
        return query(collection(firestore, 'orgs', orgId, 'surveys'));
    }, [firestore, orgId]);
    const { data: surveysData } = useCollection<Survey>(surveysQuery);

    const neasQuery = useMemoFirebase(() => {
        if (!orgId) return null;
        return query(collection(firestore, 'orgs', orgId, 'neas'));
    }, [firestore, orgId]);
    const { data: neasData } = useCollection<ExistingNea>(neasQuery);
    
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const exceedancesQuery = useMemoFirebase(() => {
        if (!orgId || !user?.uid) return null;
        return query(
            collection(firestore, 'orgs', orgId, 'exceedances'),
            where('exceedanceDate', '>=', thirtyDaysAgo),
            orderBy('exceedanceDate', 'desc')
        );
    }, [firestore, orgId, thirtyDaysAgo, user?.uid]);
    const { data: recentExceedances } = useCollection<Exceedance>(exceedancesQuery);


    const activeProjectsCount = useMemo(() => {
        if (!projectsData) return 0;
        return projectsData.filter(p => p.status === 'Active').length;
    }, [projectsData]);

    const surveysInProgressCount = useMemo(() => {
        if (!surveysData) return 0;
        return surveysData.filter(s => s.status === 'In Progress').length;
    }, [surveysData]);

    const activeNeasCount = useMemo(() => {
        if (!neasData) return 0;
        return neasData.filter(nea => {
            const effDate = new Date(nea.effectiveDate);
            const reviewDate = new Date(effDate.setFullYear(effDate.getFullYear() + 1));
            return new Date() < reviewDate;
        }).length;
    }, [neasData]);

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
              <OverviewChart samples={samplesData || []} />
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
                      <div className="text-2xl font-bold">{samplesData?.length || 0}</div>
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
            <RecentExceedances exceedances={recentExceedances || []} />
        </div>
      </main>
    </div>
  );
}
