
'use client';

import { Header } from '@/components/header';
import { samples as initialSamples, projects, tasks, personnel } from '@/lib/data';
import { SamplesList } from '@/app/(app)/samples/samples-list';
import { Card, CardContent } from '@/components/ui/card';
import { AddSampleDialog } from './add-sample-dialog';
import { useState } from 'react';
import type { Sample, Result } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { differenceInMinutes, parse } from 'date-fns';

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

    const handleSaveSample = (newSampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string, result?: Partial<Result> }) => {
        const getMinutes = (start: string, stop: string) => {
            if (start && stop) {
                try {
                    const startDate = parse(start, 'yyyy-MM-dd HH:mm', new Date());
                    const stopDate = parse(stop, 'yyyy-MM-dd HH:mm', new Date());
                    if (stopDate > startDate) {
                        return differenceInMinutes(stopDate, startDate);
                    }
                } catch (e) { return 0; }
            }
            return 0;
        }

        const duration = getMinutes(newSampleData.startTime, newSampleData.stopTime);
        const volume = duration * newSampleData.flowRate;
        
        let resultPayload: Result | undefined = undefined;
        if(newSampleData.result?.analyte) {
            const existingResult = newSampleData.id ? samples.find(s => s.id === newSampleData.id)?.result : undefined;
            resultPayload = {
                id: existingResult?.id || `res-${Math.random()}`,
                sampleId: newSampleData.id || '',
                analyte: newSampleData.result.analyte,
                concentration: newSampleData.result.concentration ?? 0,
                status: newSampleData.result.concentration !== undefined ? 'OK' : 'Pending', // Add your logic for status
                method: existingResult?.method || '',
                units: existingResult?.units || '',
                reportingLimit: existingResult?.reportingLimit || 0,
                lab: existingResult?.lab || '',
            }
        }


        if (newSampleData.id) {
            // Edit existing sample
            setSamples(prevSamples => prevSamples.map(s => s.id === newSampleData.id ? { 
                ...s, 
                ...newSampleData, 
                duration,
                volume,
                result: resultPayload ? {...s.result, ...resultPayload} as Result : s.result,
            } as Sample : s));
        } else {
            // Add new sample
            const newSample: Sample = {
                ...newSampleData,
                id: `samp-${Math.floor(Math.random() * 10000)}`,
                duration,
                volume,
                result: resultPayload,
            };
            if(resultPayload) resultPayload.sampleId = newSample.id;

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
