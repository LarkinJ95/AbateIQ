
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import type { Personnel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

interface AddPersonnelDialogProps {
  person?: Personnel | null;
  children: React.ReactNode;
}

export function AddPersonnelDialog({ person, children }: AddPersonnelDialogProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const orgId = user?.orgId;
  const [fitTestDate, setFitTestDate] = useState<Date>();
  const [medClearanceDate, setMedClearanceDate] = useState<Date>();
  const [displayName, setDisplayName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isInspector, setIsInspector] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const isEditMode = person !== null && person !== undefined;

  useEffect(() => {
    if (isEditMode && person && isOpen) {
      setDisplayName(person.displayName);
      setEmployeeId(person.employeeId || '');
      if (person.fitTestDueDate) setFitTestDate(new Date(person.fitTestDueDate));
      if (person.medicalClearanceDueDate) setMedClearanceDate(new Date(person.medicalClearanceDueDate));
      setIsInspector(person.isInspector ?? false);
    } else {
      setDisplayName('');
      setEmployeeId('');
      setFitTestDate(undefined);
      setMedClearanceDate(undefined);
      setIsInspector(false);
    }
  }, [person, isEditMode, isOpen]);
  
  const handleSave = async () => {
    if (!firestore || !orgId) return;
    if (!displayName || !employeeId || !fitTestDate || !medClearanceDate) {
        toast({
            title: 'Missing Fields',
            description: 'Please fill out all fields.',
            variant: 'destructive'
        });
        return;
    }

    const personData: Partial<Personnel> = {
        displayName,
        employeeId,
        fitTestDueDate: format(fitTestDate, 'yyyy-MM-dd'),
        medicalClearanceDueDate: format(medClearanceDate, 'yyyy-MM-dd'),
        isInspector,
        orgId,
        email: person?.email || `${displayName.toLowerCase().replace(' ', '.')}@example.com`
    };

    try {
      if (isEditMode && person) {
          const personRef = doc(firestore, 'orgs', orgId, 'people', person.id);
          await updateDoc(personRef, personData);
      } else {
          await addDoc(collection(firestore, 'orgs', orgId, 'people'), personData);
      }
      
      toast({
          title: isEditMode ? "Personnel Updated" : "Personnel Added",
          description: `${displayName} has been ${isEditMode ? 'updated' : 'saved'}.`,
        });
      setIsOpen(false);
    } catch (error) {
       toast({
          title: 'Error Saving Personnel',
          description: 'An error occurred while saving to the database.',
          variant: 'destructive',
       });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Personnel' : 'Add New Personnel'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this team member.' : 'Enter the details for the new team member. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employeeId" className="text-right">
              Employee ID
            </Label>
            <Input id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fit-test" className="text-right">
              Fit Test Due
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal col-span-3',
                    !fitTestDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fitTestDate ? format(fitTestDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fitTestDate}
                  onSelect={setFitTestDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="med-clearance" className="text-right">
              Medical Due
            </Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal col-span-3',
                    !medClearanceDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {medClearanceDate ? format(medClearanceDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={medClearanceDate}
                  onSelect={setMedClearanceDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isInspector" className="text-right">
              Inspector
            </Label>
            <div className="col-span-3 flex items-center">
              <Checkbox
                id="isInspector"
                checked={isInspector}
                onCheckedChange={(checked) => setIsInspector(!!checked)}
              />
              <span className="ml-2 text-sm text-muted-foreground">Is this person a qualified inspector?</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Personnel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
