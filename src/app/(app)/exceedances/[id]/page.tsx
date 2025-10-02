import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { exceedances } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ExceedanceDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const exceedance = exceedances.find(e => e.id === id);
  const evidenceImage = PlaceHolderImages.find(img => img.id === 'doc-thumb-2');

  if (!exceedance) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Exceedance: ${exceedance.analyte}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-destructive">Exceedance Details</CardTitle>
            <CardDescription>
              Details for exceedance ID: {exceedance.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analyte</p>
                <p className="text-lg font-semibold">{exceedance.analyte}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concentration</p>
                <p className="text-lg font-semibold text-destructive">{exceedance.concentration}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limit</p>
                <p className="text-lg font-semibold">{exceedance.limit}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Personnel</p>
                <p className="text-lg font-semibold">{exceedance.personnel}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{exceedance.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Corrective Action</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{exceedance.correctiveAction}</p>
            </CardContent>
        </Card>

        {exceedance.evidence && evidenceImage && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                    <Image 
                        src={evidenceImage.imageUrl} 
                        alt="Evidence photo"
                        width={600}
                        height={400}
                        className="rounded-md"
                        data-ai-hint={evidenceImage.imageHint}
                    />
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
