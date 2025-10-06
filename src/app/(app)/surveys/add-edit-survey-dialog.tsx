
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import type { Survey, Personnel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


interface AddEditSurveyDialogProps {
  survey?: Survey | null;
  onSave: (surveyData: Omit<Survey, 'id' | 'sitePhotoUrl' | 'sitePhotoHint'> & { id?: string }) => void;
  children: React.ReactNode;
}

const surveyTypeOptions = ['Asbestos', 'Lead', 'Cadmium'];

export function AddEditSurveyDialog({ survey, onSave, children }: AddEditSurveyDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();

    const inspectorsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'personnel'), where('ownerId', '==', user.uid), where('isInspector', '==', true));
    }, [firestore, user]);
    const { data: inspectors, isLoading } = useCollection<Personnel>(inspectorsQuery);


    const [siteName, setSiteName] = useState('');
    const [address, setAddress] = useState('');
    const [inspector, setInspector] = useState('');
    const [surveyDate, setSurveyDate] = useState<Date>();
    const [status, setStatus] = useState<Survey['status'] | ''>('');
    const [surveyType, setSurveyType] = useState<string[]>([]);
    const [jobNumber, setJobNumber] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const isEditMode = survey !== null && survey !== undefined;

    useEffect(() => {
        if(isEditMode && survey && isOpen) {
            setSiteName(survey.siteName);
            setAddress(survey.address);
            setInspector(survey.inspector);
            setSurveyDate(new Date(survey.surveyDate));
            setStatus(survey.status);
            setSurveyType(Array.isArray(survey.surveyType) ? survey.surveyType : []);
            setJobNumber(survey.jobNumber || '');
        } else if (!isEditMode && isOpen) {
            setSiteName('');
            setAddress('');
            setInspector('');
            setSurveyDate(new Date());
            setStatus('Draft');
            setSurveyType([]);
            setJobNumber('');
        }
    }, [survey, isEditMode, isOpen]);


    const handleSave = () => {
        if (!siteName || !address || !inspector || !surveyDate || !status || surveyType.length === 0) {
            toast({
                title: 'Missing Information',
                description: 'Please fill out all required fields, including survey type.',
                variant: 'destructive',
            });
            return;
        }

        const surveyData: Omit<Survey, 'id' | 'sitePhotoUrl' | 'sitePhotoHint' | 'ownerId'> & { id?: string } = {
            siteName,
            address,
            inspector,
            surveyDate: format(surveyDate, 'yyyy-MM-dd'),
            status,
            surveyType,
            jobNumber,
        };
        
        if (isEditMode && survey) {
            (surveyData as any).id = survey.id;
        }

        onSave(surveyData);

        setIsOpen(false);
    }
    
    const handleSurveyTypeChange = (type: string, checked: boolean) => {
        setSurveyType(prev => 
            checked ? [...prev, type] : prev.filter(t => t !== type)
        );
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Survey' : 'Create New Survey'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this survey.' : 'Enter the details for the new survey. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input id="siteName" value={siteName} onChange={e => setSiteName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="jobNumber">Job Number</Label>
            <Input id="jobNumber" value={jobNumber} onChange={e => setJobNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inspector">Inspector</Label>
            <Select onValueChange={setInspector} value={inspector} disabled={isLoading}>
              <SelectTrigger id="inspector">
                <SelectValue placeholder="Select an inspector" />
              </SelectTrigger>
              <SelectContent>
                {inspectors?.map(p => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label>Survey Type</Label>
            <div className="flex flex-col space-y-2">
              {surveyTypeOptions.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={surveyType.includes(type)}
                    onCheckedChange={(checked) => handleSurveyTypeChange(type, !!checked)}
                  />
                  <Label htmlFor={`type-${type}`} className="font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setStatus(value as Survey['status'])} value={status}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="surveyDate">Survey Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !surveyDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {surveyDate ? format(surveyDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={surveyDate}
                  onSelect={setSurveyDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Survey</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    