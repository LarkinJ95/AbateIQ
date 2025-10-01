
'use client';

import { Header } from '@/components/header';
import { NeaGenerator } from '@/components/nea-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { existingNeas as initialNeas } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ExistingNea } from '@/lib/types';

export default function NeaPage() {
    const router = useRouter();
    const [existingNeas, setExistingNeas] = useState<ExistingNea[]>(initialNeas);

    const getStatusVariant = (status: "Active" | "Expired") => {
        return status === "Active" ? "default" : "outline";
    };

    const handleRowClick = (neaId: string) => {
        router.push(`/nea/${neaId}`);
    }

    const handleNeaSaved = (newNea: ExistingNea) => {
        setExistingNeas(prevNeas => [newNea, ...prevNeas]);
    }


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Negative Exposure Assessments" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <NeaGenerator onNeaSaved={handleNeaSaved}/>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline">Existing Assessments</CardTitle>
                <CardDescription>A log of all previously created NEAs.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Analyte</TableHead>
                            <TableHead>Effective Date</TableHead>
                            <TableHead>Next Review</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {existingNeas.map((nea) => (
                            <TableRow key={nea.id} onClick={() => handleRowClick(nea.id)} className="cursor-pointer">
                                <TableCell className="font-medium">{nea.project}</TableCell>
                                <TableCell>{nea.task}</TableCell>
                                <TableCell>{nea.analyte}</TableCell>
                                <TableCell>{nea.effectiveDate}</TableCell>
                                <TableCell>{nea.reviewDate}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(nea.status)}>{nea.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
