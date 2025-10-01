
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

interface AddProjectDialogProps {
  project?: Project | null;
  children: React.ReactNode;
}

export function AddProjectDialog({ project, children }: AddProjectDialogProps) {
    const [name, setName] = useState('');
    const [jobNumber, setJobNumber] = useState('');
    const [location, setLocation] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const isEditMode = project !== null && project !== undefined;

    useEffect(() => {
        if(isEditMode && project) {
            setName(project.name);
            setJobNumber(project.jobNumber || '');
            setLocation(project.location);
        } else {
            setName('');
            setJobNumber('');
            setLocation('');
        }
    }, [project, isEditMode, isOpen]);


    const handleSave = () => {
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
      <DialogContent className="sm:max-w-[425px]">
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
