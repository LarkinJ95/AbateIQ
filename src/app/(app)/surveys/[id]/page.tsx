
'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { notFound } from 'next/navigation';
import { surveys as allSurveys } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Survey, AsbestosSample, PaintSample } from '@/lib/types';
import Image from 'next/image';
import { MapPin, Calendar, User, FileText, CheckSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SurveyChecklist } from '../survey-checklist';
import { AsbestosTable } from '../asbestos-table';
import { PaintTable } from '../paint-table';

export default function SurveyDetailsPage({ params }: { params: { id: string } }) {
  const survey = allSurveys.find(s => s.id === params.id);
  const [asbestosSamples, setAsbestosSamples] = useState<AsbestosSample[]>(survey?.asbestosSamples || []);
  const [paintSamples, setPaintSamples] = useState<PaintSample[]>(survey?.paintSamples || []);

  if (!survey) {
    notFound();
  }

  const getStatusVariant = (status: Survey['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'Completed': return 'default';
          case 'In Progress': return 'secondary';
          case 'On Hold': return 'destructive';
          default: return 'outline';
      }
  }
  
  const handleAsbestosSave = (samples: AsbestosSample[]) => {
      setAsbestosSamples(samples);
  }

  const handlePaintSave = (samples: PaintSample[]) => {
      setPaintSamples(samples);
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
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="homogeneous-areas">Homogeneous Areas</TabsTrigger>
                            <TabsTrigger value="functional-areas">Functional Areas</TabsTrigger>
                            <TabsTrigger value="paint-samples">Paint Samples</TabsTrigger>
                            <TabsTrigger value="checklist">Checklist</TabsTrigger>
                        </TabsList>
                        <TabsContent value="homogeneous-areas" className="mt-4">
                            <AsbestosTable samples={asbestosSamples} onSave={handleAsbestosSave} />
                        </TabsContent>
                        <TabsContent value="functional-areas" className="mt-4">
                            <div className="text-center py-10 text-muted-foreground">
                                <p>Functional Areas feature coming soon.</p>
                            </div>
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
                 {survey.sitePhotoUrl && (
                  <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                    <Image
                        src={survey.sitePhotoUrl}
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
