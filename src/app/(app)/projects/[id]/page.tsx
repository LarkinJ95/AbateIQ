
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { projects, samples as initialSamples, tasks, personnel } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useState } from 'react';
import type { Sample } from '@/lib/types';
import { AddSampleDialog } from '@/app/(app)/samples/add-sample-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = projects.find(p => p.id === params.id);
  
  if (!project) {
    notFound();
  }

  const { toast } = useToast();
  const [samples, setSamples] = useState(initialSamples.filter(s => s.projectId === project.id));

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  
  const projectSamples = samples
    .map(sample => {
        const task = tasks.find(t => t.id === sample.taskId);
        const person = personnel.find(p => p.id === sample.personnelId);
        return {
            ...sample,
            taskName: task?.name || 'N/A',
            personnelName: person?.name || 'N/A',
            status: sample.result?.status || 'Pending',
        }
    });

  const getStatusVariant = (status: "Active" | "Completed" | "On Hold") => {
    switch (status) {
      case "Active":
        return "default";
      case "Completed":
        return "secondary";
      case "On Hold":
        return "outline";
      default:
        return "default";
    }
  };

  const getSampleStatusVariant = (status: string) => {
    switch (status) {
      case '>PEL':
      case '>EL':
        return 'destructive';
      case '≥AL':
        return 'secondary';
      case 'OK':
        return 'default';
      default:
        return 'outline';
    }
  };
  
  const handleSaveSample = (newSampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string }) => {
      if (newSampleData.id) {
          // Edit existing sample
          setSamples(prevSamples => prevSamples.map(s => s.id === newSampleData.id ? { ...s, ...newSampleData, duration: 0, volume: 0 } as Sample : s));
      } else {
          // Add new sample
          const newSample: Sample = {
              ...newSampleData,
              projectId: project.id, // Ensure it's for the current project
              id: `samp-${Math.floor(Math.random() * 1000)}`,
              duration: 0, // Should be calculated
              volume: 0, // Should be calculated
          };
          setSamples(prevSamples => [newSample, ...prevSamples]);
      }
  };

  const handleDeleteSample = (sampleId: string) => {
      setSamples(prevSamples => prevSamples.filter(s => s.id !== sampleId));
       toast({
        title: 'Sample Deleted',
        description: `Sample ${sampleId} has been deleted.`,
        variant: 'destructive'
    });
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Project: ${project.name}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Project Details</CardTitle>
            <CardDescription>
              Detailed information for project ID: {project.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                <p className="text-lg font-semibold">{project.name}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Job Number</p>
                <p className="text-lg font-semibold">{project.jobNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{project.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="text-lg font-semibold">{project.startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                <p className="text-lg font-semibold">{project.endDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectTasks.map(task => (
                            <TableRow key={task.id}>
                                <TableCell>{task.name}</TableCell>
                                <TableCell>{task.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="font-headline">Project Samples</CardTitle>
                    <CardDescription>All samples logged for this project.</CardDescription>
                </div>
                <AddSampleDialog onSave={handleSaveSample} sample={null}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Sample
                    </Button>
                </AddSampleDialog>
            </CardHeader>
            <CardContent>
               {projectSamples.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sample ID</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Personnel</TableHead>
                            <TableHead>Analyte</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Status</TableHead>
                             <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectSamples.map(sample => (
                             <TableRow key={sample.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/samples/${sample.id}`} className="hover:underline">
                                        {sample.id}
                                    </Link>
                                </TableCell>
                                <TableCell>{sample.taskName}</TableCell>
                                <TableCell>{sample.personnelName}</TableCell>
                                <TableCell>{sample.result?.analyte || 'N/A'}</TableCell>
                                <TableCell>
                                    {sample.result?.concentration !== undefined && sample.result.status !== 'Pending'
                                    ? `${sample.result.concentration} ${sample.result.units}`
                                    : 'Pending'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getSampleStatusVariant(sample.status)}>
                                    {sample.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                        <Link href={`/samples/${sample.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Link>
                                        </DropdownMenuItem>
                                        <AddSampleDialog onSave={handleSaveSample} sample={sample}>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <Pencil className="mr-2 h-4 w-4"/>
                                                Edit
                                            </DropdownMenuItem>
                                        </AddSampleDialog>
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSample(sample.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
               ) : (
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">No samples have been logged for this project yet.</p>
                </div>
               )}
            </CardContent>
        </Card>

      </main>
    </div>
  );
}

    
