
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { existingNeas } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, FileUp, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';

export default function NeaDetailsPage({ params }: { params: { id: string } }) {
  const nea = existingNeas.find(e => e.id === params.id);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);


  if (!nea) {
    notFound();
  }

  const getStatusVariant = (status: "Active" | "Expired") => {
    return status === "Active" ? "default" : "outline";
  };
  
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
                 <Badge variant={getStatusVariant(nea.status)}>{nea.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Effective Date</p>
                <p className="text-lg font-semibold">{nea.effectiveDate}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Next Review Date</p>
                <p className="text-lg font-semibold">{nea.reviewDate}</p>
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

        {nea.supportingSampleIds && nea.supportingSampleIds.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Supporting Samples</CardTitle>
                </CardHeader>
                <CardContent>
                   <p>This NEA is supported by {nea.supportingSampleIds.length} sample(s).</p>
                   {/* We can list sample details here later */}
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
