
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
import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Sample, Project, Site, Personnel, Analyte } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { differenceInMinutes, parse } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';


interface AddSampleDialogProps {
  onSave: (sampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string }) => void;
  sample: Sample | null;
  children: React.ReactNode;
}

const unitOptions: string[] = ['mg/m³', 'µg/m³', 'f/cc', 'ppm'];


export function AddSampleDialog({ onSave, sample, children }: AddSampleDialogProps) {
    const { user } = useUser();
    const orgId = user?.orgId;
    const firestore = useFirestore();

    const { data: projects } = useCollection<Project>(useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'jobs')) : null, [firestore, orgId]));
    const { data: sites } = useCollection<Site>(useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'sites')) : null, [firestore, orgId]));
    const { data: personnel } = useCollection<Personnel>(useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'people')) : null, [firestore, orgId]));
    const { data: analytes } = useCollection<Analyte>(useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'analytes')) : null, [firestore, orgId]));

    const projectOptions = useMemo(() => projects?.map(p => ({ value: p.id, label: p.clientName })) || [], [projects]);
    const siteOptions = useMemo(() => sites?.map(s => ({ value: s.id, label: s.address })) || [], [sites]);
    const personnelOptions = useMemo(() => personnel?.map(p => ({ value: p.id, label: p.displayName })) || [], [personnel]);
    const analyteOptions = useMemo(() => analytes?.map(l => ({ value: l.id, label: l.name })) || [], [analytes]);

  
  const [jobId, setJobId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [personnelId, setPersonnelId] = useState('');
  const [description, setDescription] = useState('');
  const [sampleType, setSampleType] = useState<Sample['mediaType'] | ''>('');
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [flowRate, setFlowRate] = useState(2.5);
  const [analyteId, setAnalyteId] = useState('');
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
        setJobId(sample.jobId);
        setSiteId(sample.siteId || '');
        setPersonnelId((sample as any).personnelId || '');
        setDescription(sample.description || '');
        setSampleType(sample.mediaType);
        setStartTime(sample.startTime.split('T')[1]?.substring(0,5) || '');
        setStopTime(sample.stopTime.split('T')[1]?.substring(0,5) || '');
        setFlowRate(sample.preFlow || 2.5);
        
        const currentAnalyte = (sample as any).result?.analyte || '';
        const foundAnalyte = analytes?.find(a => a.name.toLowerCase() === currentAnalyte.toLowerCase());
        setAnalyteId(foundAnalyte?.id || '');
        setConcentration((sample as any).result?.concentration ?? '');
        setUnits((sample as any).result?.units || '');

    } else {
        setJobId('');
        setSiteId('');
        setPersonnelId('');
        setDescription('');
        setSampleType('');
        setStartTime('');
        setStopTime('');
        setFlowRate(2.5);
        setAnalyteId('');
        setConcentration('');
        setUnits('');
    }
  }, [sample, isEditMode, isOpen, analytes]);


  const handleSave = () => {
    if (!jobId || !siteId || !sampleType || !startTime || !stopTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required fields before saving.',
        variant: 'destructive',
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const selectedAnalyte = analytes?.find(opt => opt.id === analyteId);

    const sampleData: any = {
      jobId,
      siteId,
      personnelId,
      description,
      mediaType: sampleType,
      startTime: `${today}T${startTime}:00.000Z`,
      stopTime: `${today}T${stopTime}:00.000Z`,
      preFlow: Number(flowRate),
      analyteId: analyteId,
      result: selectedAnalyte ? {
          analyte: selectedAnalyte.name,
          concentration: Number(concentration),
          units: units || selectedAnalyte.unit,
          status: concentration === '' ? 'Pending' : 'OK'
      } : undefined
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
              value={jobId}
              onValueChange={setJobId}
              placeholder="Select a project"
              searchPlaceholder="Search projects..."
              emptyPlaceholder="No project found."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Combobox 
              options={siteOptions}
              value={siteId}
              onValueChange={setSiteId}
              placeholder="Select a site"
              searchPlaceholder="Search sites..."
              emptyPlaceholder="No site found."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
             <Label htmlFor="description">Description</Label>
             <Textarea id="description" placeholder="Enter a brief description of the sample..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="sample-type">Sample Type</Label>
            <Select onValueChange={(value) => setSampleType(value as Sample['mediaType'])} value={sampleType}>
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
                        value={analyteId}
                        onValueChange={setAnalyteId}
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
