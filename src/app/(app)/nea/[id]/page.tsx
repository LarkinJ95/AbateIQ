
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { existingNeas, samples as allSamples, personnel as allPersonnel } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LinkSamplesDialog } from '@/app/(app)/nea/link-samples-dialog';

export default function NeaDetailsPage({ params }: { params: { id: string } }) {
  const nea = existingNeas.find(e => e.id === params.id);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [linkedSampleIds, setLinkedSampleIds] = useState(nea?.supportingSampleIds || []);


  if (!nea) {
    notFound();
  }

  const effectiveDate = new Date(nea.effectiveDate);
  const reviewDate = new Date(effectiveDate.setFullYear(effectiveDate.getFullYear() + 1));
  const isExpired = new Date() > reviewDate;
  const status = isExpired ? 'Expired' : 'Active';

  const getStatusVariant = (status: "Active" | "Expired") => {
    return status === "Active" ? "default" : "outline";
  };

  const supportingSamples = linkedSampleIds.map(id => {
      const sample = allSamples.find(s => s.id === id);
      if (!sample) return null;
      const personnel = allPersonnel.find(p => p.id === sample.personnelId);
      return {
          ...sample,
          personnelName: personnel?.name || 'Unknown',
      };
  }).filter(Boolean);
  
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

  const handleSamplesLinked = (sampleIds: string[]) => {
    setLinkedSampleIds(sampleIds);
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
                    allSamples={allSamples} 
                    linkedSampleIds={linkedSampleIds}
                    onSamplesLinked={handleSamplesLinked}
                />
            </CardHeader>
            <CardContent>
                {supportingSamples && supportingSamples.length > 0 ? (
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
