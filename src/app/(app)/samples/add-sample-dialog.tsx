
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
import { projects, tasks, personnel, exposureLimits } from '@/lib/data';
import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Sample } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { differenceInMinutes, parse } from 'date-fns';

interface AddSampleDialogProps {
  onSave: (sampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string }) => void;
  sample: Sample | null;
  children: React.ReactNode;
}

const defaultAnalyteOptions: ComboboxOption[] = [
    { value: 'asbestos', label: 'Asbestos' },
    { value: 'lead', label: 'Lead' },
    { value: 'cadmium', label: 'Cadmium' },
    { value: 'silica', label: 'Silica' },
    { value: 'mold', label: 'Mold' },
];

const unitOptions: string[] = ['mg/m³', 'µg/m³', 'f/cc', 'ppm'];


export function AddSampleDialog({ onSave, sample, children }: AddSampleDialogProps) {
  const [projectOptions, setProjectOptions] = useState<ComboboxOption[]>(projects.map(p => ({ value: p.id, label: p.name })));
  const [taskOptions, setTaskOptions] = useState<ComboboxOption[]>(tasks.map(t => ({ value: t.id, label: t.name })));
  const [personnelOptions, setPersonnelOptions] = useState<ComboboxOption[]>(personnel.map(p => ({ value: p.id, label: p.name })));
  const [analyteOptions, setAnalyteOptions] = useState<ComboboxOption[]>(defaultAnalyteOptions);
  
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [personnelId, setPersonnelId] = useState('');
  const [description, setDescription] = useState('');
  const [sampleType, setSampleType] = useState<Sample['sampleType'] | ''>('');
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [flowRate, setFlowRate] = useState(2.5);
  const [analyte, setAnalyte] = useState('');
  const [concentration, setConcentration] = useState<number | ''>('');
  const [units, setUnits] = useState('');


  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = sample !== null;

  const totalMinutes = useMemo(() => {
    if (startTime && stopTime) {
      const today = new Date().toISOString().split('T')[0];
      try {
        const start = parse(`${today} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
        const stop = parse(`${today} ${stopTime}`, 'yyyy-MM-dd HH:mm', new Date());
        if (stop > start) {
          return differenceInMinutes(stop, start);
        }
      } catch (e) { return 0; }
    }
    return 0;
  }, [startTime, stopTime]);


  useEffect(() => {
    if (isEditMode && sample) {
        setProjectId(sample.projectId);
        setTaskId(sample.taskId);
        setPersonnelId(sample.personnelId);
        setDescription(sample.description);
        setSampleType(sample.sampleType);
        setStartTime(sample.startTime.split(' ')[1] || '');
        setStopTime(sample.stopTime.split(' ')[1] || '');
        setFlowRate(sample.flowRate);
        
        const currentAnalyte = sample.result?.analyte || '';
        // Ensure the current analyte is in the options list
        if (currentAnalyte && !analyteOptions.some(opt => opt.label.toLowerCase() === currentAnalyte.toLowerCase())) {
            setAnalyteOptions(prev => [...prev, { value: currentAnalyte.toLowerCase(), label: currentAnalyte}]);
        }
        setAnalyte(currentAnalyte ? currentAnalyte.toLowerCase() : '');
        setConcentration(sample.result?.concentration ?? '');
        setUnits(sample.result?.units || '');

    } else {
        setProjectId('');
        setTaskId('');
        setPersonnelId('');
        setDescription('');
        setSampleType('');
        setStartTime('');
        setStopTime('');
        setFlowRate(2.5);
        setAnalyte('');
        setConcentration('');
        setUnits('');
        setAnalyteOptions(defaultAnalyteOptions);
    }
  }, [sample, isEditMode, isOpen]);


  const handleSave = () => {
    if (!projectId || !taskId || !sampleType || !startTime || !stopTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required fields before saving.',
        variant: 'destructive',
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const selectedAnalyteLabel = analyteOptions.find(opt => opt.value === analyte)?.label;

    const sampleData = {
      projectId,
      taskId,
      personnelId,
      description,
      sampleType,
      startTime: `${today} ${startTime}`,
      stopTime: `${today} ${stopTime}`,
      flowRate: Number(flowRate),
      result: selectedAnalyteLabel ? {
          analyte: selectedAnalyteLabel,
          concentration: Number(concentration),
          units: units
      } : undefined
    };

    if (isEditMode && sample) {
      onSave({ id: sample.id, ...sampleData });
    } else {
      onSave(sampleData as any);
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Sample' : 'Add New Sample'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this sample.' : 'Log a new air sample. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
          <div className="space-y-2 md:col-span-2">
             <Label htmlFor="description">Description</Label>
             <Textarea id="description" placeholder="Enter a brief description of the sample..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="sample-type">Sample Type</Label>
            <Select onValueChange={(value) => setSampleType(value as Sample['sampleType'])} value={sampleType}>
              <SelectTrigger id="sample-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Area">Area</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Blank">Blank</SelectItem>
                <SelectItem value="Excursion">Excursion</SelectItem>
                <SelectItem value="Clearance">Clearance</SelectItem>
              </SelectContent>
            </Select>
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
           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                    <Label htmlFor="total-minutes">Total Minutes</Label>
                    <Input id="total-minutes" type="text" value={totalMinutes > 0 ? `${totalMinutes} min` : '-'} readOnly disabled />
            </div>
            <div className="space-y-2">
                    <Label htmlFor="flow-rate">Flow Rate (L/min)</Label>
                    <Input id="flow-rate" type="number" step="0.01" value={flowRate} onChange={(e) => setFlowRate(parseFloat(e.target.value))} />
            </div>
           </div>
            <div className="md:col-span-2 border-t pt-4 grid grid-cols-3 gap-4">
                 <div className="space-y-2 col-span-1">
                    <Label htmlFor="analyte">Analyte</Label>
                    <Combobox
                        options={analyteOptions}
                        setOptions={setAnalyteOptions}
                        value={analyte}
                        onValueChange={setAnalyte}
                        placeholder="Select analyte"
                        searchPlaceholder="Search analytes..."
                        emptyPlaceholder="No analyte found."
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="concentration">Concentration</Label>
                    <Input id="concentration" type="number" placeholder="e.g., 0.03" value={concentration} onChange={(e) => setConcentration(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="units">Units</Label>
                    <Select value={units} onValueChange={setUnits}>
                        <SelectTrigger id="units">
                            <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {unitOptions.map(unit => (
                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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

    