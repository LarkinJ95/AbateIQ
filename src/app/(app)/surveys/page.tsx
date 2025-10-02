
'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SurveysPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Surveys" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-bold tracking-tight">
            Manage Surveys
          </h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Survey
          </Button>
        </div>
        <div>
          {/* Survey content will go here */}
          <p className="text-muted-foreground">Survey management features will be implemented here.</p>
        </div>
      </main>
    </div>
  );
}
