
'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, PlusCircle, Calculator, Copy, RefreshCw, Wind, Sun, Building, Droplets, ChevronsRight, ArrowUp, ArrowDown, AlertTriangle, Users, LocateFixed, Thermometer, Shield, UserCheck, ClockIcon, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { ExposureLimit } from '@/lib/types';


const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;


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

type PaintSampleRow = {
  id: number;
  sampleNumber: string;
  location: string;
  resultMgKg: string;
};

function PaintConverter() {
  const [rows, setRows] = useState<PaintSampleRow[]>([
    { id: 1, sampleNumber: '', location: '', resultMgKg: '' },
  ]);
  const { toast } = useToast();

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now(), sampleNumber: '', location: '', resultMgKg: '' }]);
  };

  const handleRemoveRow = (id: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter(row => row.id !== id));
  };

  const handleRowChange = (id: number, field: keyof PaintSampleRow, value: string) => {
    setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const stats = useMemo(() => {
    const validRows = rows.filter(row => row.resultMgKg && !isNaN(parseFloat(row.resultMgKg)));
    if (validRows.length === 0) return { max: null, min: null };
    
    let maxRow = validRows[0];
    let minRow = validRows[0];

    for(const row of validRows) {
        if(parseFloat(row.resultMgKg) > parseFloat(maxRow.resultMgKg)) {
            maxRow = row;
        }
        if(parseFloat(row.resultMgKg) < parseFloat(minRow.resultMgKg)) {
            minRow = row;
        }
    }

    return { max: maxRow, min: minRow };
  }, [rows]);

  const handleCopyAll = () => {
    const header = "Sample #\tLocation\tResult (mg/kg)\t% by Weight\n";
    const data = rows.map(row => {
        const mgKg = parseFloat(row.resultMgKg);
        const percent = !isNaN(mgKg) ? (mgKg / 10000).toFixed(4) : '';
        return `${row.sampleNumber}\t${row.location}\t${row.resultMgKg}\t${percent}`;
    }).join('\n');
    navigator.clipboard.writeText(header + data);
    toast({
        title: 'Data Copied',
        description: `${rows.length} rows copied to clipboard for Excel.`
    });
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground">
            <div className="col-span-2">Sample #</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-3">Result (mg/kg)</div>
            <div className="col-span-3">% by Weight</div>
        </div>
      {rows.map((row, index) => (
        <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-2">
            <Input
              placeholder={`Sample ${index + 1}`}
              value={row.sampleNumber}
              onChange={(e) => handleRowChange(row.id, 'sampleNumber', e.target.value)}
            />
          </div>
          <div className="col-span-3">
            <Input
              placeholder="e.g., North wall"
              value={row.location}
              onChange={(e) => handleRowChange(row.id, 'location', e.target.value)}
            />
          </div>
          <div className="col-span-3">
             <Input
                type="number"
                placeholder="e.g., 5000"
                value={row.resultMgKg}
                onChange={(e) => handleRowChange(row.id, 'resultMgKg', e.target.value)}
                />
          </div>
          <div className="col-span-3">
            <Input
              value={row.resultMgKg && !isNaN(parseFloat(row.resultMgKg)) ? (parseFloat(row.resultMgKg) / 10000).toFixed(4) : ''}
              readOnly
              disabled
              className="font-medium bg-muted"
            />
          </div>
          <div className="col-span-1">
            <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(row.id)} disabled={rows.length === 1}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
      <div className="flex justify-between">
          <Button variant="outline" onClick={handleAddRow}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Row
          </Button>
          <Button onClick={handleCopyAll} disabled={rows.length === 0}>
             <Copy className="mr-2 h-4 w-4" /> Copy for Excel
          </Button>
      </div>

       {(stats.max || stats.min) && (
            <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {stats.max && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                             <p className="text-sm text-muted-foreground flex items-center"><ArrowUp className="text-red-500 mr-1"/> Max Concentration</p>
                             <p className="text-lg font-bold">{stats.max.sampleNumber || 'N/A'}</p>
                             <p className="text-primary">{stats.max.resultMgKg} mg/kg</p>
                        </div>
                    )}
                    {stats.min && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                             <p className="text-sm text-muted-foreground flex items-center"><ArrowDown className="text-green-500 mr-1"/> Min Concentration</p>
                             <p className="text-lg font-bold">{stats.min.sampleNumber || 'N/A'}</p>
                             <p className="text-primary">{stats.min.resultMgKg} mg/kg</p>
                        </div>
                    )}
                </div>
            </div>
       )}
    </div>
  );
}


