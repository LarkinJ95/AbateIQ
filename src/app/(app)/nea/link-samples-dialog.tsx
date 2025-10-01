
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Sample } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LinkSamplesDialogProps {
    allSamples: Sample[];
    linkedSampleIds: string[];
    onSamplesLinked: (sampleIds: string[]) => void;
}

export function LinkSamplesDialog({ allSamples, linkedSampleIds, onSamplesLinked }: LinkSamplesDialogProps) {
    const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>(linkedSampleIds);
    const { toast } = useToast();

    const handleCheckboxChange = (sampleId: string) => {
        setSelectedSampleIds(prev => 
            prev.includes(sampleId) 
            ? prev.filter(id => id !== sampleId) 
            : [...prev, sampleId]
        );
    };

    const handleSave = () => {
        onSamplesLinked(selectedSampleIds);
        toast({
            title: "Samples Linked",
            description: `${selectedSampleIds.length} samples have been linked to this NEA.`,
        });
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <LinkIcon className="mr-2 h-4 w-4" />
          Link Samples
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link Supporting Samples</DialogTitle>
          <DialogDescription>
            Select the samples from the list below that support this Negative Exposure Assessment.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Sample ID</TableHead>
                        <TableHead>Analyte</TableHead>
                        <TableHead>Result</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allSamples.map(sample => (
                        <TableRow key={sample.id}>
                            <TableCell>
                                <Checkbox 
                                    checked={selectedSampleIds.includes(sample.id)}
                                    onCheckedChange={() => handleCheckboxChange(sample.id)}
                                    id={`sample-${sample.id}`}
                                />
                            </TableCell>
                            <TableCell>
                                <label htmlFor={`sample-${sample.id}`} className="font-medium">{sample.id}</label>
                            </TableCell>
                            <TableCell>{sample.result?.analyte || 'N/A'}</TableCell>
                            <TableCell>
                                {sample.result?.concentration !== undefined && sample.result.status !== 'Pending'
                                ? `${sample.result.concentration} ${sample.result.units}`
                                : 'Pending'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSave}>Save Links</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
