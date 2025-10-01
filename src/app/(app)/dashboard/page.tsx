import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { activeExceedances, samples } from '@/lib/data';
import { ActiveExceedances } from '@/components/dashboard/active-exceedances';
import { OverviewChart } from '@/components/dashboard/overview-chart';

export default function DashboardPage() {
  const pendingSampleCount = samples.filter(s => {
      const result = s.result;
      return !result || result.status === 'Pending';
  }).length;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Samples
              </CardTitle>
              <span className="text-sm font-bold text-primary">{pendingSampleCount}</span>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Samples awaiting lab analysis.
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
               <span className="text-sm font-bold text-primary">4</span>
            </CardHeader>
            <CardContent>
               <div className="text-xs text-muted-foreground">
                Active personnel on projects.
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
               <span className="text-sm font-bold text-primary">4</span>
            </CardHeader>
            <CardContent>
               <div className="text-xs text-muted-foreground">
                Projects with ongoing monitoring.
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Exceedances
              </CardTitle>
               <span className="text-sm font-bold text-destructive">{activeExceedances.length}</span>
            </CardHeader>
            <CardContent>
               <div className="text-xs text-muted-foreground">
                Active exposure limit alerts.
              </div>
            </CardContent>
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
            <ActiveExceedances exceedances={activeExceedances} />
          </div>
        </div>
      </main>
    </div>
  );
}
