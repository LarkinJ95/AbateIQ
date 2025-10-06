
'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import type { ExistingNea } from '@/lib/types';
import { useUser } from '@/firebase';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Generating...' : 'Generate Assessment'}
      <Sparkles className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function NeaGenerator({ onNeaSaved }: { onNeaSaved: (newNea: Omit<ExistingNea, 'id'> & { ownerId: string }) => void }) {
  const initialState: NeaFormState = {
    message: '',
    assessment: '',
    isError: false,
    inputs: null,
  };
  const [state, formAction] = useActionState(generateNeaAction, initialState);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    if (state.message && state.isError) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state.message, state.isError, toast]);

  const handleSaveNea = () => {
    if (state.inputs && user) {
      const newNea: Omit<ExistingNea, 'id'> & { ownerId: string } = {
          project: state.inputs.projectDescription.substring(0,30) + '...', // Simple truncate
          task: state.inputs.taskDescription.substring(0,30) + '...',
          analyte: state.inputs.analyte,
          effectiveDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          ownerId: user.uid,
      };
      onNeaSaved(newNea);
      toast({
        title: 'NEA Saved',
        description: 'The new Negative Exposure Assessment has been added to the list.',
      });
    } else {
        toast({
            title: 'Error Saving NEA',
            description: 'Could not save the NEA. User not found.',
            variant: 'destructive',
        });
    }
  };


  return (
    <>
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
        <CardFooter className="flex justify-end">
            <SubmitButton />
        </CardFooter>
      </Card>
      </form>
      
      {state.assessment && !state.isError && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline">Generated Assessment</CardTitle>
                 <CardDescription>Review the draft below and save it to the system.</CardDescription>
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
    </>
  );
}
