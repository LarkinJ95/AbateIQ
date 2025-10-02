
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AsbestosSample, HomogeneousArea, FunctionalArea } from '@/lib/types';
import { PlusCircle, Trash2, Edit, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';

interface AsbestosTableProps {
  samples: AsbestosSample[];
  homogeneousAreas: HomogeneousArea[];
  functionalAreas: FunctionalArea[];
  onSave: (samples: AsbestosSample[]) => void;
  onHaCreated: (areas: HomogeneousArea[]) => void;
}

const asbestosTypes: AsbestosSample['asbestosType'][] = ['ND', 'Chrysotile', 'Amosite', 'Crocidolite', 'Trace'];

export function AsbestosTable({ samples: initialSamples, homogeneousAreas, functionalAreas, onSave, onHaCreated }: AsbestosTableProps) {
  const [samples, setSamples] = useState<AsbestosSample[]>(initialSamples);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedRowData, setEditedRowData] = useState<Partial<AsbestosSample>>({});

  const [newRow, setNewRow] = useState<Partial<AsbestosSample>>({
      sampleNumber: '',
      location: '',
      homogeneousAreaId: '',
      material: '',
      estimatedQuantity: '',
      friable: false,
      asbestosType: 'ND',
      asbestosPercentage: null,
  });
  const { toast } = useToast();

    const haOptions = useMemo<ComboboxOption[]>(() => 
        homogeneousAreas.map(ha => ({ value: ha.id, label: `${ha.haId} - ${ha.description}` })),
    [homogeneousAreas]);

  const [haComboBoxOptions, setHaComboBoxOptions] = useState<ComboboxOption[]>(haOptions);
  
  useEffect(() => {
    setHaComboBoxOptions(homogeneousAreas.map(ha => ({ value: ha.id, label: `${ha.haId} - ${ha.description}` })))
  }, [homogeneousAreas])

  useEffect(() => {
    setSamples(initialSamples);
  }, [initialSamples]);

  const handleAddRow = () => {
    if (newRow.sampleNumber && newRow.location && newRow.material && newRow.homogeneousAreaId) {
        const newSample: AsbestosSample = {
            id: `asb-${Date.now()}`,
            sampleNumber: newRow.sampleNumber,
            location: newRow.location,
            homogeneousAreaId: newRow.homogeneousAreaId,
            material: newRow.material,
            estimatedQuantity: newRow.estimatedQuantity || '',
            friable: newRow.friable ?? false,
            asbestosType: newRow.asbestosType ?? 'ND',
            asbestosPercentage: newRow.asbestosPercentage ?? null,
        };
        const updatedSamples = [...samples, newSample];
        setSamples(updatedSamples);
        onSave(updatedSamples);
        setNewRow({
            sampleNumber: '',
            location: '',
            homogeneousAreaId: '',
            material: '',
            estimatedQuantity: '',
            friable: false,
            asbestosType: 'ND',
            asbestosPercentage: null,
        });
        toast({ title: 'Sample Added', description: 'Asbestos sample has been logged.' });
    } else {
        toast({ title: 'Missing Data', description: 'Please fill out Sample #, HA, Location, and Material.', variant: 'destructive'});
    }
  };
  
  const handleDeleteRow = (id: string) => {
    const updatedSamples = samples.filter(s => s.id !== id);
    setSamples(updatedSamples);
    onSave(updatedSamples);
    toast({ title: 'Sample Removed', variant: 'destructive'});
  }

  const handleEditRow = (sample: AsbestosSample) => {
    setEditingRowId(sample.id);
    setEditedRowData(sample);
  }

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedRowData({});
  }

  const handleSaveRow = (id: string) => {
    if (!editedRowData.sampleNumber || !editedRowData.location || !editedRowData.material || !editedRowData.homogeneousAreaId) {
        toast({ title: 'Missing Data', description: 'Please fill out Sample #, HA, Location, and Material.', variant: 'destructive'});
        return;
    }
    const updatedSamples = samples.map(s => s.id === id ? { ...s, ...editedRowData } : s);
    setSamples(updatedSamples);
    onSave(updatedSamples as AsbestosSample[]);
    setEditingRowId(null);
    setEditedRowData({});
    toast({ title: 'Sample Updated' });
  }

  const handleRowDataChange = (field: keyof AsbestosSample, value: any) => {
    setEditedRowData(prev => ({ ...prev, [field]: value }));
  }

  const renderResult = (sample: AsbestosSample) => {
      if (sample.asbestosType === 'ND' || sample.asbestosType === 'Trace') {
          return sample.asbestosType;
      }
      if (sample.asbestosPercentage !== null) {
          return `${sample.asbestosPercentage}% ${sample.asbestosType}`;
      }
      return sample.asbestosType;
  }

  const handleHaCreation = (newHaLabel: string) => {
    const newHa: HomogeneousArea = {
        id: `ha-${Date.now()}`,
        haId: newHaLabel,
        description: 'New HA (edit in HA tab)',
    };
    onHaCreated([...homogeneousAreas, newHa]);
    setNewRow(prev => ({...prev, homogeneousAreaId: newHa.id }));
    toast({ title: 'New HA Created', description: `"${newHaLabel}" was added to the Homogeneous Areas list.`})
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sample #</TableHead>
            <TableHead>HA</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Est. Qty</TableHead>
            <TableHead>Friable</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.id}>
              {editingRowId === sample.id ? (
                <>
                  <TableCell>
                    <Input value={editedRowData.sampleNumber || ''} onChange={(e) => handleRowDataChange('sampleNumber', e.target.value)} className="w-24" />
                  </TableCell>
                  <TableCell>
                    <Combobox
                        options={haComboBoxOptions}
                        setOptions={setHaComboBoxOptions}
                        value={editedRowData.homogeneousAreaId || ''}
                        onValueChange={(value) => handleRowDataChange('homogeneousAreaId', value)}
                        placeholder="Select HA" searchPlaceholder="Search..." emptyPlaceholder="No HA."/>
                  </TableCell>
                  <TableCell>
                    <Input value={editedRowData.location || ''} onChange={(e) => handleRowDataChange('location', e.target.value)} />
                  </TableCell>
                   <TableCell>
                    <Input value={editedRowData.material || ''} onChange={(e) => handleRowDataChange('material', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input value={editedRowData.estimatedQuantity || ''} onChange={(e) => handleRowDataChange('estimatedQuantity', e.target.value)} className="w-28" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={editedRowData.friable} onCheckedChange={(checked) => handleRowDataChange('friable', !!checked)} />
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                     <Select onValueChange={(value) => handleRowDataChange('asbestosType', value as AsbestosSample['asbestosType'])} value={editedRowData.asbestosType}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {asbestosTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                            type="number"
                            placeholder="%"
                            value={editedRowData.asbestosPercentage === null ? '' : editedRowData.asbestosPercentage}
                            onChange={(e) => handleRowDataChange('asbestosPercentage', e.target.value === '' ? null : parseFloat(e.target.value) )}
                            className="w-20"
                            disabled={editedRowData.asbestosType === 'ND' || editedRowData.asbestosType === 'Trace'}
                        />
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{sample.sampleNumber}</TableCell>
                  <TableCell>{haComboBoxOptions.find(opt => opt.value === sample.homogeneousAreaId)?.label || ''}</TableCell>
                  <TableCell>{sample.location}</TableCell>
                  <TableCell>{sample.material}</TableCell>
                  <TableCell>{sample.estimatedQuantity}</TableCell>
                  <TableCell>{sample.friable ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{renderResult(sample)}</TableCell>
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
                placeholder="e.g., 001A"
                value={newRow.sampleNumber || ''}
                onChange={(e) => setNewRow({ ...newRow, sampleNumber: e.target.value })}
                className="w-24"
              />
            </TableCell>
            <TableCell>
                <Combobox
                    options={haComboBoxOptions}
                    setOptions={setHaComboBoxOptions}
                    value={newRow.homogeneousAreaId || ''}
                    onValueChange={(value) => setNewRow({...newRow, homogeneousAreaId: value})}
                    onNewCreated={handleHaCreation}
                    placeholder="Select HA"
                    searchPlaceholder="Search HAs..."
                    emptyPlaceholder="No HA found. Create one."
                />
            </TableCell>
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
            <TableCell>
                <Input 
                    placeholder="e.g., 200 sqft"
                    value={newRow.estimatedQuantity || ''}
                    onChange={(e) => setNewRow({ ...newRow, estimatedQuantity: e.target.value })}
                    className="w-28"
                />
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={newRow.friable}
                onCheckedChange={(checked) => setNewRow({ ...newRow, friable: !!checked })}
              />
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <Select onValueChange={(value) => setNewRow({ ...newRow, asbestosType: value as AsbestosSample['asbestosType'] })} value={newRow.asbestosType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    {asbestosTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
               <Input
                    type="number"
                    placeholder="%"
                    value={newRow.asbestosPercentage === null ? '' : newRow.asbestosPercentage}
                    onChange={(e) => setNewRow({ ...newRow, asbestosPercentage: e.target.value === '' ? null : parseFloat(e.target.value) })}
                    className="w-20"
                    disabled={newRow.asbestosType === 'ND' || newRow.asbestosType === 'Trace'}
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
