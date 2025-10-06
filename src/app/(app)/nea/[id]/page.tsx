
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LinkSamplesDialog } from '@/app/(app)/nea/link-samples-dialog';
import type { ExistingNea, Sample, Project, Personnel } from '@/lib/types';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, query, collection, where, updateDoc } from 'firebase/firestore';

export default function NeaDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const neaRef = useMemoFirebase(() => doc(firestore, 'neas', id), [firestore, id]);
  const { data: nea, isLoading: neaLoading } = useDoc<ExistingNea>(neaRef);
  
  const [documentUploaded, setDocumentUploaded] = useState(false); // This would be based on nea.documentPath in a real app
  
  const projectSamplesQuery = useMemoFirebase(() => {
    if (!user || !nea?.project) return null; // Assuming nea.project stores a project ID or name
    // This is a simplification. A real query might be more complex
    return query(collection(firestore, 'samples'), where('ownerId', '==', user.uid));
  }, [firestore, user, nea]);

  const { data: allSamples, isLoading: samplesLoading } = useCollection<Sample>(projectSamplesQuery);

  const personnelQuery = useMemoFirebase(() => {
      if (!user) return null;
      return query(collection(firestore, 'personnel'), where('ownerId', '==', user.uid));
  }, [firestore, user]);
  const { data: allPersonnel } = useCollection<Personnel>(personnelQuery);

  if (neaLoading) {
    return <div>Loading...</div>;
  }

  if (!nea) {
    notFound();
  }
  
  const effectiveDate = new Date(nea.effectiveDate);
  const reviewDate = new Date(new Date(nea.effectiveDate).setFullYear(effectiveDate.getFullYear() + 1));
  const isExpired = new Date() > reviewDate;
  const status = isExpired ? 'Expired' : 'Active';

  const getStatusVariant = (status: "Active" | "Expired") => {
    return status === "Active" ? "default" : "outline";
  };

  const supportingSamples = useMemo(() => {
      if (!nea.supportingSampleIds || !allSamples || !allPersonnel) return [];
      return nea.supportingSampleIds.map(id => {
        const sample = allSamples.find(s => s.id === id);
        if (!sample) return null;
        const personnel = allPersonnel.find(p => p.id === sample.personnelId);
        return {
            ...sample,
            personnelName: personnel?.name || 'Unknown',
        };
    }).filter(Boolean);
  }, [nea.supportingSampleIds, allSamples, allPersonnel]);
  
  const handleUploadClick = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      toast({
        title: 'Upload Successful',
        description: `${fileInputRef.current.files[0].name} has been uploaded for NEA ${nea.id}.`,
      });
      setDocumentUploaded(true);
    } else {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
    }
  };

  const handleSamplesLinked = async (sampleIds: string[]) => {
    const neaRef = doc(firestore, 'neas', id);
    try {
        await updateDoc(neaRef, { supportingSampleIds: sampleIds });
        toast({
            title: "Samples Linked",
            description: `${sampleIds.length} samples have been linked to this NEA.`,
        });
    } catch (e) {
        toast({ title: "Error linking samples", variant: 'destructive' });
    }
  }


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
                 <Badge variant={getStatusVariant(status)}>{status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Effective Date</p>
                <p className="text-lg font-semibold">{new Date(nea.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Expiration Date</p>
                <p className="text-lg font-semibold">{reviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Assessment Document</CardTitle>
            </CardHeader>
            <CardContent>
                {documentUploaded ? (
                    <div className="flex flex-col items-center justify-center text-center gap-4 p-8 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <p className="text-muted-foreground">Document uploaded successfully.</p>
                        <Button>View Document</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <p className="text-sm text-muted-foreground">
                            No assessment document has been uploaded for this NEA.
                         </p>
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="document">Select File</Label>
                            <div className="flex gap-2">
                                <Input id="document" type="file" ref={fileInputRef} />
                                <Button onClick={handleUploadClick}>
                                <FileUp className="mr-2 h-4 w-4" /> Upload
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline">Supporting Samples</CardTitle>
                <LinkSamplesDialog 
                    allSamples={allSamples || []} 
                    linkedSampleIds={nea.supportingSampleIds || []}
                    onSamplesLinked={handleSamplesLinked}
                />
            </CardHeader>
            <CardContent>
                {samplesLoading ? <p>Loading samples...</p> : supportingSamples && supportingSamples.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sample ID</TableHead>
                                <TableHead>Personnel</TableHead>
                                <TableHead>Result</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supportingSamples.map((sample) => (
                                <TableRow key={sample.id}>
                                    <TableCell>{sample.id}</TableCell>
                                    <TableCell>{sample.personnelName}</TableCell>
                                    <TableCell>{sample.result?.concentration ?? 'N/A'} {sample.result?.units}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">No samples have been linked to this NEA.</p>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

    