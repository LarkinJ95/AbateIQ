
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound, useParams } from 'next/navigation';
import { format, isPast, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { AddPersonnelDialog } from '../add-personnel-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Personnel, Sample, Project, Task } from '@/lib/types';
import { useMemo } from 'react';

export default function PersonnelDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const orgId = user?.orgId;

  const personRef = useMemoFirebase(() => {
    if(!orgId) return null;
    return doc(firestore, 'orgs', orgId, 'personnel', id)
  }, [firestore, id, orgId]);
  const { data: person, isLoading: personLoading } = useDoc<Personnel>(personRef);

  const personSamplesQuery = useMemoFirebase(() => {
    if (!id || !orgId) return null;
    return query(collection(firestore, 'orgs', orgId, 'samples'), where('personnelId', '==', id));
  }, [firestore, id, orgId]);
  const { data: personSamples, isLoading: samplesLoading } = useCollection<Sample>(personSamplesQuery);

  const projectsQuery = useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'projects')) : null, [firestore, orgId]);
  const { data: projects } = useCollection<Project>(projectsQuery);

  const tasksQuery = useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'tasks')) : null, [firestore, orgId]);
  const { data: tasks } = useCollection<Task>(tasksQuery);


  const personSamplesWithDetails = useMemo(() => {
    if (!personSamples || !projects || !tasks) return [];
    return personSamples
      .map(sample => {
        const project = projects.find(p => p.id === sample.projectId);
        const task = tasks.find(t => t.id === sample.taskId);
        return {
          ...sample,
          projectName: project?.name || 'N/A',
          taskName: task?.name || 'N/A',
        };
      });
  }, [personSamples, projects, tasks]);

  if (personLoading) {
    return <div>Loading...</div>
  }

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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Personnel Details</CardTitle>
              <CardDescription>
                Certification and compliance status for {person.name}.
              </CardDescription>
            </div>
            <AddPersonnelDialog person={person}>
                <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Personnel</span>
                </Button>
            </AddPersonnelDialog>
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
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Exposure Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 h-[300px]">
                    <OverviewChart samples={personSamples || []} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Exposure History</CardTitle>
                    <CardDescription>A log of all samples taken for this individual.</CardDescription>
                </CardHeader>
                <CardContent>
                    {samplesLoading ? (
                      <p>Loading samples...</p>
                    ) : (
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Sample ID</TableHead>
                                  <TableHead>Project</TableHead>
                                  <TableHead>Result</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {personSamplesWithDetails.map(sample => (
                                  <TableRow key={sample.id}>
                                      <TableCell>
                                          <Link href={`/samples/${sample.id}`} className="hover:underline font-medium">
                                              {sample.id}
                                          </Link>
                                      </TableCell>
                                      <TableCell>{sample.projectName}</TableCell>
                                      <TableCell>
                                          {sample.result?.concentration !== undefined ? `${sample.result.concentration} ${sample.result.units}` : 'Pending'}
                                      </TableCell>
                                  </TableRow>
                              ))}
                              {personSamplesWithDetails.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center">No samples found for this person.</TableCell>
                                </TableRow>
                              )}
                          </TableBody>
                      </Table>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
