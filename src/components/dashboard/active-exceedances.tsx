import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Exceedance } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

interface ActiveExceedancesProps {
  exceedances: Exceedance[];
}

export function ActiveExceedances({ exceedances }: ActiveExceedancesProps) {
  if (exceedances.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-headline">Active Exceedances</AlertTitle>
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
            <Button variant="destructive" size="sm">Details</Button>
      </AlertDescription>
      ))}
    </Alert>
  );
}
