
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { existingNeas } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function NeaDetailsPage({ params }: { params: { id: string } }) {
  const nea = existingNeas.find(e => e.id === params.id);

  if (!nea) {
    notFound();
  }

  const getStatusVariant = (status: "Active" | "Expired") => {
    return status === "Active" ? "default" : "outline";
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`NEA: ${nea.project}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Assessment Details</CardTitle>
            <CardDescription>
              Details for Negative Exposure Assessment: {nea.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project</p>
                <p className="text-lg font-semibold">{nea.project}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Task</p>
                <p className="text-lg font-semibold">{nea.task}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analyte</p>
                <p className="text-lg font-semibold">{nea.analyte}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                 <Badge variant={getStatusVariant(nea.status)}>{nea.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Effective Date</p>
                <p className="text-lg font-semibold">{nea.effectiveDate}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Next Review Date</p>
                <p className="text-lg font-semibold">{nea.reviewDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Assessment Document</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-8 bg-muted/50 rounded-lg">
                <FileText className="w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground">No assessment document has been generated or uploaded yet.</p>
                 <Button disabled>View Document</Button>
            </CardContent>
        </Card>

        {nea.supportingSampleIds && nea.supportingSampleIds.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Supporting Samples</CardTitle>
                </CardHeader>
                <CardContent>
                   <p>This NEA is supported by {nea.supportingSampleIds.length} sample(s).</p>
                   {/* We can list sample details here later */}
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
