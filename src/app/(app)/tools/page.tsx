'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, PlusCircle, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TwaSample = {
  id: number;
  concentration: string;
  duration: string;
};

function TwaCalculator() {
  const [samples, setSamples] = useState<TwaSample[]>([
    { id: 1, concentration: '', duration: '' },
  ]);
  const { toast } = useToast();

  const handleAddSample = () => {
    setSamples([...samples, { id: Date.now(), concentration: '', duration: '' }]);
  };

  const handleRemoveSample = (id: number) => {
    if (samples.length === 1) {
      toast({
        title: 'Cannot Remove Last Sample',
        description: 'You must have at least one sample.',
        variant: 'destructive',
      });
      return;
    }
    setSamples(samples.filter((sample) => sample.id !== id));
  };

  const handleSampleChange = (id: number, field: 'concentration' | 'duration', value: string) => {
    setSamples(
      samples.map((sample) =>
        sample.id === id ? { ...sample, [field]: value } : sample
      )
    );
  };

  const twaResult = useMemo(() => {
    const totalMinutesInShift = 480;
    let sumOfConcentrationTimesDuration = 0;
    
    for (const sample of samples) {
      const concentration = parseFloat(sample.concentration);
      const duration = parseFloat(sample.duration);

      if (!isNaN(concentration) && !isNaN(duration) && duration > 0) {
        sumOfConcentrationTimesDuration += concentration * duration;
      }
    }

    if (sumOfConcentrationTimesDuration === 0) {
        return { twa: 0, sum: 0 };
    }

    return {
        twa: sumOfConcentrationTimesDuration / totalMinutesInShift,
        sum: sumOfConcentrationTimesDuration,
    };
  }, [samples]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">8-Hour Time-Weighted Average (TWA) Calculator</CardTitle>
        <CardDescription>
          Enter sample concentrations and durations to calculate the 8-hour TWA. The calculation assumes a standard 480-minute shift.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <Label className="col-span-5">Concentration</Label>
            <Label className="col-span-5">Duration (minutes)</Label>
          </div>
          {samples.map((sample, index) => (
            <div key={sample.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5">
                <Input
                  type="number"
                  placeholder={`Sample ${index + 1} Concentration`}
                  value={sample.concentration}
                  onChange={(e) => handleSampleChange(sample.id, 'concentration', e.target.value)}
                />
              </div>
              <div className="col-span-5">
                <Input
                  type="number"
                  placeholder={`Sample ${index + 1} Duration`}
                  value={sample.duration}
                  onChange={(e) => handleSampleChange(sample.id, 'duration', e.target.value)}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSample(sample.id)}
                  aria-label="Remove sample"
                  disabled={samples.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={handleAddSample}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Sample
        </Button>
        
        <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Results
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                    <p className="text-sm text-muted-foreground">Sum of (Concentration x Duration)</p>
                    <p className="text-2xl font-bold">{twaResult.sum.toFixed(4)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">8-Hour TWA</p>
                    <p className="text-2xl font-bold text-primary">{twaResult.twa.toFixed(4)}</p>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Industrial Hygiene Tools" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="twa-calculator">
          <TabsList>
            <TabsTrigger value="twa-calculator">TWA Calculator</TabsTrigger>
          </TabsList>
          <TabsContent value="twa-calculator" className="mt-4">
            <TwaCalculator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
