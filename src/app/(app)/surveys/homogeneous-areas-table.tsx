

'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { HomogeneousArea, FunctionalArea, AsbestosSample } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';

interface HomogeneousAreasTableProps {
  areas: HomogeneousArea[];
  functionalAreas: FunctionalArea[];
  asbestosSamples: AsbestosSample[];
  onSave: (areas: HomogeneousArea[]) => void;
}

export function HomogeneousAreasTable({ areas: initialAreas, functionalAreas, asbestosSamples, onSave }: HomogeneousAreasTableProps) {
  const [areas, setAreas] = useState<HomogeneousArea[]>(initialAreas);
  const [newRow, setNewRow] = useState<Partial<HomogeneousArea>>({ haId: '', description: '', functionalAreaIds: [] });
  const { toast } = useToast();

  const faOptions: MultiSelectOption[] = functionalAreas.map(fa => ({
      value: fa.id,
      label: `${fa.faId} - ${fa.faUse}`
  }));

  const handleAddRow = () => {
    if (newRow.haId && newRow.description) {
      const newArea: HomogeneousArea = {
        id: `ha-${Date.now()}`,
        haId: newRow.haId,
        description: newRow.description,
        functionalAreaIds: newRow.functionalAreaIds || [],
      };
      const updatedAreas = [...areas, newArea];
      setAreas(updatedAreas);
      onSave(updatedAreas);
      setNewRow({ haId: '', description: '', functionalAreaIds: [] });
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
  
  const handleFALinkChange = (haId: string, faIds: string[]) => {
      const updatedAreas = areas.map(area => 
          area.id === haId ? { ...area, functionalAreaIds: faIds } : area
      );
      setAreas(updatedAreas);
      onSave(updatedAreas);
  }

  const getLinkedSamplesCount = (haId: string) => {
      return asbestosSamples.filter(s => s.homogeneousAreaId === haId).length;
  }
  
  const getTotalEstQuantity = (haId: string) => {
      const linkedSamples = asbestosSamples.filter(s => s.homogeneousAreaId === haId);
      // This is a naive sum, assuming all quantities are compatible strings like "100 sqft".
      // A more robust implementation would parse units and numbers.
      let total = 0;
      let unit = '';
      for (const sample of linkedSamples) {
          const qty = sample.estimatedQuantity;
          if (qty) {
              const num = parseFloat(qty);
              if (!isNaN(num)) {
                  total += num;
                  if (!unit) {
                    unit = qty.replace(/[0-9.,\s]/g, ''); // Extract unit
                  }
              }
          }
      }
      return total > 0 ? `${total} ${unit}` : '-';
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">HA ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Linked FS</TableHead>
            <TableHead>Linked Samples</TableHead>
            <TableHead>Total Est. Qty</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.map((area) => (
            <TableRow key={area.id}>
              <TableCell className="font-medium">{area.haId}</TableCell>
              <TableCell>{area.description}</TableCell>
              <TableCell>
                  <MultiSelect
                    options={faOptions}
                    selected={area.functionalAreaIds || []}
                    onChange={(selected) => handleFALinkChange(area.id, selected)}
                    placeholder="Link FS..."
                    className="w-48"
                  />
              </TableCell>
              <TableCell>{getLinkedSamplesCount(area.id)}</TableCell>
              <TableCell>{getTotalEstQuantity(area.id)}</TableCell>
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
                <MultiSelect
                    options={faOptions}
                    selected={newRow.functionalAreaIds || []}
                    onChange={(selected) => setNewRow({ ...newRow, functionalAreaIds: selected })}
                    placeholder="Link FS..."
                    className="w-48"
                />
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
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
