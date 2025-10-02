
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaintSample } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaintTableProps {
  samples: PaintSample[];
  onSave: (samples: PaintSample[]) => void;
}

export function PaintTable({ samples: initialSamples, onSave }: PaintTableProps) {
  const [samples, setSamples] = useState<PaintSample[]>(initialSamples);
  const [newRow, setNewRow] = useState<Partial<PaintSample>>({});
  const { toast } = useToast();

  const handleAddRow = () => {
    if (newRow.location && newRow.paintColor) {
        const newSample: PaintSample = {
            id: `paint-${Date.now()}`,
            location: newRow.location,
            paintColor: newRow.paintColor,
            result: newRow.result ?? 'ND',
        };
        const updatedSamples = [...samples, newSample];
        setSamples(updatedSamples);
        onSave(updatedSamples);
        setNewRow({});
        toast({ title: 'Sample Added', description: 'Paint sample has been logged.' });
    } else {
        toast({ title: 'Missing Data', description: 'Please fill out Location and Paint Color.', variant: 'destructive'});
    }
  };
  
  const handleDeleteRow = (id: string) => {
    const updatedSamples = samples.filter(s => s.id !== id);
    setSamples(updatedSamples);
    onSave(updatedSamples);
    toast({ title: 'Sample Removed', variant: 'destructive'});
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Paint Color</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.id}>
              <TableCell>{sample.location}</TableCell>
              <TableCell>{sample.paintColor}</TableCell>
              <TableCell>{sample.result}</TableCell>
              <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(sample.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
              </TableCell>
            </TableRow>
          ))}
          {/* New Row for adding data */}
          <TableRow>
            <TableCell>
              <Input
                placeholder="e.g., North exterior wall"
                value={newRow.location || ''}
                onChange={(e) => setNewRow({ ...newRow, location: e.target.value })}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="e.g., Red"
                value={newRow.paintColor || ''}
                onChange={(e) => setNewRow({ ...newRow, paintColor: e.target.value })}
              />
            </TableCell>
            <TableCell>
              <Select onValueChange={(value) => setNewRow({ ...newRow, result: value as PaintSample['result'] })} value={newRow.result}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ND">ND</SelectItem>
                  <SelectItem value="Trace">Trace</SelectItem>
                  <SelectItem value="Positive">Positive</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Button size="sm" onClick={handleAddRow}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
