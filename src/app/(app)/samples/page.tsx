'use client';

import { Header } from '@/components/header';
import { samples as initialSamples, projects, tasks, personnel } from '@/lib/data';
import { SamplesList } from '@/app/(app)/samples/samples-list';
import { Card, CardContent } from '@/components/ui/card';
import { AddSampleDialog } from './add-sample-dialog';
import { useState } from 'react';
import type { Sample } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function SamplesPage() {
    const [samples, setSamples] = useState(initialSamples);

    const samplesWithDetails = samples.map(sample => {
        const project = projects.find(p => p.id === sample.projectId);
        const task = tasks.find(t => t.id === sample.taskId);
        const person = personnel.find(p => p.id === sample.personnelId);
        const result = sample.result;

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

    const handleSaveSample = (newSampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string }) => {
        if (newSampleData.id) {
            // Edit existing sample
            setSamples(prevSamples => prevSamples.map(s => s.id === newSampleData.id ? { ...s, ...newSampleData, duration: 0, volume: 0 } as Sample : s));
        } else {
            // Add new sample
            const newSample: Sample = {
                ...newSampleData,
                id: `samp-${Math.floor(Math.random() * 1000)}`,
                duration: 0, // Should be calculated
                volume: 0, // Should be calculated
            };
            setSamples(prevSamples => [newSample, ...prevSamples]);
        }
    };

    const handleDeleteSample = (sampleId: string) => {
        setSamples(prevSamples => prevSamples.filter(s => s.id !== sampleId));
    };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Samples" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold tracking-tight">
                Manage Samples
            </h2>
            <AddSampleDialog onSave={handleSaveSample} sample={null}>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Sample
                </Button>
            </AddSampleDialog>
        </div>
        <Card>
            <CardContent className="p-0">
                <SamplesList samples={samplesWithDetails} onSave={handleSaveSample} onDelete={handleDeleteSample}/>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
