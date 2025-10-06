
'use client';

import { Personnel } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Pencil, Eye, UserCheck } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import { AddPersonnelDialog } from './add-personnel-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

interface PersonnelListProps {
  personnel: Personnel[];
}

export function PersonnelList({ personnel }: PersonnelListProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const getStatus = (dateString: string) => {
    const date = new Date(dateString);
    if (isPast(date)) {
      return { text: 'Expired', variant: 'destructive' as const };
    }
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 30) {
      return { text: `Due in ${daysUntil} days`, variant: 'secondary' as const };
    }
    return { text: 'Current', variant: 'default' as const };
  };

  const handleDelete = async (person: Personnel) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'personnel', person.id));
        toast({
            title: 'Personnel Deleted',
            description: `${person.name} has been deleted.`,
            variant: 'destructive',
        });
    } catch (error) {
        toast({ title: 'Error Deleting Personnel', variant: 'destructive' });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Fit Test Status</TableHead>
          <TableHead>Medical Clearance Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personnel.map((person) => {
          const fitTestStatus = getStatus(person.fitTestDueDate);
          const medicalClearanceStatus = getStatus(
            person.medicalClearanceDueDate
          );
          return (
            <TableRow key={person.id}>
              <TableCell className="font-medium">
                <Link href={`/personnel/${person.id}`} className="hover:underline">{person.name}</Link>
              </TableCell>
              <TableCell>
                {person.isInspector && <Badge variant="outline"><UserCheck className="mr-1 h-3 w-3"/> Inspector</Badge>}
              </TableCell>
              <TableCell>{person.employeeId}</TableCell>
              <TableCell>
                <Badge variant={fitTestStatus.variant}>
                  {fitTestStatus.text}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={medicalClearanceStatus.variant}>
                  {medicalClearanceStatus.text}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/personnel/${person.id}`}>
                            <Eye className="mr-2 h-4 w-4"/>
                            View History
                        </Link>
                    </DropdownMenuItem>
                    <AddPersonnelDialog person={person}>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4"/>
                            Edit
                        </DropdownMenuItem>
                    </AddPersonnelDialog>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(person)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

    