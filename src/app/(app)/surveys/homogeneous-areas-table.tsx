
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { HomogeneousArea } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HomogeneousAreasTableProps {
  areas: HomogeneousArea[];
  onSave: (areas: HomogeneousArea[]) => void;
}

export function HomogeneousAreasTable({ areas: initialAreas, onSave }: HomogeneousAreasTableProps) {
  const [areas, setAreas] = useState<HomogeneousArea[]>(initialAreas);
  const [newRow, setNewRow] = useState<Partial<HomogeneousArea>>({ haId: '', description: '' });
  const { toast } = useToast();

  const handleAddRow = () => {
    if (newRow.haId && newRow.description) {
      const newArea: HomogeneousArea = {
        id: `ha-${Date.now()}`,
        haId: newRow.haId,
        description: newRow.description,
      };
      const updatedAreas = [...areas, newArea];
      setAreas(updatedAreas);
      onSave(updatedAreas);
      setNewRow({ haId: '', description: '' });
      toast({ title: 'Homogeneous Area Added' });
    } else {
      toast({ title: 'Missing Data', description: 'Please fill out both HA ID and Description.', variant: 'destructive' });
    }
  };

  const handleDeleteRow = (id: string) => {
    const updatedAreas = areas.filter(a => a.id !== id);
    setAreas(updatedAreas);
    onSave(updatedAreas);
    toast({ title: 'Homogeneous Area Removed', variant: 'destructive' });
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">HA ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.map((area) => (
            <TableRow key={area.id}>
              <TableCell className="font-medium">{area.haId}</TableCell>
              <TableCell>{area.description}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(area.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {/* New Row for adding data */}
          <TableRow>
            <TableCell>
              <Input
                placeholder="e.g., HA-01"
                value={newRow.haId || ''}
                onChange={(e) => setNewRow({ ...newRow, haId: e.target.value })}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="e.g., 12x12 Black Mastic on Concrete"
                value={newRow.description || ''}
                onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
              />
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
