
'use client';

import { Header } from '@/components/header';
import { personnel as initialPersonnel } from '@/lib/data';
import { PersonnelList } from '@/app/(app)/personnel/personnel-list';
import { Card, CardContent } from '@/components/ui/card';
import { AddPersonnelDialog } from './add-personnel-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import type { Personnel } from '@/lib/types';

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);

  const handleSavePersonnel = (personData: Omit<Personnel, 'id'> & { id?: string }) => {
    if (personData.id) {
      // Edit existing personnel
      setPersonnel(prev => prev.map(p => p.id === personData.id ? { ...p, ...personData } as Personnel : p));
    } else {
      // Add new personnel
      const newPersonnel: Personnel = {
        ...personData,
        id: `per-${Date.now()}`
      };
      setPersonnel(prev => [newPersonnel, ...prev]);
    }
  };

  const handleDeletePersonnel = (personnelId: string) => {
    setPersonnel(prev => prev.filter(p => p.id !== personnelId));
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Personnel" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold tracking-tight">
                Manage Personnel
            </h2>
            <AddPersonnelDialog person={null} onSave={handleSavePersonnel}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Personnel
                </Button>
            </AddPersonnelDialog>
        </div>
        <Card>
            <CardContent className="p-0">
                <PersonnelList 
                    personnel={personnel} 
                    onSave={handleSavePersonnel} 
                    onDelete={handleDeletePersonnel}
                />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
