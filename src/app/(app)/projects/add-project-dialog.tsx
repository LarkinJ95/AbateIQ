
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
import { useState, useEffect } from 'react';
import type { Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


interface AddProjectDialogProps {
  project?: Project | null;
  onSave: (projectData: Omit<Project, 'id'> & { id?: string }) => void;
  children: React.ReactNode;
}

export function AddProjectDialog({ project, onSave, children }: AddProjectDialogProps) {
    const [name, setName] = useState('');
    const [jobNumber, setJobNumber] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<Project['status'] | ''>('');
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const isEditMode = project !== null && project !== undefined;

    useEffect(() => {
        if(isEditMode && project) {
            setName(project.name);
            setJobNumber(project.jobNumber || '');
            setLocation(project.location);
            setStatus(project.status);
            setStartDate(new Date(project.startDate));
            setEndDate(new Date(project.endDate));
        } else {
            setName('');
            setJobNumber('');
            setLocation('');
            setStatus('Active');
            setStartDate(undefined);
            setEndDate(undefined);
        }
    }, [project, isEditMode, isOpen]);


    const handleSave = () => {
        if (!name || !location || !status || !startDate || !endDate) {
            toast({
                title: 'Missing Information',
                description: 'Please fill out all required fields.',
                variant: 'destructive',
            });
            return;
        }

        const projectData = {
            name,
            jobNumber,
            location,
            status,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
        };

        if (isEditMode && project) {
            onSave({ id: project.id, ...projectData });
        } else {
            onSave(projectData as any);
        }


        toast({
            title: isEditMode ? 'Project Updated' : 'Project Added',
            description: `${name} has been ${isEditMode ? 'updated' : 'saved'}.`,
        });
        setIsOpen(false);
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this project.' : 'Enter the details for the new project. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Project Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jobNumber" className="text-right">
              Job Number
            </Label>
            <Input
              id="jobNumber"
              value={jobNumber}
              onChange={e => setJobNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => setStatus(value as Project['status'])} value={status}>
              <SelectTrigger id="status" className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal col-span-3',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal col-span-3',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
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
          <Button onClick={handleSave}>Save Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
