
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Sample, Project, Task, Personnel } from '@/lib/types';
import { useMemo } from 'react';

export default function SampleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const sampleRef = useMemoFirebase(() => doc(firestore, 'samples', id), [firestore, id]);
  const { data: sample, isLoading: sampleLoading } = useDoc<Sample>(sampleRef);

  const projectId = sample?.projectId;
  const taskId = sample?.taskId;
  const personnelId = sample?.personnelId;

  const projectRef = useMemoFirebase(() => projectId ? doc(firestore, 'projects', projectId) : null, [firestore, projectId]);
  const { data: project } = useDoc<Project>(projectRef);

  const taskRef = useMemoFirebase(() => taskId ? doc(firestore, 'tasks', taskId) : null, [firestore, taskId]);
  const { data: task } = useDoc<Task>(taskRef);

  const personnelRef = useMemoFirebase(() => personnelId ? doc(firestore, 'personnel', personnelId) : null, [firestore, personnelId]);
  const { data: person } = useDoc<Personnel>(personnelRef);

  if (sampleLoading) {
    return <div>Loading...</div>;
  }

  if (!sample) {
    notFound();
  }

  const result = sample.result;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Sample: ${sample.id}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sample Details</CardTitle>
            <CardDescription>
              Detailed information for sample ID: {sample.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project</p>
                <p className="text-lg font-semibold">{project?.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Task</p>
                <p className="text-lg font-semibold">{task?.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Personnel</p>
                <p className="text-lg font-semibold">{person?.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                <p className="text-lg font-semibold">{sample.startTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stop Time</p>
                <p className="text-lg font-semibold">{sample.stopTime}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{sample.duration} min</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Flow Rate</p>
                <p className="text-lg font-semibold">{sample.flowRate} L/min</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Volume</p>
                <p className="text-lg font-semibold">{sample.volume} L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Lab Result</CardTitle>
            </CardHeader>
            <CardContent>
               {result ? (
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-lg font-semibold">{result.status}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Analyte</p>
                        <p className="text-lg font-semibold">{result.analyte}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Concentration</p>
                        <p className="text-lg font-semibold">{result.concentration > 0 ? `${result.concentration} ${result.units}` : 'Not Detected'}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">Method</p>
                        <p className="text-lg font-semibold">{result.method}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">Reporting Limit</p>
                        <p className="text-lg font-semibold">{result.reportingLimit} {result.units}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">Lab</p>
                        <p className="text-lg font-semibold">{result.lab}</p>
                    </div>
                 </div>
               ) : (
                <p>Results are still pending for this sample.</p>
               )}
            </CardContent>
        </Card>

      </main>
    </div>
  );
}

    