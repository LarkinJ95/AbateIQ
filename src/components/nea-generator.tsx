
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateNeaAction, NeaFormState } from '@/app/(app)/nea/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Generating...' : 'Generate Assessment'}
      <Sparkles className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function NeaGenerator({ onNeaSaved }: { onNeaSaved: (newNea: any) => void }) {
  const initialState: NeaFormState = {
    message: '',
    assessment: '',
    isError: false,
    inputs: null,
  };
  const [state, formAction] = useFormState(generateNeaAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.isError ? 'Error' : 'Success',
        description: state.message,
        variant: state.isError ? 'destructive' : 'default',
      });
    }
  }, [state.message, state.isError, toast]);

  const handleSaveNea = () => {
    if (state.inputs) {
      const newNea = {
          id: `nea-${Math.floor(Math.random() * 1000)}`,
          project: state.inputs.projectDescription.substring(0,30) + '...', // Simple truncate
          task: state.inputs.taskDescription.substring(0,30) + '...',
          analyte: state.inputs.analyte,
          effectiveDate: new Date().toLocaleDateString('en-CA'),
          reviewDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-CA'),
          status: 'Active' as 'Active' | 'Expired',
      };
      onNeaSaved(newNea);
      toast({
        title: 'NEA Saved',
        description: 'The new Negative Exposure Assessment has been added to the list.',
      });
    }
  };


  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Bot />
            AI-Powered NEA Generator
          </CardTitle>
          <CardDescription>
            Provide details about the project and task to generate a draft
            Negative Exposure Assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Project Description</Label>
            <Textarea
              id="projectDescription"
              name="projectDescription"
              placeholder="e.g., Renovation of a 10-story commercial building, including demolition of interior walls."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskDescription">Task Description</Label>
            <Textarea
              id="taskDescription"
              name="taskDescription"
              placeholder="e.g., Drywall sanding in preparation for painting. Workers use orbital sanders with dust collection systems."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="analyte">Analyte</Label>
            <Input
              id="analyte"
              name="analyte"
              placeholder="e.g., Crystalline Silica"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <div/>
            <SubmitButton />
        </CardFooter>
      </Card>
      
      {state.assessment && !state.isError && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline">Generated Assessment</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea readOnly value={state.assessment} rows={15} className="font-mono bg-secondary"/>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSaveNea}>
                    <Save className="mr-2 h-4 w-4" />
                    Save NEA
                </Button>
            </CardFooter>
        </Card>
      )}
    </form>
  );
}
