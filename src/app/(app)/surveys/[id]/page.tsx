
'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/header';
import { notFound } from 'next/navigation';
import { surveys as allSurveys } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Survey, AsbestosSample, PaintSample, FunctionalArea, HomogeneousArea } from '@/lib/types';
import Image from 'next/image';
import { MapPin, Calendar, User, FileText, CheckSquare, Camera, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SurveyChecklist } from '../survey-checklist';
import { AsbestosTable } from '../asbestos-table';
import { PaintTable } from '../paint-table';
import { FunctionalAreasTable } from '../functional-areas-table';
import { HomogeneousAreasTable } from '../homogeneous-areas-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SurveyDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const survey = allSurveys.find(s => s.id === id);
  const [homogeneousAreas, setHomogeneousAreas] = useState<HomogeneousArea[]>(survey?.homogeneousAreas || []);
  const [asbestosSamples, setAsbestosSamples] = useState<AsbestosSample[]>(survey?.asbestosSamples || []);
  const [paintSamples, setPaintSamples] = useState<PaintSample[]>(survey?.paintSamples || []);
  const [functionalAreas, setFunctionalAreas] = useState<FunctionalArea[]>(survey?.functionalAreas || []);

  const [mainPhoto, setMainPhoto] = useState<string | null>(survey?.sitePhotoUrl || null);
  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  if (!survey) {
    notFound();
  }
  
  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<any>>, // This could be more specific
    category: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // In a real app, you'd upload this to a server/storage
        // For this prototype, we'll just store the data URL in state
        if (setter) {
            setter(result);
        }
        toast({
          title: `Photo Uploaded`,
          description: `${file.name} added to ${category}.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
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
        {currentPhoto && (
            <div className="aspect-video relative rounded-md overflow-hidden">
            <Image src={currentPhoto} alt={`${title} preview`} fill className="object-cover" />
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



  const getStatusVariant = (status: Survey['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'Completed': return 'default';
          case 'In Progress': return 'secondary';
          case 'On Hold': return 'destructive';
          default: return 'outline';
      }
  }
  
  const handleHaSave = (areas: HomogeneousArea[]) => {
      setHomogeneousAreas(areas);
  }

  const handleAsbestosSave = (samples: AsbestosSample[]) => {
      setAsbestosSamples(samples);
  }

  const handlePaintSave = (samples: PaintSample[]) => {
      setPaintSamples(samples);
  }
  
  const handleFunctionalAreasSave = (areas: FunctionalArea[]) => {
      setFunctionalAreas(areas);
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Survey: ${survey.siteName}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <CheckSquare />
                        Survey Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="homogeneous-areas">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="homogeneous-areas">Homogeneous Areas</TabsTrigger>
                            <TabsTrigger value="asbestos-samples">Asbestos Samples</TabsTrigger>
                            <TabsTrigger value="functional-areas">Functional Areas</TabsTrigger>
                            <TabsTrigger value="paint-samples">Paint Samples</TabsTrigger>
                            <TabsTrigger value="checklist">Checklist</TabsTrigger>
                        </TabsList>
                        <TabsContent value="homogeneous-areas" className="mt-4">
                            <HomogeneousAreasTable 
                                areas={homogeneousAreas} 
                                functionalAreas={functionalAreas}
                                asbestosSamples={asbestosSamples}
                                onSave={handleHaSave} 
                            />
                        </TabsContent>
                         <TabsContent value="asbestos-samples" className="mt-4">
                            <AsbestosTable 
                                samples={asbestosSamples} 
                                homogeneousAreas={homogeneousAreas} 
                                functionalAreas={functionalAreas}
                                onSave={handleAsbestosSave}
                                onHaCreated={setHomogeneousAreas} 
                            />
                        </TabsContent>
                        <TabsContent value="functional-areas" className="mt-4">
                            <FunctionalAreasTable areas={functionalAreas} onSave={handleFunctionalAreasSave} />
                        </TabsContent>
                        <TabsContent value="paint-samples" className="mt-4">
                            <PaintTable samples={paintSamples} onSave={handlePaintSave} />
                        </TabsContent>
                        <TabsContent value="checklist" className="mt-4">
                            <SurveyChecklist survey={survey} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Camera /> Photo Management
                    </CardTitle>
                </CardHeader>
                 <CardContent>
                    <Tabs defaultValue="main">
                        <TabsList>
                            <TabsTrigger value="main">Main Photo</TabsTrigger>
                            <TabsTrigger value="exterior">Exterior</TabsTrigger>
                            <TabsTrigger value="interior">Interior (FS)</TabsTrigger>
                            <TabsTrigger value="samples">Samples</TabsTrigger>
                        </TabsList>
                        <TabsContent value="main" className="mt-4">
                             <PhotoUploader 
                                title="Main Photo"
                                currentPhoto={mainPhoto}
                                onUpload={(e) => handlePhotoUpload(e, setMainPhoto, 'Main Photo')}
                            />
                        </TabsContent>
                        <TabsContent value="exterior" className="mt-4">
                             <PhotoUploader 
                                title="Exterior Photo"
                                onUpload={(e) => handlePhotoUpload(e, ()=>{}, 'Exterior')}
                            />
                        </TabsContent>
                        <TabsContent value="interior" className="mt-4">
                             <PhotoUploader 
                                title="Interior Photo"
                                onUpload={(e) => handlePhotoUpload(e, ()=>{}, 'Interior')}
                            />
                        </TabsContent>
                        <TabsContent value="samples" className="mt-4">
                             <PhotoUploader 
                                title="Sample Photo"
                                onUpload={(e) => handlePhotoUpload(e, ()=>{}, 'Samples')}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Survey Details</CardTitle>
                <CardDescription>
                  Details for job #{survey.jobNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {mainPhoto && (
                  <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                    <Image
                        src={mainPhoto}
                        alt={`Site photo for ${survey.siteName}`}
                        fill
                        className="object-cover"
                        data-ai-hint={survey.sitePhotoHint}
                    />
                  </div>
                 )}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
