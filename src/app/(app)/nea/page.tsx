
'use client';

import { Header } from '@/components/header';
import { NeaGenerator } from '@/components/nea-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import type { ExistingNea } from '@/lib/types';
import { AddNeaDialog } from './add-nea-dialog';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, addDoc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// TODO: Replace with actual orgId from user's custom claims
const ORG_ID = "org_placeholder_123";

export default function NeaPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const neasQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'orgs', ORG_ID, 'neas'));
    }, [firestore, user]);
    const { data: existingNeas, isLoading } = useCollection<ExistingNea>(neasQuery);

    const getStatus = (effectiveDate: string) => {
        const effDate = new Date(effectiveDate);
        const reviewDate = new Date(effDate.setFullYear(effDate.getFullYear() + 1));
        const isExpired = new Date() > reviewDate;
        return isExpired ? 'Expired' : 'Active';
    };

    const getReviewDate = (effectiveDate: string) => {
        const effDate = new Date(effectiveDate);
        const reviewDate = new Date(effDate.setFullYear(effDate.getFullYear() + 1));
        return reviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    const getStatusVariant = (status: "Active" | "Expired") => {
        return status === "Active" ? "default" : "outline";
    };

    const handleRowClick = (neaId: string) => {
        router.push(`/nea/${neaId}`);
    }

    const handleNeaSaved = async (newNea: Omit<ExistingNea, 'id'>) => {
        if (!firestore) return;
        try {
            await addDoc(collection(firestore, 'orgs', ORG_ID, 'neas'), newNea);
        } catch (error) {
            toast({
                title: 'Error Saving NEA',
                description: 'An error occurred while saving the NEA.',
                variant: 'destructive',
            });
        }
    }


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Negative Exposure Assessments" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <NeaGenerator onNeaSaved={handleNeaSaved}/>
          <Card>
             <CardHeader>
                <CardTitle className="font-headline">Manual NEA Entry</CardTitle>
                <CardDescription>
                    Manually add an existing Negative Exposure Assessment to the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AddNeaDialog onNeaAdded={handleNeaSaved} />
            </CardContent>
          </Card>
        </div>

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
                            <TableHead>Expiration Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">Loading assessments...</TableCell>
                            </TableRow>
                        )}
                        {!isLoading && existingNeas && existingNeas.map((nea) => {
                            const status = getStatus(nea.effectiveDate);
                            return (
                                <TableRow key={nea.id} onClick={() => handleRowClick(nea.id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{nea.project}</TableCell>
                                    <TableCell>{nea.task}</TableCell>
                                    <TableCell>{nea.analyte}</TableCell>
                                    <TableCell>{new Date(nea.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                    <TableCell>{getReviewDate(nea.effectiveDate)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(status)}>{status}</Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                         {!isLoading && (!existingNeas || existingNeas.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No assessments found.</TableCell>
                            </TableRow>
                         )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
