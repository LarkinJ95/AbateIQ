
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FunctionalArea } from '@/lib/types';
import { PlusCircle, Trash2, Edit, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';

interface FunctionalAreasTableProps {
  areas: FunctionalArea[];
  onSave: (areas: FunctionalArea[]) => void;
}

const defaultFaUseOptions: ComboboxOption[] = [
    // Residential
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'living-room', label: 'Living Room' },
    { value: 'dining-room', label: 'Dining Room' },
    { value: 'basement', label: 'Basement' },
    { value: 'attic', label: 'Attic' },
    { value: 'garage', label: 'Garage' },
    // Commercial
    { value: 'office', label: 'Office' },
    { value: 'restroom', label: 'Restroom' },
    { value: 'corridor', label: 'Corridor' },
    { value: 'storage', label: 'Storage' },
    { value: 'classroom', label: 'Classroom' },
    { value: 'retail-space', label: 'Retail Space' },
    { value: 'conference-room', label: 'Conference Room' },
    // Industrial
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'process-area', label: 'Process Area' },
    { value: 'mechanical-room', label: 'Mechanical Room' },
    { value: 'laboratory', label: 'Laboratory' },
];

export function FunctionalAreasTable({ areas: initialAreas, onSave }: FunctionalAreasTableProps) {
  const [areas, setAreas] = useState<FunctionalArea[]>(initialAreas);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedRowData, setEditedRowData] = useState<Partial<FunctionalArea>>({});
  const [newRow, setNewRow] = useState<Partial<FunctionalArea>>({
    faId: '',
    faUse: '',
    length: null,
    width: null,
    height: null,
  });
  const { toast } = useToast();
  const [faUseOptions, setFaUseOptions] = useState<ComboboxOption[]>(defaultFaUseOptions);

  useEffect(() => {
    setAreas(initialAreas);
  }, [initialAreas]);

  const handleAddRow = () => {
    const selectedLabel = faUseOptions.find(opt => opt.value === newRow.faUse)?.label || newRow.faUse;
    if (newRow.faId && selectedLabel) {
      const newArea: FunctionalArea = {
        id: `fa-${Date.now()}`,
        faId: newRow.faId,
        faUse: selectedLabel,
        length: newRow.length ?? null,
        width: newRow.width ?? null,
        height: newRow.height ?? null,
      };
      const updatedAreas = [...areas, newArea];
      setAreas(updatedAreas);
      onSave(updatedAreas);
      setNewRow({ faId: '', faUse: '', length: null, width: null, height: null });
      toast({ title: 'Functional Area Added' });
    } else {
      toast({ title: 'Missing Data', description: 'Please fill out FA ID and FA Use.', variant: 'destructive' });
    }
  };

  const handleDeleteRow = (id: string) => {
    const updatedAreas = areas.filter(a => a.id !== id);
    setAreas(updatedAreas);
    onSave(updatedAreas);
    toast({ title: 'Functional Area Removed', variant: 'destructive' });
  };
  
  const handleEditRow = (area: FunctionalArea) => {
    setEditingRowId(area.id);
    const useValue = faUseOptions.find(opt => opt.label.toLowerCase() === area.faUse.toLowerCase())?.value || area.faUse.toLowerCase();
    setEditedRowData({ ...area, faUse: useValue });
  }

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedRowData({});
  }

  const handleSaveRow = (id: string) => {
    const selectedLabel = faUseOptions.find(opt => opt.value === editedRowData.faUse)?.label || editedRowData.faUse;
    if (!editedRowData.faId || !selectedLabel) {
        toast({ title: 'Missing Data', description: 'Please fill out FA ID and FA Use.', variant: 'destructive'});
        return;
    }

    const updatedAreas = areas.map(a => a.id === id ? { ...a, ...editedRowData, faUse: selectedLabel } : a);
    setAreas(updatedAreas as FunctionalArea[]);
    onSave(updatedAreas as FunctionalArea[]);
    setEditingRowId(null);
    setEditedRowData({});
    toast({ title: 'Functional Area Updated' });
  }

  const handleRowDataChange = (field: keyof FunctionalArea, value: any) => {
    setEditedRowData(prev => ({ ...prev, [field]: value }));
  }


  const calculateSqFt = (length: number | null, width: number | null) => {
    if (length && width) return (length * width).toFixed(2);
    return '-';
  };

  const calculateWallSqFt = (length: number | null, width: number | null, height: number | null) => {
    if (length && width && height) return ((length * height * 2) + (width * height * 2)).toFixed(2);
    return '-';
  };
  
  const newRowSqFt = useMemo(() => calculateSqFt(newRow.length, newRow.width), [newRow.length, newRow.width]);
  const newRowWallSqFt = useMemo(() => calculateWallSqFt(newRow.length, newRow.width, newRow.height), [newRow.length, newRow.width, newRow.height]);


  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>FA ID</TableHead>
            <TableHead>FA Use</TableHead>
            <TableHead>Length (ft)</TableHead>
            <TableHead>Width (ft)</TableHead>
            <TableHead>Height (ft)</TableHead>
            <TableHead>SqFt</TableHead>
            <TableHead>Wall SqFt</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.map((area) => (
            <TableRow key={area.id}>
              {editingRowId === area.id ? (
                <>
                  <TableCell>
                    <Input value={editedRowData.faId} onChange={e => handleRowDataChange('faId', e.target.value)} className="w-24"/>
                  </TableCell>
                  <TableCell>
                     <Combobox
                        options={faUseOptions}
                        setOptions={setFaUseOptions}
                        value={editedRowData.faUse || ''}
                        onValueChange={(value) => handleRowDataChange('faUse', value)}
                        placeholder="Select or create..."
                        searchPlaceholder="Search uses..."
                        emptyPlaceholder="No use found."
                    />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={String(editedRowData.length ?? '')} onChange={e => handleRowDataChange('length', e.target.value === '' ? null : parseFloat(e.target.value))} className="w-24" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={String(editedRowData.width ?? '')} onChange={e => handleRowDataChange('width', e.target.value === '' ? null : parseFloat(e.target.value))} className="w-24" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={String(editedRowData.height ?? '')} onChange={e => handleRowDataChange('height', e.target.value === '' ? null : parseFloat(e.target.value))} className="w-24" />
                  </TableCell>
                  <TableCell>{calculateSqFt(editedRowData.length ?? null, editedRowData.width ?? null)}</TableCell>
                  <TableCell>{calculateWallSqFt(editedRowData.length ?? null, editedRowData.width ?? null, editedRowData.height ?? null)}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{area.faId}</TableCell>
                  <TableCell>{area.faUse}</TableCell>
                  <TableCell>{area.length}</TableCell>
                  <TableCell>{area.width}</TableCell>
                  <TableCell>{area.height}</TableCell>
                  <TableCell>{calculateSqFt(area.length, area.width)}</TableCell>
                  <TableCell>{calculateWallSqFt(area.length, area.width, area.height)}</TableCell>
                </>
              )}
              <TableCell className="text-right">
                 {editingRowId === area.id ? (
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleSaveRow(area.id)}>
                      <Save className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleEditRow(area)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(area.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {/* New Row for adding data */}
          <TableRow>
            <TableCell>
              <Input
                placeholder="e.g., FA-01"
                value={newRow.faId || ''}
                onChange={(e) => setNewRow({ ...newRow, faId: e.target.value })}
                className="w-24"
              />
            </TableCell>
            <TableCell>
                <Combobox
                    options={faUseOptions}
                    setOptions={setFaUseOptions}
                    value={newRow.faUse || ''}
                    onValueChange={(value) => setNewRow({...newRow, faUse: value})}
                    placeholder="Select or create..."
                    searchPlaceholder="Search uses..."
                    emptyPlaceholder="No use found."
                />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                placeholder="e.g., 12.5"
                value={newRow.length === null ? '' : String(newRow.length)}
                onChange={(e) => setNewRow({ ...newRow, length: e.target.value === '' ? null : parseFloat(e.target.value) })}
                className="w-24"
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={newRow.width === null ? '' : String(newRow.width)}
                onChange={(e) => setNewRow({ ...newRow, width: e.target.value === '' ? null : parseFloat(e.target.value) })}
                className="w-24"
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                placeholder="e.g., 8"
                value={newRow.height === null ? '' : String(newRow.height)}
                onChange={(e) => setNewRow({ ...newRow, height: e.target.value === '' ? null : parseFloat(e.target.value) })}
                className="w-24"
              />
            </TableCell>
            <TableCell>
              <Input value={newRowSqFt} readOnly disabled className="w-24 bg-muted" />
            </TableCell>
            <TableCell>
              <Input value={newRowWallSqFt} readOnly disabled className="w-24 bg-muted" />
            </TableCell>
            <TableCell className="text-right">
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
