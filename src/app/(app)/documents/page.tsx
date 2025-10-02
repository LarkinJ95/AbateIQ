
'use client';

import { Header } from '@/components/header';
import { documents } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, MoreVertical, Trash2, Download, Eye, Sparkles, Bot } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { summarizeLabReport, SummarizeLabReportOutput } from '@/ai/flows/summarize-lab-report';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummarizeLabReportOutput | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const handleUploadClick = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      toast({
        title: 'Upload Successful',
        description: `${fileInputRef.current.files[0].name} has been uploaded.`,
      });
    } else {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
    }
  };

  const handleSummarize = async () => {
    if (!fileInputRef.current?.files || fileInputRef.current.files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a lab report file to summarize.',
      });
      return;
    }

    const file = fileInputRef.current.files[0];
    
    // For this prototype, we'll check if the selected document is one of the mock reports.
    // In a real app, you would handle the file upload and processing.
    const mockReport = documents.find(d => d.name.includes('Lab Report'));
    if (!file.name.includes('Lab Report') || !mockReport) {
        toast({
            variant: 'destructive',
            title: 'Invalid File',
            description: 'AI summarization is currently only available for mock "Lab Report" documents.',
        });
        return;
    }

    setIsSummarizing(true);
    setSummaryResult(null);

    try {
      // Convert file to data URI
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const reportDataUri = reader.result as string;
        try {
          const result = await summarizeLabReport({ reportDataUri });
          setSummaryResult(result);
          setIsSummaryDialogOpen(true);
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Documents" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload & Analyze Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-lg items-end gap-2">
              <Label htmlFor="document">Select File</Label>
              <div className="flex gap-2">
                <Input id="document" type="file" ref={fileInputRef} />
                <Button onClick={handleUploadClick}>
                  <FileUp className="mr-2 h-4 w-4" /> Upload
                </Button>
                <Button onClick={handleSummarize} disabled={isSummarizing}>
                    {isSummarizing ? (
                        'Summarizing...'
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" /> Summarize with AI
                        </>
                    )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-headline font-bold tracking-tight mb-4">
            Project Files
          </h2>
          <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="p-0 relative">
                  <Image
                    src={doc.thumbnailUrl}
                    alt={`Thumbnail for ${doc.name}`}
                    width={400}
                    height={300}
                    className="aspect-[4/3] object-cover"
                    data-ai-hint={doc.thumbnailHint}
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">{doc.type}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    Uploaded: {doc.uploadDate}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

       <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline">
                        <Bot /> AI-Generated Report Summary
                    </DialogTitle>
                    <DialogDescription>
                        This summary was generated by AI. Always verify critical information against the original document.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-6">
                    {summaryResult && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Summary</h3>
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                {summaryResult.summary}
                            </p>

                            <Separator className="my-4" />

                            <h3 className="font-semibold text-lg mb-2">Detected Exceedances</h3>
                             <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                {summaryResult.exceedances || 'None'}
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
