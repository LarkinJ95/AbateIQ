
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AsbestosSample } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AsbestosTableProps {
  samples: AsbestosSample[];
  onSave: (samples: AsbestosSample[]) => void;
}

export function AsbestosTable({ samples: initialSamples, onSave }: AsbestosTableProps) {
  const [samples, setSamples] = useState<AsbestosSample[]>(initialSamples);
  const [newRow, setNewRow] = useState<Partial<AsbestosSample>>({});
  const { toast } = useToast();

  const handleAddRow = () => {
    if (newRow.location && newRow.material) {
        const newSample: AsbestosSample = {
            id: `asb-${Date.now()}`,
            location: newRow.location,
            material: newRow.material,
            friable: newRow.friable ?? false,
            result: newRow.result ?? 'ND',
        };
        const updatedSamples = [...samples, newSample];
        setSamples(updatedSamples);
        onSave(updatedSamples);
        setNewRow({});
        toast({ title: 'Sample Added', description: 'Asbestos sample has been logged.' });
    } else {
        toast({ title: 'Missing Data', description: 'Please fill out Location and Material.', variant: 'destructive'});
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
            <TableHead>Material</TableHead>
            <TableHead>Friable</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.id}>
              <TableCell>{sample.location}</TableCell>
              <TableCell>{sample.material}</TableCell>
              <TableCell>{sample.friable ? 'Yes' : 'No'}</TableCell>
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
                placeholder="e.g., Kitchen floor"
                value={newRow.location || ''}
                onChange={(e) => setNewRow({ ...newRow, location: e.target.value })}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="e.g., 12x12 Vinyl Tile"
                value={newRow.material || ''}
                onChange={(e) => setNewRow({ ...newRow, material: e.target.value })}
              />
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={newRow.friable}
                onCheckedChange={(checked) => setNewRow({ ...newRow, friable: !!checked })}
              />
            </TableCell>
            <TableCell>
              <Select onValueChange={(value) => setNewRow({ ...newRow, result: value as AsbestosSample['result'] })} value={newRow.result}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ND">ND</SelectItem>
                  <SelectItem value="Trace">Trace</SelectItem>
                  <SelectItem value=">1%">>1%</SelectItem>
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