function UnitConverter() {
    const [conversionType, setConversionType] = useState('mg-to-ppm');
    const [inputValue, setInputValue] = useState('');
    const [molecularWeight, setMolecularWeight] = useState('');
    
    const simpleResult = useMemo(() => {
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
                            <SelectItem value="mg-to-ppm">mg/m³ <ChevronsRight className="inline h-4 w-4 mx-1"/> ppm</SelectItem>
                            <SelectItem value="ppm-to-mg">ppm <ChevronsRight className="inline h-4 w-4 mx-1"/> mg/m³</SelectItem>
                            <SelectItem value="fcc-to-fm3">f/cc <ChevronsRight className="inline h-4 w-4 mx-1"/> f/m³</SelectItem>
                            <SelectItem value="paint-percent">Paint (mg/kg <ChevronsRight className="inline h-4 w-4 mx-1"/> % by weight)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {conversionType === 'paint-percent' ? (
                    <PaintConverter />
                ) : (
                    <>
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="input-value">Input Value</Label>
                                <Input id="input-value" type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                            </div>
                            {(conversionType === 'mg-to-ppm' || conversionType === 'ppm-to-mg') && (
                                <div className="space-y-2">
                                    <Label htmlFor="mw">Molecular Weight (g/mol)</Label>
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
                                {simpleResult ? (
                                    <p className="text-2xl font-bold text-primary">{simpleResult}</p>
                                ): (
                                    <p className="text-muted-foreground">Enter values to see the result.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function VentilationCalculator() {
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [targetAch, setTargetAch] = useState('');
    const [cfmSelection, setCfmSelection] = useState('low');
    const [customCfm, setCustomCfm] = useState('');

    const machineCfmOptions: { [key: string]: number } = {
        low: 1300,
        high: 2000,
    };

    const roomVolume = useMemo(() => {
        const l = parseFloat(length);
        const w = parseFloat(width);
        const h = parseFloat(height);
        if (isNaN(l) || isNaN(w) || isNaN(h) || l <= 0 || w <= 0 || h <= 0) {
            return null;
        }
        return l * w * h;
    }, [length, width, height]);

    const requiredCfmResult = useMemo(() => {
        const airChanges = parseFloat(targetAch);
        if (roomVolume === null || isNaN(airChanges) || airChanges <= 0) {
            return null;
        }
        return (roomVolume * airChanges) / 60;
    }, [roomVolume, targetAch]);

    const achievedAchResult = useMemo(() => {
        if (roomVolume === null) return null;
        let cfm = 0;
        if (cfmSelection === 'custom') {
            cfm = parseFloat(customCfm);
        } else {
            cfm = machineCfmOptions[cfmSelection];
        }

        if (isNaN(cfm) || cfm <= 0) return null;
        
        return (cfm * 60) / roomVolume;

    }, [roomVolume, cfmSelection, customCfm, machineCfmOptions]);
    
    const recommendedMachines = useMemo(() => {
        if (requiredCfmResult === null || requiredCfmResult <= 0) return null;
    
        let machineCfm = 0;
        if (cfmSelection === 'custom') {
            machineCfm = parseFloat(customCfm);
        } else {
            machineCfm = machineCfmOptions[cfmSelection];
        }
    
        if (isNaN(machineCfm) || machineCfm <= 0) return null;
    
        return Math.ceil(requiredCfmResult / machineCfm);
    
    }, [requiredCfmResult, cfmSelection, customCfm, machineCfmOptions]);

    const showAchWarning = useMemo(() => {
        const ach = parseFloat(targetAch);
        return !isNaN(ach) && ach > 0 && ach < 6;
    }, [targetAch]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Ventilation Calculator</CardTitle>
                <CardDescription>Calculate required airflow (CFM) for a target ACH, or the achieved ACH for your equipment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Part 1: Calculate Required CFM */}
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="ach">Target Air Changes per Hour (ACH)</Label>
                            <TooltipProvider>
                                <Tooltip open={showAchWarning}>
                                    <TooltipTrigger asChild>
                                        <Input id="ach" type="number" value={targetAch} onChange={e => setTargetAch(e.target.value)} placeholder="e.g., 6" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-destructive"/>
                                            <p>A minimum of 6 ACH is recommended.</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center mb-2">
                                    <Wind className="mr-2 h-5 w-5" />
                                    Required Airflow
                                </h3>
                                <div className="p-4 bg-muted/50 rounded-lg min-h-[96px]">
                                    {requiredCfmResult !== null ? (
                                        <>
                                            <p className="text-sm text-muted-foreground">Required CFM to achieve {targetAch} ACH</p>
                                            <p className="text-2xl font-bold text-primary">{requiredCfmResult.toFixed(2)} CFM</p>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Enter room dimensions and a target ACH.</p>
                                    )}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold flex items-center mb-2">
                                    <Users className="mr-2 h-5 w-5" />
                                    Recommended Machines
                                </h3>
                                <div className="p-4 bg-muted/50 rounded-lg min-h-[96px]">
                                    {recommendedMachines !== null ? (
                                        <>
                                            <p className="text-sm text-muted-foreground">Machines needed for selected CFM</p>
                                            <p className="text-2xl font-bold text-primary">{recommendedMachines}</p>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Enter required info and select a machine.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Part 2: Calculate Achieved ACH */}
                    <div className="space-y-4">
                        <div>
                            <Label>Select Machine CFM</Label>
                             <RadioGroup value={cfmSelection} onValueChange={setCfmSelection} className="mt-2 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="low" id="low" />
                                    <Label htmlFor="low">Abatement Technologies HEPA-AIRE® H2KM - Low (1,300 CFM)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="high" id="high" />
                                    <Label htmlFor="high">Abatement Technologies HEPA-AIRE® H2KM - High (2,000 CFM)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="custom" id="custom" />
                                    <Label htmlFor="custom" className="flex-1">Custom</Label>
                                    <Input
                                        id="custom-cfm"
                                        type="number"
                                        placeholder="CFM"
                                        value={customCfm}
                                        onChange={e => setCustomCfm(e.target.value)}
                                        disabled={cfmSelection !== 'custom'}
                                        className="w-24 h-8"
                                    />
                                </div>
                            </RadioGroup>
                        </div>
                         <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold flex items-center mb-2">
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Achieved ACH
                            </h3>
                            <div className="p-4 bg-muted/50 rounded-lg min-h-[96px]">
                                 {achievedAchResult !== null ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">Achieved ACH with selected CFM</p>
                                        <p className="text-2xl font-bold text-primary">{achievedAchResult.toFixed(2)} ACH</p>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Enter room dimensions and select a CFM option.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const heatStressLevels = [
    { level: 'Low', min: 0, max: 82, color: 'bg-green-500', recommendation: "Normal work activities. Standard hydration protocols." },
    { level: 'Moderate', min: 82, max: 87, color: 'bg-yellow-500', recommendation: "20 min work, 10 min rest per hour. Increase hydration reminders." },
    { level: 'High', min: 87, max: 90, color: 'bg-orange-500', recommendation: "15 min work, 45 min rest per hour. Actively monitor workers for signs of heat stress." },
    { level: 'Extreme', min: 90, max: Infinity, color: 'bg-red-500', recommendation: "Stop all non-essential work. Only emergency work with strict controls." },
];

function HeatStressChart({ wbgt }: { wbgt: number | null }) {
    const minWbgt = 75;
    const maxWbgt = 95;
    const range = maxWbgt - minWbgt;

    const getIndicatorPosition = () => {
        if (wbgt === null || wbgt < minWbgt) return '-5%';
        if (wbgt > maxWbgt) return '105%';
        const percentage = ((wbgt - minWbgt) / range) * 100;
        return `${percentage}%`;
    }

    return (
        <div className="space-y-4">
             <h3 className="text-lg font-semibold flex items-center">
                <Thermometer className="mr-2 h-5 w-5" />
                Heat Stress Risk Level
            </h3>
            <div className="relative w-full h-8 flex rounded-full overflow-hidden border">
                {heatStressLevels.map(({ level, min, max, color }) => {
                    if(level === 'Low' || level === 'Extreme') return null;
                    const left = ((min - minWbgt) / range) * 100;
                    const width = ((max - min) / range) * 100;
                    return (
                        <div key={level} className={color} style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%' }} />
                    )
                })}
                 <div key="Low" className="bg-green-500" style={{ position: 'absolute', left: '0%', width: `${((82 - minWbgt) / range) * 100}%`, height: '100%' }} />
                 <div key="Extreme" className="bg-red-500" style={{ position: 'absolute', right: '0%', width: `${((maxWbgt - 90) / range) * 100}%`, height: '100%' }} />
                
                {wbgt !== null && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="absolute top-[-50%] -translate-x-1/2 h-[200%] w-px bg-foreground transition-all duration-300 ease-in-out"
                                    style={{ left: getIndicatorPosition() }}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-foreground border-2 border-background" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Calculated WBGT: {wbgt}°F</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-green-500">Low</span>
                <span className="text-yellow-500">Moderate</span>
                <span className="text-orange-500">High</span>
                <span className="text-red-500">Extreme</span>
            </div>
        </div>
    );
}

function WbgtCalculator() {
    const [isOutdoor, setIsOutdoor] = useState(true);
    const [dryBulb, setDryBulb] = useState(''); // Tdb
    const [wetBulb, setWetBulb] = useState(''); // Tnwb
    const [globeTemp, setGlobeTemp] = useState(''); // Tg
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const result = useMemo(() => {
        const tdb = parseFloat(dryBulb);
        const tnwb = parseFloat(wetBulb);
        const tg = parseFloat(globeTemp);

        if (isNaN(tnwb) || isNaN(tg)) return null;

        if (isOutdoor) {
            if(isNaN(tdb)) return null;
            const wbgt = (0.7 * tnwb) + (0.2 * tg) + (0.1 * tdb);
            return wbgt;
        } else { // Indoor
            const wbgt = (0.7 * tnwb) + (0.3 * tg);
            return wbgt;
        }

    }, [isOutdoor, dryBulb, wetBulb, globeTemp]);
    
    const currentRecommendation = useMemo(() => {
        if (result === null) return null;
        return heatStressLevels.find(level => result >= level.min && result < level.max) || heatStressLevels[heatStressLevels.length -1];
    }, [result]);

    const handleFetchWeather = () => {
        setIsLoading(true);
        if (!navigator.geolocation) {
            toast({
                title: "Geolocation Not Supported",
                description: "Your browser does not support geolocation.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                if (!weatherApiKey) {
                    toast({
                        title: "API Key Missing",
                        description: "Weather API key is not configured.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }

                const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}&aqi=no`;
                
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Weather API Error: ${response.statusText}`);
                    }
                    const data = await response.json();
                    
                    const tempF = data.current.temp_f;
                    const humidity = data.current.humidity; // in percentage

                    const estimatedTnwb = tempF * Math.atan(0.151977 * Math.pow(humidity + 8.313659, 0.5)) + Math.atan(tempF + humidity) - Math.atan(humidity - 1.676331) + 0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) - 4.686035;
                    const estimatedTg = tempF + 5;
                    
                    setDryBulb(tempF.toFixed(1));
                    setWetBulb(estimatedTnwb.toFixed(1));
                    setGlobeTemp(estimatedTg.toFixed(1));

                    toast({
                        title: "Weather Data Fetched",
                        description: `Data for ${data.location.name} populated.`,
                    });

                } catch (error: any) {
                    toast({
                        title: "Failed to Fetch Weather",
                        description: error.message || "An unknown error occurred.",
                        variant: "destructive",
                    });
                } finally {
                    setIsLoading(false);
                }
            },
            (error) => {
                toast({
                    title: "Geolocation Failed",
                    description: error.message,
                    variant: "destructive",
                });
                setIsLoading(false);
            }
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Heat Stress Calculator (WBGT)</CardTitle>
                <CardDescription>Calculate the Wet Bulb Globe Temperature to assess heat stress risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Environment</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant={isOutdoor ? 'default' : 'outline'} onClick={() => setIsOutdoor(true)}><Sun className="mr-2"/>Outdoor (with solar load)</Button>
                        <Button variant={!isOutdoor ? 'default' : 'outline'} onClick={() => setIsOutdoor(false)}><Building className="mr-2"/>Indoor (or outdoor without sun)</Button>
                        <Button variant="outline" onClick={handleFetchWeather} disabled={isLoading}>
                            <LocateFixed className="mr-2"/> 
                            {isLoading ? 'Fetching...' : 'Use Current Location'}
                        </Button>
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
                        {result !== null ? (
                            <p className="text-2xl font-bold text-primary">{result.toFixed(1)} °F</p>
                        ) : (
                            <p className="text-muted-foreground">Enter all required temperatures for the selected environment.</p>
                        )}
                    </div>
                     <p className="text-xs text-muted-foreground">
                        Formula used: {isOutdoor ? "WBGT = 0.7(Tnwb) + 0.2(Tg) + 0.1(Tdb)" : "WBGT = 0.7(Tnwb) + 0.3(Tg)"}
                     </p>
                </div>
                {result !== null && (
                    <div className="border-t pt-6 space-y-4">
                         <HeatStressChart wbgt={result} />
                    </div>
                )}
                 {currentRecommendation && (
                    <div className="border-t pt-6 space-y-4">
                         <h3 className="text-lg font-semibold flex items-center">
                            <UserCheck className="mr-2 h-5 w-5" />
                            Work/Rest & Hydration Recommendation
                        </h3>
                        <Alert variant={currentRecommendation.level === 'High' || currentRecommendation.level === 'Extreme' ? 'destructive' : 'default'}>
                            <AlertTriangle className={`h-4 w-4 ${currentRecommendation.level === 'Low' || currentRecommendation.level === 'Moderate' ? 'hidden' : ''}`} />
                            <CardTitle>
                                <span style={{ color: currentRecommendation.color.startsWith('bg-') ? undefined : currentRecommendation.color }}>
                                    {currentRecommendation.level} Risk
                                </span>
                            </CardTitle>
                            <AlertDescription>
                                {currentRecommendation.recommendation}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const apfOptions = [
    { value: '1', label: 'No Protection' },
    { value: '10', label: 'Half-Mask APR' },
    { value: '25', label: 'PAPR, Loose-Fitting Facepiece' },
    { value: '50', label: 'Full-Facepiece APR / PAPR w/ Half-Mask' },
    { value: '1000', label: 'PAPR or SAR w/ Full-Facepiece' },
    { value: '10000', label: 'SCBA, Pressure-Demand Full-Facepiece' },
];

type PpeSample = {
    id: number;
    analyteId: string;
    concentration: string;
    apf: string;
    duration: string;
};

function PpeCalculator() {
    const [samples, setSamples] = useState<PpeSample[]>([
        { id: 1, analyteId: '', concentration: '', apf: '', duration: '' },
    ]);
    const { toast } = useToast();
    const { user } = useUser();
    const orgId = user?.orgId;
    const firestore = useFirestore();

    const limitsQuery = useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'analytes')) : null, [firestore, orgId]);
    const { data: exposureLimits } = useCollection<ExposureLimit>(limitsQuery);

    const handleAddSample = () => {
        setSamples([
            ...samples,
            { id: Date.now(), analyteId: '', concentration: '', apf: '', duration: '' },
        ]);
    };

    const handleRemoveSample = (id: number) => {
        if (samples.length > 1) {
            setSamples(samples.filter((sample) => sample.id !== id));
        } else {
            toast({
                title: 'Cannot remove last sample',
                variant: 'destructive',
            });
        }
    };

    const handleSampleChange = (id: number, field: keyof PpeSample, value: string) => {
        setSamples(samples.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const generateReport = () => {
        const reportContent = `
      <html>
        <head>
          <title>PPE Exposure Assessment Report</title>
          <style>
            body { font-family: sans-serif; margin: 2rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
            .status-ok { color: green; }
            .status-warning { color: orange; }
            .status-danger { color: red; }
          </style>
        </head>
        <body>
          <h1>PPE Exposure Assessment Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Analyte</th>
                <th>Measured Conc.</th>
                <th>APF</th>
                <th>In-Mask Conc.</th>
                <th>Duration (min)</th>
                <th>8-hr TWA</th>
                <th>PEL</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${samples
                .map((sample) => {
                    if (!exposureLimits) return '';
                    const analyte = exposureLimits.find((l) => l.id === sample.analyteId);
                    const conc = parseFloat(sample.concentration);
                    const protectionFactor = parseInt(sample.apf, 10);
                    const dur = parseFloat(sample.duration);

                    if (!analyte || isNaN(conc) || isNaN(protectionFactor) || protectionFactor <= 0 || isNaN(dur)) {
                        return '<tr><td colspan="8">Incomplete data for one row</td></tr>';
                    }

                    const effectiveExposure = conc / protectionFactor;
                    const twa = (effectiveExposure * dur) / 480;
                    
                    let status = { text: 'Below AL', className: 'status-ok' };
                    if (analyte.pel && twa > analyte.pel) {
                        status = { text: 'Above PEL', className: 'status-danger' };
                    } else if (analyte.al && twa > analyte.al) {
                        status = { text: 'Above AL', className: 'status-warning' };
                    }

                    return `
                    <tr>
                      <td>${analyte.name}</td>
                      <td>${conc} ${analyte.unit}</td>
                      <td>${protectionFactor}</td>
                      <td>${effectiveExposure.toFixed(4)} ${analyte.unit}</td>
                      <td>${dur}</td>
                      <td>${twa.toFixed(4)} ${analyte.unit}</td>
                      <td>${analyte.pel} ${analyte.unit}</td>
                      <td class="${status.className}">${status.text}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

        const reportWindow = window.open('', '_blank');
        reportWindow?.document.write(reportContent);
        reportWindow?.document.close();
        reportWindow?.print();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Effective Exposure & TWA Calculator</CardTitle>
                <CardDescription>
                    Estimate contaminant concentrations inside a respirator and the resulting 8-hour TWA for multiple samples.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    {samples.map((sample, index) => (
                        <div key={sample.id} className="p-4 border rounded-lg space-y-4 relative">
                           <h4 className="font-semibold">Sample {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`analyte-${sample.id}`}>Analyte</Label>
                                    <Select value={sample.analyteId} onValueChange={(v) => handleSampleChange(sample.id, 'analyteId', v)}>
                                        <SelectTrigger id={`analyte-${sample.id}`}>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exposureLimits?.map((limit) => (
                                                <SelectItem key={limit.id} value={limit.id}>{limit.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`concentration-${sample.id}`}>Measured Conc.</Label>
                                    <Input
                                        id={`concentration-${sample.id}`}
                                        type="number"
                                        value={sample.concentration}
                                        onChange={(e) => handleSampleChange(sample.id, 'concentration', e.target.value)}
                                        placeholder="e.g., 1.25"
                                        disabled={!sample.analyteId}
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`apf-${sample.id}`}>Respirator (APF)</Label>
                                    <Select value={sample.apf} onValueChange={(v) => handleSampleChange(sample.id, 'apf', v)}>
                                        <SelectTrigger id={`apf-${sample.id}`}>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {apfOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`duration-${sample.id}`}>Duration (min)</Label>
                                    <Input
                                        id={`duration-${sample.id}`}
                                        type="number"
                                        value={sample.duration}
                                        onChange={(e) => handleSampleChange(sample.id, 'duration', e.target.value)}
                                        placeholder="e.g., 240"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => handleRemoveSample(sample.id)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={handleAddSample}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Sample
                    </Button>
                    <Button onClick={generateReport} disabled={samples.length === 0 || !exposureLimits}>
                        <Printer className="mr-2 h-4 w-4" /> Generate PDF Report
                    </Button>
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
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="twa-calculator">TWA Calculator</TabsTrigger>
            <TabsTrigger value="unit-converter">Unit Converter</TabsTrigger>
            <TabsTrigger value="ventilation">Ventilation</TabsTrigger>
            <TabsTrigger value="heat-stress">Heat Stress</TabsTrigger>
            <TabsTrigger value="ppe">PPE</TabsTrigger>
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
           <TabsContent value="heat-stress" className="mt-4">
            <WbgtCalculator />
          </TabsContent>
          <TabsContent value="ppe" className="mt-4">
            <PpeCalculator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
