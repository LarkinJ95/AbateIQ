
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useState, useRef, useMemo } from 'react';
import type { Sample, Result, Survey, Project, Document, SummarizeLabReportOutput } from '@/lib/types';
import { AddSampleDialog } from '@/app/(app)/samples/add-sample-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, PlusCircle, Sparkles, Bot, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes, parse, format } from 'date-fns';
import { summarizeLabReport } from '@/ai/flows/summarize-lab-report';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createExceedance } from '@/ai/flows/create-exceedance';
import { PlaceHolderImages } from '@/lib/placeholder-images';


export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const orgId = user?.orgId;
  
  const projectRef = useMemoFirebase(() => {
    if (!orgId) return null;
    return doc(firestore, 'orgs', orgId, 'jobs', id)
  }, [firestore, id, orgId]);
  const { data: project, isLoading: projectLoading } = useDoc<Project>(projectRef);
  
  const { toast } = useToast();
  const reportFileRef = useRef<HTMLInputElement>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Document | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  // Samples for this project
  const projectSamplesQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(firestore, 'orgs', orgId, 'samples'), where('jobId', '==', id));
  }, [firestore, id, orgId]);
  const { data: samples, isLoading: samplesLoading } = useCollection<Sample>(projectSamplesQuery);
  
  // Documents for this project
  const projectDocumentsQuery = useMemoFirebase(() => {
      if(!orgId) return null;
      return query(collection(firestore, 'orgs', orgId, 'documents'), where('projectId', '==', id));
  }, [firestore, id, orgId]);
  const { data: linkedReports } = useCollection<Document>(projectDocumentsQuery);

  // Personnel data (to resolve names)
  const personnelQuery = useMemoFirebase(() => {
      if (!orgId) return null;
      return query(collection(firestore, 'orgs', orgId, 'people'));
  }, [firestore, orgId]);
  const { data: personnel } = useCollection<any>(personnelQuery);

   // Site data (to resolve names)
   const sitesQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(firestore, 'orgs', orgId, 'sites'));
}, [firestore, orgId]);
const { data: sites } = useCollection<any>(sitesQuery);


  const projectSamplesWithDetails = useMemo(() => {
    if (!samples || !personnel || !sites) return [];
    return samples
        .map(sample => {
            const site = sites.find(s => s.id === sample.siteId);
            const person = personnel.find(p => p.id === (sample as any).personnelId);
            return {
                ...sample,
                siteName: site?.address || 'N/A',
                personnelName: person?.displayName || 'N/A',
                status: sample.result?.status || 'Pending',
            }
        });
  }, [samples, personnel, sites]);
    

  // Filter surveys related to this project
  const surveysQuery = useMemoFirebase(() => {
      if (!firestore || !project || !orgId) return null;
      return query(
          collection(firestore, 'orgs', orgId, 'surveys'), 
          where('jobId', '==', project.id),
      );
  }, [firestore, project, orgId]);
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
  
 const handleSaveSample = async (newSampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string, result?: Partial<Result> }) => {
      if (!orgId || !user) return;
      
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
      const volume = duration * (newSampleData.preFlow || 0);
      
      const finalSample: Omit<Sample, 'id'> = {
          ...newSampleData,
          jobId: id, // Ensure it's for the current project
          orgId: orgId,
          createdByUid: user.uid,
          createdAt: new Date().toISOString(),
          duration,
          volume,
      } as Omit<Sample, 'id'>;

      try {
        if (newSampleData.id) {
            const sampleRef = doc(firestore, 'orgs', orgId, 'samples', newSampleData.id);
            await updateDoc(sampleRef, finalSample);
            toast({ title: 'Sample Updated' });
        } else {
            await addDoc(collection(firestore, 'orgs', orgId, 'samples'), { ...finalSample });
            toast({ title: 'Sample Added' });
        }
      } catch (e) {
          console.error(e);
          toast({ title: 'Error Saving Sample', variant: 'destructive'});
      }
  };

  const handleDeleteSample = async (sampleId: string) => {
      if (!orgId) return;
       try {
        await deleteDoc(doc(firestore, 'orgs', orgId, 'samples', sampleId));
         toast({
            title: 'Sample Deleted',
            description: `Sample ${sampleId} has been deleted.`,
            variant: 'destructive'
        });
       } catch (e) {
            toast({ title: 'Error Deleting Sample', variant: 'destructive'});
       }
  };

  const handleSummarizeReport = async () => {
    if (!reportFileRef.current?.files || reportFileRef.current.files.length === 0) {
      toast({ variant: 'destructive', title: 'No file selected' });
      return;
    }
    if (!orgId || !user) return;

    const file = reportFileRef.current.files[0];
    setIsSummarizing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const reportDataUri = reader.result as string;
        try {
          const summaryResult = await summarizeLabReport({ reportDataUri });
          
          const defaultThumbnail = PlaceHolderImages.find(img => img.id === 'doc-thumb-4');

          const newDocument: Omit<Document, 'id'> = {
            name: file.name,
            type: 'Lab Report',
            uploadDate: format(new Date(), 'yyyy-MM-dd'),
            thumbnailUrl: defaultThumbnail?.imageUrl || 'https://placehold.co/400x300',
            thumbnailHint: defaultThumbnail?.imageHint || 'lab results',
            fileUrl: reportDataUri,
            ownerId: user.uid,
            projectId: id,
            summary: summaryResult,
          };
          
          await addDoc(collection(firestore, 'orgs', orgId, 'documents'), newDocument);

          toast({
            title: 'Summary Generated & Linked',
            description: `${file.name} has been analyzed and added to the project.`,
          });

          if (reportFileRef.current) {
            reportFileRef.current.value = '';
          }
        } catch (error) {
          console.error('Error summarizing report:', error);
          toast({ variant: 'destructive', title: 'Summarization Failed' });
        } finally {
          setIsSummarizing(false);
        }
      };
      reader.onerror = () => {
        toast({ variant: 'destructive', title: 'File Read Error' });
        setIsSummarizing(false);
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error' });
      setIsSummarizing(false);
    }
  };
  
  const handleViewSummary = (report: Document) => {
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

  if (projectLoading) {
    return <div>Loading project...</div>;
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Project: ${project.clientName}`} />
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
                <p className="text-sm font-medium text-muted-foreground">Client Name</p>
                <p className="text-lg font-semibold">{project.clientName}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Job Number</p>
                <p className="text-lg font-semibold">{project.id}</p>
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
                         {samplesLoading ? <p>Loading samples...</p> : projectSamplesWithDetails.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sample ID</TableHead>
                                        <TableHead>Site</TableHead>
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
                                    {projectSamplesWithDetails.map(sample => (
                                        <TableRow key={sample.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/samples/${sample.id}`} className="hover:underline">
                                                    {sample.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{sample.siteName}</TableCell>
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

            {linkedReports && linkedReports.length > 0 && (
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
                                    <TableCell className="font-medium">{report.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleViewSummary(report)} disabled={!report.summary}>
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
                        <Bot /> AI Summary for {selectedReport?.name}
                    </DialogTitle>
                    <DialogDescription>
                        This summary was generated by AI. Always verify critical information against the original document.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-6">
                    {selectedReport?.summary && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Summary</h3>
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                {selectedReport.summary.summary}
                            </p>

                            <Separator className="my-4" />

                            <h3 className="font-semibold text-lg mb-2">Detected Exceedances</h3>
                             <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                {selectedReport.summary.exceedances || 'None'}
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
