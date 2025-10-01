import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PendingResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface PendingResultsProps {
  results: PendingResult[];
}

export function PendingResults({ results }: PendingResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pending Lab Results</CardTitle>
        <CardDescription>
          Samples currently being processed by the lab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.sampleId}</TableCell>
                <TableCell>{result.project}</TableCell>
                <TableCell>{result.date}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{result.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
