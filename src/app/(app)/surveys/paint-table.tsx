
'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaintSample } from '@/lib/types';
import { PlusCircle, Trash2, Edit, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaintTableProps {
  samples: PaintSample[];
  onSave: (samples: PaintSample[]) => void;
}

export function PaintTable({ samples: initialSamples, onSave }: PaintTableProps) {
  const [samples, setSamples] = useState<PaintSample[]>(initialSamples);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedRowData, setEditedRowData] = useState<Partial<PaintSample>>({});
  const [newRow, setNewRow] = useState<Partial<PaintSample>>({
    location: '',
    paintColor: '',
    analyte: '',
    resultMgKg: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    setSamples(initialSamples);
  }, [initialSamples]);

  const handleAddRow = () => {
    if (newRow.location && newRow.paintColor && newRow.analyte) {
        const newSample: PaintSample = {
            id: `paint-${Date.now()}`,
            location: newRow.location,
            paintColor: newRow.paintColor,
            analyte: newRow.analyte,
            resultMgKg: newRow.resultMgKg ?? null,
        };
        const updatedSamples = [...samples, newSample];
        setSamples(updatedSamples);
        onSave(updatedSamples);
        setNewRow({ location: '', paintColor: '', analyte: '', resultMgKg: null });
        toast({ title: 'Sample Added', description: 'Paint sample has been logged.' });
    } else {
        toast({ title: 'Missing Data', description: 'Please fill out Location, Paint Color, and Analyte.', variant: 'destructive'});
    }
  };
  
  const handleDeleteRow = (id: string) => {
    const updatedSamples = samples.filter(s => s.id !== id);
    setSamples(updatedSamples);
    onSave(updatedSamples);
    toast({ title: 'Sample Removed', variant: 'destructive'});
  }

  const handleEditRow = (sample: PaintSample) => {
    setEditingRowId(sample.id);
    setEditedRowData(sample);
  }

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedRowData({});
  }

  const handleSaveRow = (id: string) => {
    if (!editedRowData.location || !editedRowData.paintColor || !editedRowData.analyte) {
        toast({ title: 'Missing Data', description: 'Please fill out Location, Paint Color, and Analyte.', variant: 'destructive'});
        return;
    }
    const updatedSamples = samples.map(s => s.id === id ? { ...s, ...editedRowData } : s);
    setSamples(updatedSamples as PaintSample[]);
    onSave(updatedSamples as PaintSample[]);
    setEditingRowId(null);
    setEditedRowData({});
    toast({ title: 'Paint Sample Updated' });
  }

  const handleRowDataChange = (field: keyof PaintSample, value: any) => {
    setEditedRowData(prev => ({ ...prev, [field]: value }));
  }


  const calculatePercentByWeight = (result: number | null) => {
      if (result === null || isNaN(result)) return '-';
      return (result / 10000).toFixed(4);
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Paint Color</TableHead>
            <TableHead>Analyte</TableHead>
            <TableHead>Result (mg/kg)</TableHead>
            <TableHead>% by Weight</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.id}>
              {editingRowId === sample.id ? (
                <>
                  <TableCell><Input value={editedRowData.location} onChange={e => handleRowDataChange('location', e.target.value)} /></TableCell>
                  <TableCell><Input value={editedRowData.paintColor} onChange={e => handleRowDataChange('paintColor', e.target.value)} className="w-28"/></TableCell>
                  <TableCell>
                     <Select onValueChange={(value) => handleRowDataChange('analyte', value as PaintSample['analyte'])} value={editedRowData.analyte}>
                        <SelectTrigger className="w-32"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Cadmium">Cadmium</SelectItem>
                        </SelectContent>
                      </Select>
                  </TableCell>
                  <TableCell><Input type="number" value={String(editedRowData.resultMgKg ?? '')} onChange={e => handleRowDataChange('resultMgKg', e.target.value === '' ? null : parseFloat(e.target.value))} className="w-32" /></TableCell>
                  <TableCell>{calculatePercentByWeight(editedRowData.resultMgKg ?? null)}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{sample.location}</TableCell>
                  <TableCell>{sample.paintColor}</TableCell>
                  <TableCell>{sample.analyte}</TableCell>
                  <TableCell>{sample.resultMgKg ?? 'N/A'}</TableCell>
                  <TableCell>{calculatePercentByWeight(sample.resultMgKg)}</TableCell>
                </>
              )}
               <TableCell className="text-right">
                {editingRowId === sample.id ? (
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleSaveRow(sample.id)}>
                      <Save className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleEditRow(sample)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(sample.id)}>
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
                 className="w-28"
              />
            </TableCell>
            <TableCell>
              <Select onValueChange={(value) => setNewRow({ ...newRow, analyte: value as PaintSample['analyte'] })} value={newRow.analyte}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Cadmium">Cadmium</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
                <Input 
                    type="number"
                    placeholder="e.g., 5000"
                    value={newRow.resultMgKg === null ? '' : String(newRow.resultMgKg)}
                    onChange={(e) => setNewRow({ ...newRow, resultMgKg: e.target.value === '' ? null : parseFloat(e.target.value) })}
                    className="w-32"
                />
            </TableCell>
             <TableCell>
                <Input 
                    value={calculatePercentByWeight(newRow.resultMgKg ?? null)}
                    readOnly
                    disabled
                    className="w-28 bg-muted"
                />
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
