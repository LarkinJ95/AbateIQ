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
import { MoreHorizontal } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

interface PersonnelListProps {
  personnel: Personnel[];
}

export function PersonnelList({ personnel }: PersonnelListProps) {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Fit Test Status</TableHead>
          <TableHead>Fit Test Due Date</TableHead>
          <TableHead>Medical Clearance Status</TableHead>
          <TableHead>Medical Clearance Due</TableHead>
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
              <TableCell className="font-medium">{person.name}</TableCell>
              <TableCell>
                <Badge variant={fitTestStatus.variant}>
                  {fitTestStatus.text}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(person.fitTestDueDate), 'MM/dd/yyyy')}</TableCell>
              <TableCell>
                <Badge variant={medicalClearanceStatus.variant}>
                  {medicalClearanceStatus.text}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(person.medicalClearanceDueDate), 'MM/dd/yyyy')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>View History</DropdownMenuItem>
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
