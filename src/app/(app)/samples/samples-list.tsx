'use client';

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
import { Sample } from '@/lib/types';

interface SamplesListProps {
  samples: (Sample & {
      projectName?: string;
      taskName?: string;
      personnelName?: string;
      status: string;
      analyte?: string;
      concentration?: number;
      units?: string;
  })[];
}

export function SamplesList({ samples }: SamplesListProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case '>PEL':
      case '>EL':
        return 'destructive';
      case '≥AL':
        return 'secondary';
      case 'OK':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sample ID</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Personnel</TableHead>
          <TableHead>Analyte</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {samples.map((sample) => (
            <TableRow key={sample.id}>
              <TableCell className="font-medium">{sample.id}</TableCell>
              <TableCell>{sample.projectName}</TableCell>
              <TableCell>{sample.taskName}</TableCell>
              <TableCell>{sample.personnelName}</TableCell>
              <TableCell>{sample.analyte || 'N/A'}</TableCell>
              <TableCell>
                {sample.concentration !== undefined
                  ? `${sample.concentration} ${sample.units}`
                  : 'Pending'}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(sample.status)}>
                  {sample.status}
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Link to NEA</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
