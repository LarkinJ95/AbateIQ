
'use client';

import { Header } from '@/components/header';
import { PersonnelList } from '@/app/(app)/personnel/personnel-list';
import { Card, CardContent } from '@/components/ui/card';
import { AddPersonnelDialog } from './add-personnel-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useMemo } from 'react';
import type { Personnel } from '@/lib/types';
import { ImportPersonnelDialog } from './import-personnel-dialog';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function PersonnelPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const orgId = user?.orgId;

  const personnelQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(firestore, 'orgs', orgId, 'people'));
  }, [firestore, orgId]);
  const { data: personnel, isLoading } = useCollection<Personnel>(personnelQuery);

  const sortedPersonnel = useMemo(() => {
    if (!personnel) return [];
    return [...personnel].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [personnel]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Personnel" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold tracking-tight">
                Manage Personnel
            </h2>
            <div className="flex gap-2">
                <ImportPersonnelDialog />
                <AddPersonnelDialog person={null}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Personnel
                    </Button>
                </AddPersonnelDialog>
            </div>
        </div>
        <Card>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="h-48 flex items-center justify-center">Loading...</div>
                ) : (
                    <PersonnelList 
                        personnel={sortedPersonnel} 
                    />
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
