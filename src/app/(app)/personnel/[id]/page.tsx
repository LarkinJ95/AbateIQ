import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { personnel, samples } from '@/lib/data';
import { notFound } from 'next/navigation';
import { format, isPast, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { OverviewChart } from '@/components/dashboard/overview-chart';

export default function PersonnelDetailsPage({ params }: { params: { id: string } }) {
  const person = personnel.find(p => p.id === params.id);

  if (!person) {
    notFound();
  }

  const getStatus = (dateString: string) => {
    const date = new Date(dateString);
    if (isPast(date)) {
      return { text: 'Expired', variant: 'destructive' as const };
    }
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 30) {
      return { text: `Due in ${daysUntil} days`, variant: 'secondary' as const };
    }
    return { text: 'Current', variant: 'default' as const };
  };

  const fitTestStatus = getStatus(person.fitTestDueDate);
  const medicalClearanceStatus = getStatus(person.medicalClearanceDueDate);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Personnel: ${person.name}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Personnel Details</CardTitle>
            <CardDescription>
              Certification and compliance status for {person.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                <p className="text-lg font-semibold">{person.employeeId}</p>
              </div>
              <div></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fit Test Due Date</p>
                <p className="text-lg font-semibold">{format(new Date(person.fitTestDueDate), 'PPP')}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Fit Test Status</p>
                <Badge variant={fitTestStatus.variant}>{fitTestStatus.text}</Badge>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Medical Clearance Due</p>
                <p className="text-lg font-semibold">{format(new Date(person.medicalClearanceDueDate), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medical Status</p>
                <Badge variant={medicalClearanceStatus.variant}>{medicalClearanceStatus.text}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Exposure History</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <OverviewChart />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
