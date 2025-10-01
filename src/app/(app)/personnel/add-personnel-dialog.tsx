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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import type { Personnel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AddPersonnelDialogProps {
  person?: Personnel | null;
  children: React.ReactNode;
}

export function AddPersonnelDialog({ person, children }: AddPersonnelDialogProps) {
  const [fitTestDate, setFitTestDate] = useState<Date>();
  const [medClearanceDate, setMedClearanceDate] = useState<Date>();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const isEditMode = person !== null && person !== undefined;

  useEffect(() => {
    if (isEditMode && person) {
      setName(person.name);
      setEmployeeId(person.employeeId);
      setFitTestDate(new Date(person.fitTestDueDate));
      setMedClearanceDate(new Date(person.medicalClearanceDueDate));
    } else {
      setName('');
      setEmployeeId('');
      setFitTestDate(undefined);
      setMedClearanceDate(undefined);
    }
  }, [person, isEditMode, isOpen]);
  
  const handleSave = () => {
    toast({
        title: isEditMode ? "Personnel Updated" : "Personnel Added",
        description: `${name} has been ${isEditMode ? 'updated' : 'saved'}.`,
      });
    setIsOpen(false);
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
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Personnel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
