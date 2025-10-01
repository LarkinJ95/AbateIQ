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
import { PlusCircle } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { projects, tasks, personnel } from '@/lib/data';

export function AddSampleDialog() {
  const projectOptions = projects.map(p => ({ value: p.id, label: p.name }));
  const taskOptions = tasks.map(t => ({ value: t.id, label: t.name }));
  const personnelOptions = personnel.map(p => ({ value: p.id, label: p.name }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Sample
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Sample</DialogTitle>
          <DialogDescription>
            Log a new air sample. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Combobox 
              options={projectOptions}
              placeholder="Select a project"
              searchPlaceholder="Search projects..."
              emptyPlaceholder="No project found."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Combobox 
              options={taskOptions}
              placeholder="Select a task"
              searchPlaceholder="Search tasks..."
              emptyPlaceholder="No task found."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personnel">Personnel</Label>
            <Combobox 
              options={personnelOptions}
              placeholder="Select personnel"
              searchPlaceholder="Search personnel..."
              emptyPlaceholder="No personnel found."
            />
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" />
             </div>
              <div className="space-y-2">
                <Label htmlFor="stop-time">Stop Time</Label>
                <Input id="stop-time" type="time" />
              </div>
           </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Sample</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
