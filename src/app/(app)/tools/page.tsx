
'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, PlusCircle, Calculator, Copy, RefreshCw, Wind, Sun, Building, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TwaSample = {
  id: number;
  concentration: string;
  duration: string;
};

function TwaCalculator() {
  const [samples, setSamples] = useState<TwaSample[]>([
    { id: 1, concentration: '', duration: '' },
  ]);
  const [shiftDuration, setShiftDuration] = useState<number>(480);
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
    const totalMinutesInShift = shiftDuration;
    let sumOfConcentrationTimesDuration = 0;
    
    for (const sample of samples) {
      const concentration = parseFloat(sample.concentration);
      const duration = parseFloat(sample.duration);

      if (!isNaN(concentration) && !isNaN(duration) && duration > 0) {
        sumOfConcentrationTimesDuration += concentration * duration;
      }
    }

    if (sumOfConcentrationTimesDuration === 0 || totalMinutesInShift === 0) {
        return { twa: 0, sum: 0 };
    }

    return {
        twa: sumOfConcentrationTimesDuration / totalMinutesInShift,
        sum: sumOfConcentrationTimesDuration,
    };
  }, [samples, shiftDuration]);

  const handleCopy = () => {
    navigator.clipboard.writeText(twaResult.twa.toFixed(4));
    toast({
        title: "Copied to Clipboard",
        description: `TWA value ${twaResult.twa.toFixed(4)} copied.`
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Time-Weighted Average (TWA) Calculator</CardTitle>
        <CardDescription>
          Enter sample concentrations and durations to calculate the TWA for a selected shift duration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="shift-duration">Shift Duration</Label>
          <Select
            value={String(shiftDuration)}
            onValueChange={(value) => setShiftDuration(Number(value))}
          >
            <SelectTrigger id="shift-duration">
              <SelectValue placeholder="Select shift duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="240">4 Hours</SelectItem>
              <SelectItem value="480">8 Hours</SelectItem>
              <SelectItem value="600">10 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                    <p className="text-sm text-muted-foreground">Sum of (C x T)</p>
                    <p className="text-2xl font-bold">{twaResult.sum.toFixed(4)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{shiftDuration / 60}-Hour TWA</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-primary">{twaResult.twa.toFixed(4)}</p>
                        <Button variant="outline" size="icon" onClick={handleCopy}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UnitConverter() {
    const [conversionType, setConversionType] = useState('mg-to-ppm');
    const [inputValue, setInputValue] = useState('');
    const [molecularWeight, setMolecularWeight] = useState('');
    
    const result = useMemo(() => {
        const input = parseFloat(inputValue);
        const mw = parseFloat(molecularWeight);

        if (isNaN(input)) return null;

        switch (conversionType) {
            case 'mg-to-ppm':
                if (isNaN(mw) || mw <= 0) return null;
                return `${((input * 24.45) / mw).toFixed(3)} ppm`;
            case 'ppm-to-mg':
                 if (isNaN(mw) || mw <= 0) return null;
                return `${((input * mw) / 24.45).toFixed(3)} mg/m³`;
            case 'fcc-to-fm3':
                return `${(input * 1_000_000).toLocaleString()} f/m³`;
            default:
                return null;
        }
    }, [conversionType, inputValue, molecularWeight]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Unit Converter</CardTitle>
                <CardDescription>Convert between common industrial hygiene units.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="conversion-type">Conversion Type</Label>
                    <Select value={conversionType} onValueChange={setConversionType}>
                        <SelectTrigger id="conversion-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mg-to-ppm">mg/m³ to ppm</SelectItem>
                            <SelectItem value="ppm-to-mg">ppm to mg/m³</SelectItem>
                            <SelectItem value="fcc-to-fm3">f/cc to f/m³</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="input-value">Input Value</Label>
                        <Input id="input-value" type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    </div>
                    {(conversionType === 'mg-to-ppm' || conversionType === 'ppm-to-mg') && (
                        <div className="space-y-2">
                            <Label htmlFor="mw">Molecular Weight</Label>
                            <Input id="mw" type="number" value={molecularWeight} onChange={(e) => setMolecularWeight(e.target.value)} placeholder="e.g., 28.01" />
                        </div>
                    )}
                </div>
                 <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Result
                    </h3>
                    <div className="p-4 bg-muted/50 rounded-lg min-h-[80px] flex items-center">
                        {result ? (
                            <p className="text-2xl font-bold text-primary">{result}</p>
                        ): (
                            <p className="text-muted-foreground">Enter values to see the result.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function VentilationCalculator() {
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [ach, setAch] = useState('');

    const result = useMemo(() => {
        const l = parseFloat(length);
        const w = parseFloat(width);
        const h = parseFloat(height);
        const airChanges = parseFloat(ach);

        if (isNaN(l) || isNaN(w) || isNaN(h) || isNaN(airChanges) || l <= 0 || w <= 0 || h <= 0 || airChanges <= 0) {
            return null;
        }

        const volume = l * w * h;
        const cfm = (volume * airChanges) / 60;
        return { volume: volume.toFixed(2), cfm: cfm.toFixed(2) };

    }, [length, width, height, ach]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Ventilation Calculator (ACH)</CardTitle>
                <CardDescription>Calculate required airflow (CFM) for a desired number of air changes per hour (ACH).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="length">Length (ft)</Label>
                        <Input id="length" type="number" value={length} onChange={e => setLength(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="width">Width (ft)</Label>
                        <Input id="width" type="number" value={width} onChange={e => setWidth(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="height">Height (ft)</Label>
                        <Input id="height" type="number" value={height} onChange={e => setHeight(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ach">Target ACH</Label>
                        <Input id="ach" type="number" value={ach} onChange={e => setAch(e.target.value)} />
                    </div>
                </div>
                <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Wind className="mr-2 h-5 w-5" />
                        Required Airflow
                    </h3>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        {result ? (
                            <>
                                <div>
                                    <p className="text-sm text-muted-foreground">Room Volume</p>
                                    <p className="text-2xl font-bold">{result.volume} ft³</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Required CFM</p>
                                    <p className="text-2xl font-bold text-primary">{result.cfm}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground col-span-2">Enter all room dimensions and a target ACH to calculate.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function WbgtCalculator() {
    const [isOutdoor, setIsOutdoor] = useState(true);
    const [dryBulb, setDryBulb] = useState(''); // Tdb
    const [wetBulb, setWetBulb] = useState(''); // Tnwb
    const [globeTemp, setGlobeTemp] = useState(''); // Tg

    const result = useMemo(() => {
        const tdb = parseFloat(dryBulb);
        const tnwb = parseFloat(wetBulb);
        const tg = parseFloat(globeTemp);

        if (isNaN(tnwb) || isNaN(tg)) return null;

        if (isOutdoor) {
            if(isNaN(tdb)) return null;
            const wbgt = (0.7 * tnwb) + (0.2 * tg) + (0.1 * tdb);
            return wbgt.toFixed(1);
        } else { // Indoor
            const wbgt = (0.7 * tnwb) + (0.3 * tg);
            return wbgt.toFixed(1);
        }

    }, [isOutdoor, dryBulb, wetBulb, globeTemp]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">WBGT Calculator</CardTitle>
                <CardDescription>Calculate the Wet Bulb Globe Temperature (WBGT) for assessing heat stress risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Environment</Label>
                    <div className="flex gap-4">
                        <Button variant={isOutdoor ? 'default' : 'outline'} onClick={() => setIsOutdoor(true)}><Sun className="mr-2"/>Outdoor (with solar load)</Button>
                        <Button variant={!isOutdoor ? 'default' : 'outline'} onClick={() => setIsOutdoor(false)}><Building className="mr-2"/>Indoor (or outdoor without sun)</Button>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nwb">Natural Wet Bulb (Tnwb)</Label>
                        <Input id="nwb" type="number" value={wetBulb} onChange={e => setWetBulb(e.target.value)} placeholder="°F" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="globe">Globe Temperature (Tg)</Label>
                        <Input id="globe" type="number" value={globeTemp} onChange={e => setGlobeTemp(e.target.value)} placeholder="°F" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dry" className={!isOutdoor ? 'text-muted-foreground' : ''}>Dry Bulb Temperature (Tdb)</Label>
                        <Input id="dry" type="number" value={dryBulb} onChange={e => setDryBulb(e.target.value)} placeholder="°F" disabled={!isOutdoor}/>
                    </div>
                </div>
                <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Droplets className="mr-2 h-5 w-5" />
                        Calculated WBGT
                    </h3>
                    <div className="p-4 bg-muted/50 rounded-lg min-h-[80px] flex items-center">
                        {result ? (
                            <p className="text-2xl font-bold text-primary">{result} °F</p>
                        ) : (
                            <p className="text-muted-foreground">Enter all required temperatures for the selected environment.</p>
                        )}
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Formula used: {isOutdoor ? "WBGT = 0.7(Tnwb) + 0.2(Tg) + 0.1(Tdb)" : "WBGT = 0.7(Tnwb) + 0.3(Tg)"}
                     </p>
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
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="twa-calculator">TWA Calculator</TabsTrigger>
            <TabsTrigger value="unit-converter">Unit Converter</TabsTrigger>
            <TabsTrigger value="ventilation">Ventilation</TabsTrigger>
            <TabsTrigger value="wbgt">WBGT</TabsTrigger>
          </TabsList>
          <TabsContent value="twa-calculator" className="mt-4">
            <TwaCalculator />
          </TabsContent>
          <TabsContent value="unit-converter" className="mt-4">
            <UnitConverter />
          </TabsContent>
          <TabsContent value="ventilation" className="mt-4">
            <VentilationCalculator />
          </TabsContent>
           <TabsContent value="wbgt" className="mt-4">
            <WbgtCalculator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    