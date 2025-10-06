
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Exceedance, Project, Sample, Personnel, Analyte } from '@/lib/types';
import { useMemo } from 'react';

export default function ExceedanceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const orgId = user?.orgId;

  const exceedanceRef = useMemoFirebase(() => {
    if (!orgId) return null;
    return doc(firestore, 'orgs', orgId, 'exceedances', id);
  }, [firestore, id, orgId]);
  const { data: exceedance, isLoading } = useDoc<Exceedance>(exceedanceRef);

  const { data: project } = useDoc<Project>(useMemoFirebase(() => (orgId && exceedance?.jobId) ? doc(firestore, 'orgs', orgId, 'jobs', exceedance.jobId) : null, [orgId, exceedance?.jobId]));
  const { data: sample } = useDoc<Sample>(useMemoFirebase(() => (orgId && exceedance?.sampleId) ? doc(firestore, 'orgs', orgId, 'samples', exceedance.sampleId) : null, [orgId, exceedance?.sampleId]));
  const { data: analyte } = useDoc<Analyte>(useMemoFirebase(() => (orgId && exceedance?.analyteId) ? doc(firestore, 'orgs', orgId, 'analytes', exceedance.analyteId) : null, [orgId, exceedance?.analyteId]));
  const { data: person } = useDoc<Personnel>(useMemoFirebase(() => (orgId && (sample as any)?.personnelId) ? doc(firestore, 'orgs', orgId, 'people', (sample as any).personnelId) : null, [orgId, sample]));


  const evidenceImage = PlaceHolderImages.find(img => img.id === 'doc-thumb-2');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!exceedance) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Exceedance: ${analyte?.name || exceedance.id}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-destructive">Exceedance Details</CardTitle>
            <CardDescription>
              Details for exceedance ID: {exceedance.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analyte</p>
                <p className="text-lg font-semibold">{analyte?.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concentration</p>
                <p className="text-lg font-semibold text-destructive">{exceedance.calculatedTWAorConc} {analyte?.unit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limit</p>
                <p className="text-lg font-semibold">{exceedance.thresholdValue} {analyte?.unit} ({exceedance.standardRef})</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Personnel</p>
                <p className="text-lg font-semibold">{person?.displayName || 'Loading...'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{project?.location || 'Loading...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Corrective Action</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Corrective action details would be displayed here.</p>
            </CardContent>
        </Card>

        {evidenceImage && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                    <Image 
                        src={evidenceImage.imageUrl} 
                        alt="Evidence photo"
                        width={600}
                        height={400}
                        className="rounded-md"
                        data-ai-hint={evidenceImage.imageHint}
                    />
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
