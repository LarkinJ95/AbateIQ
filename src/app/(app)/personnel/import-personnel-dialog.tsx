
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
import type { Personnel } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

export function ImportPersonnelDialog() {
  const firestore = useFirestore();
  const { user } = useUser();
  const orgId = user?.orgId;
  const [pasteData, setPasteData] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!firestore || !orgId) return;
    if (!pasteData.trim()) {
      toast({
        title: 'No Data to Import',
        description: 'Please paste data into the text area.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rows = pasteData.trim().split('\n');
      
      const headerRow = rows[0].toLowerCase().split('\t');
      const hasHeader = headerRow.includes('name') || headerRow.includes('employee id');
      const dataRows = hasHeader ? rows.slice(1) : rows;

      if (dataRows.length === 0) {
        toast({ title: 'No Data Rows', description: 'Pasted data only contains a header or is empty.', variant: 'destructive' });
        return;
      }

      const newPersonnel: (Omit<Personnel, 'id'>)[] = dataRows.map((row, i) => {
        const columns = row.split('\t');
        if (columns.length < 4) {
          throw new Error(`Row ${i + 1} has fewer than 4 columns. Expected: Name, Employee ID, Fit Test Due Date, Medical Clearance Due Date.`);
        }
        
        const fitTestDate = new Date(columns[2]);
        const medClearanceDate = new Date(columns[3]);

        if (isNaN(fitTestDate.getTime()) || isNaN(medClearanceDate.getTime())) {
            throw new Error(`Row ${i + 1} contains an invalid date format. Please use YYYY-MM-DD.`);
        }

        return {
          name: columns[0],
          employeeId: columns[1],
          fitTestDueDate: fitTestDate.toISOString().split('T')[0],
          medicalClearanceDueDate: medClearanceDate.toISOString().split('T')[0],
        };
      });

      for (const person of newPersonnel) {
        await addDoc(collection(firestore, 'orgs', orgId, 'personnel'), person);
      }

      toast({
        title: 'Import Successful',
        description: `${newPersonnel.length} personnel records have been added.`,
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Personnel</DialogTitle>
          <DialogDescription>
            Copy columns from your spreadsheet (including the header is optional) and paste them below. Required columns: Name, Employee ID, Fit Test Due Date, Medical Clearance Due Date.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="paste-area">Paste Data Here</Label>
            <Textarea
                id="paste-area"
                placeholder="John Doe	1234	2025-01-15	2025-06-01..."
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                rows={10}
            />
            <p className="text-xs text-muted-foreground">
                Ensure dates are in YYYY-MM-DD format. Columns must be separated by tabs.
            </p>
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
