import { Header } from '@/components/header';
import { samples, projects, tasks, personnel, results } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SamplesList } from '@/app/(app)/samples/samples-list';
import { Card, CardContent } from '@/components/ui/card';

export default function SamplesPage() {
    const samplesWithDetails = samples.map(sample => {
        const project = projects.find(p => p.id === sample.projectId);
        const task = tasks.find(t => t.id === sample.taskId);
        const person = personnel.find(p => p.id === sample.personnelId);
        const result = results.find(r => r.sampleId === sample.id);

        return {
            ...sample,
            projectName: project?.name,
            taskName: task?.name,
            personnelName: person?.name,
            status: result?.status || 'Pending',
            analyte: result?.analyte,
            concentration: result?.concentration,
            units: result?.units,
        };
    });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Samples" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold tracking-tight">
                Manage Samples
            </h2>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Sample
            </Button>
        </div>
        <Card>
            <CardContent className="p-0">
                <SamplesList samples={samplesWithDetails} />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
