
'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search } from 'lucide-react';
import { samples as initialSamples, personnel as initialPersonnel, projects, tasks, exposureLimits } from '@/lib/data';
import type { Sample, Result, Personnel } from '@/lib/types';
import { SamplesDataTable } from '../samples/samples-data-table';
import { columns as sampleColumns } from '../samples/columns';
import { PersonnelList } from '../personnel/personnel-list';
import { AddSampleDialog } from '../samples/add-sample-dialog';
import { AddPersonnelDialog } from '../personnel/add-personnel-dialog';
import { ImportPersonnelDialog } from '../personnel/import-personnel-dialog';
import { ImportSamplesDialog } from './import-samples-dialog';
import { differenceInMinutes, parse } from 'date-fns';

export default function AirMonitoringPage() {
  const [samples, setSamples] = useState(initialSamples);
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [activeTab, setActiveTab] = useState<string>("samples");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [analyteFilter, setAnalyteFilter] = useState<string>("all");
  const [sampleTypeFilter, setSampleTypeFilter] = useState<string>("all");

  const processNewSample = (newSampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string, resultData?: { analyte: string; concentration: number; }}) => {
    const getMinutes = (start: string, stop: string) => {
        if (start && stop) {
            try {
                const startDate = parse(start, 'yyyy-MM-dd HH:mm', new Date());
                const stopDate = parse(stop, 'yyyy-MM-dd HH:mm', new Date());
                if (stopDate > startDate) {
                    return differenceInMinutes(stopDate, startDate);
                }
            } catch (e) { return 0; }
        }
        return 0;
    }

    const duration = getMinutes(newSampleData.startTime, newSampleData.stopTime);
    const volume = duration * newSampleData.flowRate;
    
    let resultPayload: Result | undefined = undefined;
    const resultData = (newSampleData as any).result || (newSampleData as any).resultData;
    if(resultData?.analyte) {
        const existingResult = newSampleData.id ? samples.find(s => s.id === newSampleData.id)?.result : undefined;
        
        let status: Result['status'] = 'Pending';
        const concentration = resultData.concentration;
        if(concentration !== undefined && concentration !== null) {
            const limit = exposureLimits.find(l => l.analyte.toLowerCase() === resultData!.analyte!.toLowerCase());
            if(limit) {
              if (concentration > limit.pel) status = '>PEL';
              else if (concentration >= limit.al) status = '≥AL';
              else status = 'OK';
            } else {
              status = 'OK'; // Default if no limit is found
            }
        }

        resultPayload = {
            id: existingResult?.id || `res-${Math.random()}`,
            sampleId: newSampleData.id || '',
            analyte: resultData.analyte,
            concentration: resultData.concentration ?? 0,
            status: status,
            method: existingResult?.method || '',
            units: existingResult?.units || exposureLimits.find(l => l.analyte.toLowerCase() === resultData!.analyte!.toLowerCase())?.units || '',
            reportingLimit: existingResult?.reportingLimit || 0,
            lab: existingResult?.lab || '',
        }
    }

    const finalSample = {
      ...newSampleData,
      duration,
      volume,
      result: resultPayload
    };

    // remove temporary property
    delete (finalSample as any).resultData;

    return finalSample;
  }

  const handleSaveSample = (newSampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string, result?: Partial<Result> }) => {
      const finalSample = processNewSample(newSampleData);

      if (newSampleData.id) {
          setSamples(prevSamples => prevSamples.map(s => s.id === newSampleData.id ? { ...s, ...finalSample } as Sample : s));
      } else {
          const newSampleWithId = {
              ...finalSample,
              id: `samp-${Math.floor(Math.random() * 10000)}`,
          };
          if(newSampleWithId.result) newSampleWithId.result.sampleId = newSampleWithId.id;
          setSamples(prevSamples => [newSampleWithId, ...prevSamples]);
      }
  };

  const handleImportSamples = (importedSamples: (Omit<Sample, 'id'> & { resultData: any })[]) => {
      const newSamples: Sample[] = importedSamples.map((sampleData, index) => {
        const finalSample = processNewSample(sampleData);
        const newSampleWithId = {
            ...finalSample,
            id: `samp-${Date.now()}-${index}`,
        };
        if(newSampleWithId.result) newSampleWithId.result.sampleId = newSampleWithId.id;
        return newSampleWithId as Sample;
      });
      setSamples(prev => [...newSamples, ...prev]);
  }

  const handleDeleteSample = (sampleId: string) => {
    setSamples(prevSamples => prevSamples.filter(s => s.id !== sampleId));
  };

  const handleSavePersonnel = (personData: Omit<Personnel, 'id'> & { id?: string }) => {
    if (personData.id) {
      setPersonnel(prev => prev.map(p => p.id === personData.id ? { ...p, ...personData } as Personnel : p));
    } else {
      const newPersonnel: Personnel = { ...personData, id: `per-${Date.now()}` };
      setPersonnel(prev => [newPersonnel, ...prev]);
    }
  };

  const handleDeletePersonnel = (personnelId: string) => {
    setPersonnel(prev => prev.filter(p => p.id !== personnelId));
  };

  const handleImportPersonnel = (newPersonnel: Omit<Personnel, 'id'>[]) => {
    const personnelWithIds: Personnel[] = newPersonnel.map((p, index) => ({
      ...p,
      id: `per-${Date.now()}-${index}`,
    }));
    setPersonnel(prev => [...personnelWithIds, ...prev]);
  };

  const samplesWithDetails = useMemo(() => {
    return samples.map(sample => {
      const project = projects.find(p => p.id === sample.projectId);
      const task = tasks.find(t => t.id === sample.taskId);
      const person = personnel.find(p => p.id === sample.personnelId);
      return {
        ...sample,
        projectName: project?.name,
        taskName: task?.name,
        personnelName: person?.name,
        status: sample.result?.status || 'Pending',
        analyte: sample.result?.analyte,
        concentration: sample.result?.concentration,
        units: sample.result?.units,
      };
    });
  }, [samples, personnel]);

  const filteredSamples = useMemo(() => {
    return samplesWithDetails.filter(sample => {
      const sQuery = searchQuery.toLowerCase();
      const matchesSearch = sQuery === "" ||
        sample.projectName?.toLowerCase().includes(sQuery) ||
        sample.personnelName?.toLowerCase().includes(sQuery) ||
        sample.id.toLowerCase().includes(sQuery);

      const matchesStatus = statusFilter === "all" || (sample.status?.toLowerCase() ?? 'pending') === statusFilter;
      const matchesAnalyte = analyteFilter === "all" || (sample.analyte?.toLowerCase() ?? '') === analyteFilter;
      const matchesSampleType = sampleTypeFilter === "all" || sample.sampleType.toLowerCase() === sampleTypeFilter;

      return matchesSearch && matchesStatus && matchesAnalyte && matchesSampleType;
    });
  }, [samplesWithDetails, searchQuery, statusFilter, analyteFilter, sampleTypeFilter]);

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person: Personnel) => {
      const sQuery = searchQuery.toLowerCase();
      const matchesSearch = sQuery === "" ||
        person.name.toLowerCase().includes(sQuery) ||
        person.employeeId.toLowerCase().includes(sQuery);
      return matchesSearch;
    });
  }, [personnel, searchQuery]);

  const uniqueAnalytes = useMemo(() => {
    const allAnalytes = new Set(samplesWithDetails.map(s => s.analyte).filter(Boolean) as string[]);
    return Array.from(allAnalytes);
  }, [samplesWithDetails]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Air Monitoring" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold tracking-tight">
                Manage Samples & Personnel
            </h2>
            <div className="flex gap-2">
                <ImportSamplesDialog onImport={handleImportSamples} />
                <AddSampleDialog onSave={handleSaveSample} sample={null}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Sample
                    </Button>
                </AddSampleDialog>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="samples">Samples ({filteredSamples.length})</TabsTrigger>
            <TabsTrigger value="personnel">Personnel ({filteredPersonnel.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="samples" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by project, personnel, or sample ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="≥al">≥AL</SelectItem>
                        <SelectItem value=">pel">>PEL</SelectItem>
                        <SelectItem value=">el">>EL</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={analyteFilter} onValueChange={setAnalyteFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Analyte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Analytes</SelectItem>
                        {uniqueAnalytes.map(analyte => (
                            <SelectItem key={analyte} value={analyte.toLowerCase()}>{analyte}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sampleTypeFilter} onValueChange={setSampleTypeFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                        <SelectItem value="blank">Blank</SelectItem>
                        <SelectItem value="excursion">Excursion</SelectItem>
                        <SelectItem value="clearance">Clearance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                  <SamplesDataTable columns={sampleColumns} data={filteredSamples} />
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="personnel" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or employee ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                    <ImportPersonnelDialog onImport={handleImportPersonnel} />
                    <AddPersonnelDialog person={null} onSave={handleSavePersonnel}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Personnel
                        </Button>
                    </AddPersonnelDialog>
                </div>
              </div>
              <Card>
                  <CardContent className="p-0">
                      <PersonnelList 
                          personnel={filteredPersonnel} 
                          onSave={handleSavePersonnel} 
                          onDelete={handleDeletePersonnel}
                      />
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
