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
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { projects, tasks, personnel } from '@/lib/data';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Sample } from '@/lib/types';

interface AddSampleDialogProps {
  onSave: (sampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string }) => void;
  sample: Sample | null;
  children: React.ReactNode;
}

export function AddSampleDialog({ onSave, sample, children }: AddSampleDialogProps) {
  const [projectOptions, setProjectOptions] = useState<ComboboxOption[]>(projects.map(p => ({ value: p.id, label: p.name })));
  const [taskOptions, setTaskOptions] = useState<ComboboxOption[]>(tasks.map(t => ({ value: t.id, label: t.name })));
  const [personnelOptions, setPersonnelOptions] = useState<ComboboxOption[]>(personnel.map(p => ({ value: p.id, label: p.name })));
  
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [personnelId, setPersonnelId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [flowRate, setFlowRate] = useState(2.5);

  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = sample !== null;

  useEffect(() => {
    if (isEditMode && sample) {
        setProjectId(sample.projectId);
        setTaskId(sample.taskId);
        setPersonnelId(sample.personnelId);
        setStartTime(sample.startTime.split(' ')[1] || '');
        setStopTime(sample.stopTime.split(' ')[1] || '');
        setFlowRate(sample.flowRate);
    } else {
        setProjectId('');
        setTaskId('');
        setPersonnelId('');
        setStartTime('');
        setStopTime('');
        setFlowRate(2.5);
    }
  }, [sample, isEditMode, isOpen]);


  const handleSave = () => {
    // Basic validation
    if (!projectId || !taskId || !personnelId || !startTime || !stopTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields before saving.',
        variant: 'destructive',
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const sampleData = {
      projectId,
      taskId,
      personnelId,
      startTime: `${today} ${startTime}`,
      stopTime: `${today} ${stopTime}`,
      flowRate: Number(flowRate),
    };

    if (isEditMode && sample) {
      onSave({ id: sample.id, ...sampleData });
    } else {
      onSave(sampleData);
    }

    toast({
        title: isEditMode ? "Sample Updated" : "Sample Added",
        description: `The sample has been ${isEditMode ? 'updated' : 'saved'}.`,
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
          <DialogTitle>{isEditMode ? 'Edit Sample' : 'Add New Sample'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this sample.' : 'Log a new air sample. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Combobox 
              options={projectOptions}
              setOptions={setProjectOptions}
              value={projectId}
              onValueChange={setProjectId}
              placeholder="Select a project"
              searchPlaceholder="Search projects..."
              emptyPlaceholder="No project found."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Combobox 
              options={taskOptions}
              setOptions={setTaskOptions}
              value={taskId}
              onValueChange={setTaskId}
              placeholder="Select a task"
              searchPlaceholder="Search tasks..."
              emptyPlaceholder="No task found."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personnel">Personnel</Label>
            <Combobox 
              options={personnelOptions}
              setOptions={setPersonnelOptions}
              value={personnelId}
              onValueChange={setPersonnelId}
              placeholder="Select personnel"
              searchPlaceholder="Search personnel..."
              emptyPlaceholder="No personnel found."
            />
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
             </div>
              <div className="space-y-2">
                <Label htmlFor="stop-time">Stop Time</Label>
                <Input id="stop-time" type="time" value={stopTime} onChange={(e) => setStopTime(e.target.value)} />
              </div>
           </div>
           <div className="space-y-2">
                <Label htmlFor="flow-rate">Flow Rate (L/min)</Label>
                <Input id="flow-rate" type="number" step="0.01" value={flowRate} onChange={(e) => setFlowRate(parseFloat(e.target.value))} />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Sample</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
