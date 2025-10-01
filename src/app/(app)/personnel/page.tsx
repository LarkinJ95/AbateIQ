import { Header } from '@/components/header';
import { personnel } from '@/lib/data';
import { PersonnelList } from '@/app/(app)/personnel/personnel-list';
import { Card, CardContent } from '@/components/ui/card';
import { AddPersonnelDialog } from './add-personnel-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function PersonnelPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Personnel" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold tracking-tight">
                Manage Personnel
            </h2>
            <AddPersonnelDialog person={null}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Personnel
                </Button>
            </AddPersonnelDialog>
        </div>
        <Card>
            <CardContent className="p-0">
                <PersonnelList personnel={personnel} />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}