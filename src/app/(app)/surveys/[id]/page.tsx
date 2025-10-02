

'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Header } from '@/components/header';
import { notFound, useParams } from 'next/navigation';
import { surveys as allSurveys } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Survey, AsbestosSample, PaintSample, FunctionalArea, HomogeneousArea } from '@/lib/types';
import Image from 'next/image';
import { MapPin, Calendar, User, FileText, CheckSquare, Camera, Upload, Bot, Printer, Copy, Loader2, Edit, TestTube, FlaskConical, CheckCircle, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SurveyChecklist } from '../survey-checklist';
import { AsbestosTable } from '../asbestos-table';
import { PaintTable } from '../paint-table';
import { FunctionalAreasTable } from '../functional-areas-table';
import { HomogeneousAreasTable } from '../homogeneous-areas-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AddEditSurveyDialog } from '../add-edit-survey-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { generateSurveyReport, GenerateSurveyReportOutput } from '@/ai/flows/generate-survey-report';
import { useUser } from '@/firebase';

// Helper to convert an image URL to a data URI
async function toDataUri(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


export default function SurveyDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const initialSurvey = allSurveys.find(s => s.id === id);
  
  if (!initialSurvey) {
    notFound();
  }

  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [homogeneousAreas, setHomogeneousAreas] = useState<HomogeneousArea[]>(survey?.homogeneousAreas || []);
  const [asbestosSamples, setAsbestosSamples] = useState<AsbestosSample[]>(survey?.asbestosSamples || []);
  const [paintSamples, setPaintSamples] = useState<PaintSample[]>(survey?.paintSamples || []);
  const [functionalAreas, setFunctionalAreas] = useState<FunctionalArea[]>(survey?.functionalAreas || []);

  const [mainPhoto, setMainPhoto] = useState<string | null>(survey?.sitePhotoUrl || null);
  const [floorPlan, setFloorPlan] = useState<string | null>(survey?.floorPlanUrl || null);
  const [exteriorPhotos, setExteriorPhotos] = useState<string[]>(survey?.exteriorPhotoUrls || []);
  const [interiorPhotos, setInteriorPhotos] = useState<string[]>(survey?.interiorPhotoUrls || []);
  const [samplePhotos, setSamplePhotos] = useState<string[]>(survey?.samplePhotoUrls || []);

  const asbestosFileInputRef = useRef<HTMLInputElement>(null);
  const paintFileInputRef = useRef<HTMLInputElement>(null);
  const [asbestosReports, setAsbestosReports] = useState<string[]>([]);
  const [paintReports, setPaintReports] = useState<string[]>([]);


  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GenerateSurveyReportOutput | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const { user } = useUser();
  const { toast } = useToast();

  // Sync state if initial survey changes (e.g. on navigation)
  useEffect(() => {
    const currentSurvey = allSurveys.find(s => s.id === id);
    if (currentSurvey) {
      setSurvey(currentSurvey);
      setHomogeneousAreas(currentSurvey.homogeneousAreas || []);
      setAsbestosSamples(currentSurvey.asbestosSamples || []);
      setPaintSamples(currentSurvey.paintSamples || []);
      setFunctionalAreas(currentSurvey.functionalAreas || []);
      setMainPhoto(currentSurvey.sitePhotoUrl || null);
      setFloorPlan(currentSurvey.floorPlanUrl || null);
      setExteriorPhotos(currentSurvey.exteriorPhotoUrls || []);
      setInteriorPhotos(currentSurvey.interiorPhotoUrls || []);
      setSamplePhotos(currentSurvey.samplePhotoUrls || []);
    }
  }, [id]);

  
  const handleSinglePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    category: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setter(result);
        toast({
          title: `Photo Uploaded`,
          description: `${file.name} added to ${category}.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultiplePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    category: string
  ) => {
     const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setter(prev => [...prev, result]);
        toast({
          title: `Photo Added`,
          description: `${file.name} added to ${category} gallery.`,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  const handleRemovePhoto = (
      index: number,
      setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
      setter(prev => prev.filter((_, i) => i !== index));
  }


  const handleReportUpload = (
    fileInputRef: React.RefObject<HTMLInputElement>,
    setReports: React.Dispatch<React.SetStateAction<string[]>>,
    reportType: string
    ) => {
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            setReports(prev => [...prev, file.name]);
            toast({
                title: 'Report Uploaded',
                description: `${file.name} has been added to ${reportType} reports.`
            });
            // Clear file input
            if(fileInputRef.current) fileInputRef.current.value = '';
        } else {
             toast({
                title: 'No File Selected',
                description: 'Please select a file to upload.',
                variant: 'destructive',
            });
        }
    }
  
    const PhotoUploader = ({
    title,
    currentPhoto,
    onUpload
    }: {
    title: string;
    currentPhoto?: string | null;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        return (
            <div className="space-y-4">
            {currentPhoto ? (
                <div className="aspect-video relative rounded-md overflow-hidden border">
                    <Image src={currentPhoto} alt={`${title} preview`} fill className="object-contain" />
                </div>
            ) : (
                <div className="aspect-video flex items-center justify-center rounded-md border-2 border-dashed">
                    <p className="text-muted-foreground">No {title} uploaded</p>
                </div>
            )}
            <Input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={onUpload} />
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {currentPhoto ? 'Change' : 'Upload'} {title}
            </Button>
            </div>
        );
    };

    const PhotoGalleryUploader = ({
        title,
        photos,
        onUpload,
        onRemove
    }: {
        title: string;
        photos: string[];
        onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
        onRemove: (index: number) => void;
    }) => {
        const inputRef = useRef<HTMLInputElement>(null);

        return (
            <div className="space-y-4">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                        <div key={index} className="aspect-square relative group rounded-md overflow-hidden border">
                            <Image src={photo} alt={`${title} photo ${index + 1}`} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="destructive" size="icon" onClick={() => onRemove(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                     {photos.length === 0 && (
                         <div className="col-span-full aspect-video flex items-center justify-center rounded-md border-2 border-dashed">
                            <p className="text-muted-foreground">No {title} photos</p>
                        </div>
                    )}
                </div>
                <Input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={onUpload} />
                <Button variant="outline" onClick={() => inputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Add {title} Photo
                </Button>
            </div>
        );
    };


  const getStatusVariant = (status: Survey['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'Completed': return 'default';
          case 'In Progress': return 'secondary';
          case 'On Hold': return 'destructive';
          default: return 'outline';
      }
  }
  
  const handleSaveSurvey = (surveyData: Omit<Survey, 'id' | 'sitePhotoUrl' | 'sitePhotoHint'> & { id?: string }) => {
     setSurvey(prev => ({...prev, ...surveyData} as Survey));
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setGeneratedReport(null);
    try {
        const [
            mainPhotoDataUri, 
            floorPlanDataUri,
            exteriorPhotoUris,
            interiorPhotoUris,
            samplePhotoUris,
            logoDataUri
        ] = await Promise.all([
            mainPhoto ? toDataUri(mainPhoto) : Promise.resolve(undefined),
            floorPlan ? toDataUri(floorPlan) : Promise.resolve(undefined),
            Promise.all(exteriorPhotos.map(url => toDataUri(url))),
            Promise.all(interiorPhotos.map(url => toDataUri(url))),
            Promise.all(samplePhotos.map(url => toDataUri(url))),
            user?.photoURL ? toDataUri(user.photoURL) : Promise.resolve(undefined),
        ]);

        const positiveMaterialPhotoDataUris = [...exteriorPhotoUris, ...interiorPhotoUris, ...samplePhotoUris];

        const serializableFAs = functionalAreas.map(fa => ({ id: fa.id, faId: fa.faId, faUse: fa.faUse, length: fa.length, width: fa.width, height: fa.height }));
        const serializableHAs = homogeneousAreas.map(ha => ({ id: ha.id, haId: ha.haId, description: ha.description, functionalAreaIds: ha.functionalAreaIds }));
        const serializableAsbestos = asbestosSamples.map(s => ({ id: s.id, sampleNumber: s.sampleNumber, homogeneousAreaId: s.homogeneousAreaId, location: s.location, material: s.material, asbestosType: s.asbestosType, asbestosPercentage: s.asbestosPercentage }));
        const serializablePaint = paintSamples.map(s => ({id: s.id, location: s.location, paintColor: s.paintColor, analyte: s.analyte, resultMgKg: s.resultMgKg}));
        
        const reportInput = {
            siteName: survey.siteName,
            address: survey.address,
            surveyDate: survey.surveyDate,
            inspector: survey.inspector,
            jobNumber: survey.jobNumber,
            surveyType: survey.surveyType,
            functionalAreas: serializableFAs,
            homogeneousAreas: serializableHAs,
            asbestosSamples: serializableAsbestos,
            paintSamples: serializablePaint,
            companyName: 'Bierlein', // This should be dynamic in a real app
            logoDataUri,
            mainPhotoDataUri,
            floorPlanDataUri,
            positiveMaterialPhotoDataUris,
        };

        const result = await generateSurveyReport(reportInput);
        setGeneratedReport(result);
        setIsReportDialogOpen(true);
    } catch (error) {
        console.error("Report generation failed:", error);
        toast({
            title: 'Report Generation Failed',
            description: 'An unexpected error occurred while generating the report. Check the console for details.',
            variant: 'destructive',
        });
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handlePrintReport = () => {
      const reportWindow = window.open('', '_blank');
      reportWindow?.document.write(generatedReport?.reportHtml || '');
      reportWindow?.document.close();
      reportWindow?.print();
  }

  const handleCopyReport = () => {
      if(generatedReport?.reportHtml) {
          navigator.clipboard.writeText(generatedReport.reportHtml);
          toast({ title: 'Report HTML Copied' });
      }
  }


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Survey: ${survey.siteName}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="font-headline">Survey Details</CardTitle>
                      <CardDescription>
                        Job #{survey.jobNumber}
                      </CardDescription>
                  </div>
                  <AddEditSurveyDialog survey={survey} onSave={handleSaveSurvey}>
                      <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Survey</span>
                      </Button>
                  </AddEditSurveyDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(survey.status)}>{survey.status}</Badge>
              </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{survey.address}</span>
              </div>
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">Job #{survey.jobNumber}</span>
              </div>
              <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{survey.inspector}</span>
              </div>
              <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                  <span>{new Date(survey.surveyDate).toLocaleDateString()}</span>
              </div>
              <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full">
                  {isGeneratingReport ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                      <><Bot className="mr-2 h-4 w-4" /> Generate AI Report</>
                  )}
              </Button>
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                      <Camera /> Photo Management
                  </CardTitle>
              </CardHeader>
                <CardContent>
                  <Tabs defaultValue="main">
                      <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="main">Main</TabsTrigger>
                          <TabsTrigger value="floor-plan">Floor Plan</TabsTrigger>
                          <TabsTrigger value="exterior">Exterior</TabsTrigger>
                          <TabsTrigger value="interior">Interior</TabsTrigger>
                          <TabsTrigger value="samples">Samples</TabsTrigger>
                      </TabsList>
                      <TabsContent value="main" className="mt-4">
                            <PhotoUploader 
                              title="Main Photo"
                              currentPhoto={mainPhoto}
                              onUpload={(e) => handleSinglePhotoUpload(e, setMainPhoto, 'Main Photo')}
                          />
                      </TabsContent>
                      <TabsContent value="floor-plan" className="mt-4">
                            <PhotoUploader 
                              title="Floor Plan"
                              currentPhoto={floorPlan}
                              onUpload={(e) => handleSinglePhotoUpload(e, setFloorPlan, 'Floor Plan')}
                          />
                      </TabsContent>
                        <TabsContent value="exterior" className="mt-4">
                            <PhotoGalleryUploader
                                title="Exterior"
                                photos={exteriorPhotos}
                                onUpload={(e) => handleMultiplePhotoUpload(e, setExteriorPhotos, 'Exterior')}
                                onRemove={(index) => handleRemovePhoto(index, setExteriorPhotos)}
                            />
                        </TabsContent>
                        <TabsContent value="interior" className="mt-4">
                            <PhotoGalleryUploader
                                title="Interior"
                                photos={interiorPhotos}
                                onUpload={(e) => handleMultiplePhotoUpload(e, setInteriorPhotos, 'Interior')}
                                onRemove={(index) => handleRemovePhoto(index, setInteriorPhotos)}
                            />
                        </TabsContent>
                        <TabsContent value="samples" className="mt-4">
                            <PhotoGalleryUploader
                                title="Sample"
                                photos={samplePhotos}
                                onUpload={(e) => handleMultiplePhotoUpload(e, setSamplePhotos, 'Sample')}
                                onRemove={(index) => handleRemovePhoto(index, setSamplePhotos)}
                            />
                        </TabsContent>
                  </Tabs>
              </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <CheckSquare />
                        Survey Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="homogeneous-areas">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="homogeneous-areas">Homogeneous Areas</TabsTrigger>
                            <TabsTrigger value="asbestos-samples">Asbestos Samples</TabsTrigger>
                            <TabsTrigger value="functional-areas">Functional Areas</TabsTrigger>
                            <TabsTrigger value="paint-samples">Paint Samples</TabsTrigger>
                            <TabsTrigger value="lab-reports">Lab Reports</TabsTrigger>
                            <TabsTrigger value="checklist">Checklist</TabsTrigger>
                        </TabsList>
                        <TabsContent value="homogeneous-areas" className="mt-4">
                            <HomogeneousAreasTable 
                                areas={homogeneousAreas} 
                                functionalAreas={functionalAreas}
                                asbestosSamples={asbestosSamples}
                                onSave={setHomogeneousAreas} 
                            />
                        </TabsContent>
                         <TabsContent value="asbestos-samples" className="mt-4">
                            <AsbestosTable 
                                samples={asbestosSamples} 
                                homogeneousAreas={homogeneousAreas} 
                                functionalAreas={functionalAreas}
                                onSave={setAsbestosSamples}
                                onHaCreated={setHomogeneousAreas} 
                            />
                        </TabsContent>
                        <TabsContent value="functional-areas" className="mt-4">
                            <FunctionalAreasTable areas={functionalAreas} onSave={setFunctionalAreas} />
                        </TabsContent>
                        <TabsContent value="paint-samples" className="mt-4">
                            <PaintTable samples={paintSamples} onSave={setPaintSamples} />
                        </TabsContent>
                        <TabsContent value="lab-reports" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="font-semibold flex items-center gap-2"><TestTube /> Asbestos Reports</h3>
                                     <div className="flex gap-2">
                                        <Input id="asbestos-report" type="file" ref={asbestosFileInputRef} accept=".pdf" />
                                        <Button onClick={() => handleReportUpload(asbestosFileInputRef, setAsbestosReports, 'Asbestos')}>
                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {asbestosReports.map((name, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>{name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div className="space-y-4 p-4 border rounded-lg">
                                    <h3 className="font-semibold flex items-center gap-2"><FlaskConical /> Paint Reports</h3>
                                    <div className="flex gap-2">
                                        <Input id="paint-report" type="file" ref={paintFileInputRef} accept=".pdf" />
                                        <Button onClick={() => handleReportUpload(paintFileInputRef, setPaintReports, 'Paint')}>
                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {paintReports.map((name, index) => (
                                             <div key={index} className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>{name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="checklist" className="mt-4">
                            <SurveyChecklist survey={survey} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>

        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline">
                        <Bot /> AI-Generated Survey Report
                    </DialogTitle>
                    <DialogDescription>
                        This report was generated by AI. Always verify critical information against source documents.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto border rounded-md">
                   {generatedReport?.reportHtml ? (
                       <iframe
                            srcDoc={generatedReport.reportHtml}
                            className="w-full h-full"
                            title="Survey Report"
                       />
                   ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No report content.</p>
                        </div>
                   )}
                </div>
                <DialogClose asChild>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={handleCopyReport}><Copy className="mr-2 h-4 w-4" /> Copy HTML</Button>
                        <Button onClick={handlePrintReport}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        <Button variant="secondary">Close</Button>
                    </div>
                </DialogClose>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
