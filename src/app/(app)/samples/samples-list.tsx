
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
import { MoreHorizontal, Trash2, Pencil, Eye, Link as LinkIcon } from 'lucide-react';
import { Sample } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AddSampleDialog } from './add-sample-dialog';


type SampleWithDetails = Sample & {
      projectName?: string;
      taskName?: string;
      personnelName?: string;
      status: string;
      analyte?: string;
      concentration?: number;
      units?: string;
  };

interface SamplesListProps {
  samples: SampleWithDetails[];
  onSave: (sampleData: Omit<Sample, 'id' | 'duration' | 'volume'> & { id?: string }) => void;
  onDelete: (sampleId: string) => void;
}

export function SamplesList({ samples, onSave, onDelete }: SamplesListProps) {
  const { toast } = useToast();

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
  
  const handleDelete = (sample: SampleWithDetails) => {
    onDelete(sample.id);
    toast({
        title: 'Sample Deleted',
        description: `Sample ${sample.id} has been deleted.`,
        variant: 'destructive'
    });
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
              <TableCell className="font-medium">
                <Link href={`/samples/${sample.id}`} className="hover:underline">{sample.id}</Link>
              </TableCell>
              <TableCell>{sample.projectName}</TableCell>
              <TableCell>{sample.taskName}</TableCell>
              <TableCell>{sample.personnelName}</TableCell>
              <TableCell>{sample.analyte || 'N/A'}</TableCell>
              <TableCell>
                {sample.concentration !== undefined && sample.concentration >= 0 && sample.result?.status !== 'Pending'
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
                    <DropdownMenuItem asChild>
                      <Link href={`/samples/${sample.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                     <AddSampleDialog onSave={onSave} sample={sample}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4"/>
                            Edit
                        </DropdownMenuItem>
                    </AddSampleDialog>
                    <DropdownMenuItem>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Link to NEA
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sample)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
