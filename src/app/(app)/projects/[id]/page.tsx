
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { projects, samples as initialSamples, tasks, personnel, exposureLimits } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useState, useRef, useMemo } from 'react';
import type { Sample, Result, Survey } from '@/lib/types';
import { AddSampleDialog } from '@/app/(app)/samples/add-sample-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, PlusCircle, Sparkles, Bot, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes, parse } from 'date-fns';
import { summarizeLabReport, SummarizeLabReportOutput } from '@/ai/flows/summarize-lab-report';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


type LinkedReport = {
  id: string;
  fileName: string;
  summaryResult: SummarizeLabReportOutput;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const project = projects.find(p => p.id === id);
  const firestore = useFirestore();
  
  if (!project) {
    notFound();
  }

  const { toast } = useToast();
  const [samples, setSamples] = useState(initialSamples.filter(s => s.projectId === project.id));
  const reportFileRef = useRef<HTMLInputElement>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [linkedReports, setLinkedReports] = useState<LinkedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LinkedReport | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

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

  // Filter surveys related to this project (matching by name for this example)
  const surveysQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      // This is a simple query, in a real app you might have a projectId on the survey
      return query(collection(firestore, 'surveys'), where('siteName', '>=', project.name), where('siteName', '<=', project.name + '\uf8ff'));
  }, [firestore, project.name]);
  const { data: linkedSurveys } = useCollection<Survey>(surveysQuery);


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
          
          let status: Result['status'] = 'Pending';
          const concentration = newSampleData.result.concentration;
          if(concentration !== undefined && concentration !== null) {
              const limit = exposureLimits.find(l => l.analyte.toLowerCase() === newSampleData.result!.analyte!.toLowerCase());
              if(limit) {
                if (concentration > limit.pel) status = '>PEL';
                else if (concentration >= limit.al) status = '≥AL';
                else status = 'OK';
              } else {
                status = 'OK'; // Default if no limit is found
              }
          }

          resultPayload = {
              id: existingResult?.id || `res-${Math.random()}`,
              sampleId: newSampleData.id || '',
              analyte: newSampleData.result.analyte,
              concentration: newSampleData.result.concentration ?? 0,
              status: status,
              method: existingResult?.method || '',
              units: existingResult?.units || exposureLimits.find(l => l.analyte.toLowerCase() === newSampleData.result!.analyte!.toLowerCase())?.units || '',
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
              projectId: project.id, // Ensure it's for the current project
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
       toast({
        title: 'Sample Deleted',
        description: `Sample ${sampleId} has been deleted.`,
        variant: 'destructive'
    });
  };

  const handleSummarizeReport = async () => {
    if (!reportFileRef.current?.files || reportFileRef.current.files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a lab report file to summarize.',
      });
      return;
    }

    const file = reportFileRef.current.files[0];
    setIsSummarizing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const reportDataUri = reader.result as string;
        try {
          const result = await summarizeLabReport({ reportDataUri });
          const newReport: LinkedReport = {
            id: `report-${Date.now()}`,
            fileName: file.name,
            summaryResult: result,
          };
          setLinkedReports(prev => [...prev, newReport]);
          toast({
            title: 'Summary Generated & Linked',
            description: `${file.name} has been analyzed and added to the project.`,
          });
          if (reportFileRef.current) {
            reportFileRef.current.value = '';
          }
        } catch (error) {
          console.error('Error summarizing report:', error);
          toast({
            variant: 'destructive',
            title: 'Summarization Failed',
            description: 'An error occurred while generating the AI summary.',
          });
        } finally {
          setIsSummarizing(false);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
        setIsSummarizing(false);
      }
    } catch (error) {
      console.error('Error initiating summarization:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
      setIsSummarizing(false);
    }
  };
  
  const handleViewSummary = (report: LinkedReport) => {
    setSelectedReport(report);
    setIsSummaryDialogOpen(true);
  }
  
  const getSurveyStatusVariant = (status: Survey['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'Completed': return 'default';
          case 'In Progress': return 'secondary';
          case 'On Hold': return 'destructive';
          default: return 'outline';
      }
  }


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
                <CardTitle>Project Data</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="surveys">
                    <TabsList>
                        <TabsTrigger value="surveys">Linked Surveys</TabsTrigger>
                        <TabsTrigger value="samples">Air Samples</TabsTrigger>
                    </TabsList>
                    <TabsContent value="surveys" className="mt-4">
                        <div className="flex justify-end mb-4">
                            <Button variant="outline">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Link Survey
                            </Button>
                        </div>
                        {linkedSurveys && linkedSurveys.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Site Name</TableHead>
                                        <TableHead>Survey Type</TableHead>
                                        <TableHead>Inspector</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {linkedSurveys.map(survey => (
                                        <TableRow key={survey.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/surveys/${survey.id}`} className="hover:underline">
                                                    {survey.siteName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{survey.surveyType.join(', ')}</TableCell>
                                            <TableCell>{survey.inspector}</TableCell>
                                            <TableCell>{new Date(survey.surveyDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getSurveyStatusVariant(survey.status)}>{survey.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                                <p className="text-sm text-muted-foreground">No surveys have been linked to this project yet.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="samples" className="mt-4">
                        <div className="flex justify-end mb-4">
                            <AddSampleDialog onSave={handleSaveSample} sample={null}>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Air Sample
                                </Button>
                            </AddSampleDialog>
                        </div>
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
                                <p className="text-sm text-muted-foreground">No air samples have been logged for this project yet.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Bot /> Lab Reports & Summaries</CardTitle>
            <CardDescription>Upload lab reports to generate AI summaries and detect exceedances.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-lg items-end gap-2">
              <Label htmlFor="document">Select Lab Report</Label>
              <div className="flex gap-2">
                <Input id="document" type="file" ref={reportFileRef} accept=".pdf,.doc,.docx,.txt" />
                <Button onClick={handleSummarizeReport} disabled={isSummarizing}>
                    {isSummarizing ? (
                        'Summarizing...'
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" /> Summarize & Link
                        </>
                    )}
                </Button>
              </div>
            </div>

            {linkedReports.length > 0 && (
                <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-lg mb-2">Linked Reports</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {linkedReports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.fileName}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleViewSummary(report)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Summary
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      </main>

        <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline">
                        <Bot /> AI Summary for {selectedReport?.fileName}
                    </DialogTitle>
                    <DialogDescription>
                        This summary was generated by AI. Always verify critical information against the original document.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-6">
                    {selectedReport?.summaryResult && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Summary</h3>
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                {selectedReport.summaryResult.summary}
                            </p>

                            <Separator className="my-4" />

                            <h3 className="font-semibold text-lg mb-2">Detected Exceedances</h3>
                             <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                {selectedReport.summaryResult.exceedances || 'None'}
                            </p>
                        </div>
                    )}
                </div>
                 <DialogClose asChild>
                    <Button variant="outline" className="mt-4">Close</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    </div>
  );
}
