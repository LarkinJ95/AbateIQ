import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Exceedance } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface RecentExceedancesProps {
  exceedances: Exceedance[];
}

export function RecentExceedances({ exceedances }: RecentExceedancesProps) {
  if (exceedances.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Exceedances (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">No exceedances have been recorded in the last 30 days.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-headline">Exceedances (Last 30 Days)</AlertTitle>
      {exceedances.map((exceedance) => (
         <AlertDescription key={exceedance.id} className="mt-2 flex justify-between items-center">
            <div>
                <p>
                    <strong>{exceedance.analyte}:</strong> {exceedance.concentration} (Limit: {exceedance.limit})
                </p>
                <p className="text-xs">
                    {exceedance.personnel} at {exceedance.location}
                </p>
            </div>
            <Button variant="destructive" size="sm" asChild>
              <Link href={`/exceedances/${exceedance.id}`}>Details</Link>
            </Button>
      </AlertDescription>
      ))}
    </Alert>
  );
}
