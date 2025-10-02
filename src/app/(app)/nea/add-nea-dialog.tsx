
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
import { PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import type { ExistingNea } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AddNeaDialogProps {
  onNeaAdded: (nea: ExistingNea) => void;
}

export function AddNeaDialog({ onNeaAdded }: AddNeaDialogProps) {
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [analyte, setAnalyte] = useState('');
  const [effectiveDate, setEffectiveDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
     if (!project || !task || !analyte || !effectiveDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }
    const newNea: ExistingNea = {
        id: `nea-${Math.floor(Math.random() * 1000)}`,
        project,
        task,
        analyte,
        effectiveDate: format(effectiveDate, 'yyyy-MM-dd'),
    };
    onNeaAdded(newNea);
    toast({
        title: "NEA Added",
        description: `The new assessment for ${project} has been saved.`,
      });
    setIsOpen(false);
    // Reset form
    setProject('');
    setTask('');
    setAnalyte('');
    setEffectiveDate(undefined);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Manual NEA</DialogTitle>
          <DialogDescription>
            Enter the details for an existing Negative Exposure Assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Project
            </Label>
            <Input id="project" value={project} onChange={(e) => setProject(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task" className="text-right">
              Task
            </Label>
            <Input id="task" value={task} onChange={(e) => setTask(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="analyte" className="text-right">
              Analyte
            </Label>
            <Input id="analyte" value={analyte} onChange={(e) => setAnalyte(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="effective-date" className="text-right">
              Effective Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal col-span-3',
                    !effectiveDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {effectiveDate ? format(effectiveDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={effectiveDate}
                  onSelect={setEffectiveDate}
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
          <Button onClick={handleSave}>Save NEA</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
