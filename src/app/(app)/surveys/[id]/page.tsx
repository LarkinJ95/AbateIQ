
'use client';

import { Header } from '@/components/header';
import { notFound } from 'next/navigation';
import { surveys as allSurveys } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Survey } from '@/lib/types';
import Image from 'next/image';
import { MapPin, Calendar, User, FileText } from 'lucide-react';


export default function SurveyDetailsPage({ params }: { params: { id: string } }) {
  const survey = allSurveys.find(s => s.id === params.id);

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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Survey: ${survey.siteName}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Future home of the checklist */}
            <Card>
                <CardHeader>
                    <CardTitle>Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The survey checklist will be displayed here.</p>
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

