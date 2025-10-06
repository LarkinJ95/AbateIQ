
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';
import type { Sample, Project, Task, Personnel, ExposureLimit } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';


interface ImportSamplesDialogProps {
  onImport: (newSamples: Omit<Sample, 'id'>[]) => void;
}

export function ImportSamplesDialog({ onImport }: ImportSamplesDialogProps) {
  const [pasteData, setPasteData] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const orgId = user?.orgId;
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'jobs')) : null, [firestore, orgId]);
  const { data: projects } = useCollection<Project>(projectsQuery);

  const tasksQuery = useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'sites')) : null, [firestore, orgId]);
  const { data: tasks } = useCollection<Task>(tasksQuery); // Assuming sites are tasks for now

  const personnelQuery = useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'people')) : null, [firestore, orgId]);
  const { data: personnel } = useCollection<Personnel>(personnelQuery);


  const handleImport = () => {
    if (!pasteData.trim()) {
      toast({
        title: 'No Data to Import',
        description: 'Please paste data into the text area.',
        variant: 'destructive',
      });
      return;
    }
     if (!projects || !tasks || !personnel) {
      toast({
        title: 'Data Not Loaded',
        description: 'Project, task, or personnel data is not yet available. Please wait a moment and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rows = pasteData.trim().split('\n');
      const headerRow = rows[0].toLowerCase().split('\t');
      const dataRows = headerRow.includes('project') ? rows.slice(1) : rows;

      if (dataRows.length === 0) {
        toast({ title: 'No Data Rows', description: 'Pasted data only contains a header.', variant: 'destructive' });
        return;
      }

      const newSamples: Omit<Sample, 'id' | 'duration' | 'volume' | 'result'>[] = dataRows.map((row, i) => {
        const columns = row.split('\t');
        if (columns.length < 8) {
          throw new Error(`Row ${i + 1} has fewer than 8 columns. Please check your data.`);
        }
        
        const [
            projectName, 
            taskName,
            personnelName,
            description,
            sampleType,
            startTime,
            stopTime,
            flowRateStr,
            analyte,
            concentrationStr
        ] = columns;

        const project = projects.find(p => p.clientName.toLowerCase() === projectName.toLowerCase());
        const task = tasks.find(t => t.address.toLowerCase() === taskName.toLowerCase()); // Using address for task name
        const person = personnel.find(p => p.displayName.toLowerCase() === personnelName.toLowerCase());

        if (!project) throw new Error(`Row ${i+1}: Project "${projectName}" not found.`);
        if (!task) throw new Error(`Row ${i+1}: Task "${taskName}" not found.`);
        if (!person) throw new Error(`Row ${i+1}: Personnel "${personnelName}" not found.`);
        if (!['Area', 'Personal', 'Blank', 'Excursion', 'Clearance'].includes(sampleType)) {
            throw new Error(`Row ${i+1}: Invalid Sample Type "${sampleType}".`);
        }

        const today = new Date().toISOString().split('T')[0];

        return {
          jobId: project.id,
          siteId: task.id,
          personnelId: person.id,
          description,
          mediaType: sampleType as Sample['mediaType'],
          startTime: `${today}T${startTime}:00.000Z`,
          stopTime: `${today}T${stopTime}:00.000Z`,
          preFlow: parseFloat(flowRateStr),
          resultData: {
            analyte: analyte,
            concentration: concentrationStr ? parseFloat(concentrationStr) : 0,
          }
        };
      });

      onImport(newSamples as any);

      toast({
        title: 'Import Successful',
        description: `${newSamples.length} sample records have been added.`,
      });
      setIsOpen(false);
      setPasteData('');

    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Could not parse the pasted data. Please check the format and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Air Samples</DialogTitle>
          <DialogDescription>
            Copy columns from your spreadsheet and paste them below. Ensure the order is correct.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="paste-area">Paste Data Here</Label>
            <p className="text-xs text-muted-foreground">
                Required columns: Project, Task, Personnel, Description, Sample Type, Start Time (HH:mm), Stop Time (HH:mm), Flow Rate, Analyte, Concentration (optional)
            </p>
            <Textarea
                id="paste-area"
                placeholder="Downtown Tower Renovation	Drywall Sanding	John Doe	Personal sample...	Personal	08:00	12:00	2.5	Silica	0.03"
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                rows={10}
            />
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleImport}>Import Records</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
