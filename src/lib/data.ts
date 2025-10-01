import { Client, Project, NeaReview, PersonnelExposure, PendingResult, Exceedance, Document, ExistingNea } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const clients: Client[] = [
  { id: '1', name: 'Apex Construction', logoUrl: findImage('client-logo-1')?.imageUrl ?? '', logoHint: findImage('client-logo-1')?.imageHint ?? '' },
  { id: '2', name: 'Innovate Builders', logoUrl: findImage('client-logo-2')?.imageUrl ?? '', logoHint: findImage('client-logo-2')?.imageHint ?? '' },
  { id: '3', name: 'Terra Firma', logoUrl: findImage('client-logo-3')?.imageUrl ?? '', logoHint: findImage('client-logo-3')?.imageHint ?? '' },
];

export const projects: Project[] = [
  { id: 'p1', name: 'Downtown Tower Renovation', location: '123 Main St, Metro City', status: 'Active', clientId: '1' },
  { id: 'p2', name: 'Suburban Office Park', location: '456 Oak Ave, Suburbia', status: 'Active', clientId: '1' },
  { id: 'p3', name: 'Coastal Bridge Repair', location: '789 Ocean Blvd, Seaside', status: 'On Hold', clientId: '2' },
  { id: 'p4', name: 'Genesis Labs HQ', location: '101 Innovation Dr, Tech Park', status: 'Completed', clientId: '2' },
  { id: 'p5', name: 'Historic Courthouse Restoration', location: '210 Justice Sq, Old Town', status: 'Active', clientId: '3' },
];

export const neaReviews: NeaReview[] = [
  { id: 'n1', projectName: 'Downtown Tower', task: 'Drywall Sanding', analyte: 'Silica', dueDate: '3 days' },
  { id: 'n2', projectName: 'Coastal Bridge', task: 'Weld-Coating Removal', analyte: 'Lead', dueDate: '1 week' },
  { id: 'n3', projectName: 'Office Park', task: 'Insulation Abatement', analyte: 'Asbestos', dueDate: '2 weeks' },
];

export const personnelExposureData: PersonnelExposure[] = [
    { name: 'J. Doe', asbestos: 80, silica: 65, 'heavy metals': 45 },
    { name: 'L. Smith', asbestos: 30, silica: 40, 'heavy metals': 20 },
    { name: 'M. Chen', asbestos: 50, silica: 90, 'heavy metals': 75 },
    { name: 'R. Patel', asbestos: 20, silica: 15, 'heavy metals': 10 },
    { name: 'S. Garcia', asbestos: 70, silica: 55, 'heavy metals': 60 },
];

export const pendingResults: PendingResult[] = [
  { id: 's1', sampleId: 'DT-S-001', project: 'Downtown Tower', date: '2024-07-18', status: 'Pending' },
  { id: 's2', sampleId: 'DT-S-002', project: 'Downtown Tower', date: '2024-07-18', status: 'Pending' },
  { id: 's3', sampleId: 'OP-S-005', project: 'Office Park', date: '2024-07-19', status: 'Pending' },
  { id: 's4', sampleId: 'HC-S-010', project: 'Historic Courthouse', date: '2024-07-20', status: 'Pending' },
];

export const activeExceedances: Exceedance[] = [
  { id: 'e1', analyte: 'Lead', concentration: '65 µg/m³', limit: '50 µg/m³ (PEL)', personnel: 'L. Smith', location: 'Coastal Bridge, Area B' },
];

export const documents: Document[] = [
  { id: 'd1', name: 'Lab Report - DT-S-001', type: 'Lab Report', uploadDate: '2024-07-15', thumbnailUrl: findImage('doc-thumb-1')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-1')?.imageHint ?? '' },
  { id: 'd2', name: 'Site Photo - Area C', type: 'Photo', uploadDate: '2024-07-14', thumbnailUrl: findImage('doc-thumb-2')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-2')?.imageHint ?? '' },
  { id: 'd3', name: 'Chain of Custody - Batch 4', type: 'Chain of Custody', uploadDate: '2024-07-12', thumbnailUrl: findImage('doc-thumb-3')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-3')?.imageHint ?? '' },
  { id: 'd4', name: 'Lab Report - OP-S-004', type: 'Lab Report', uploadDate: '2024-07-11', thumbnailUrl: findImage('doc-thumb-4')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-4')?.imageHint ?? '' },
];

export const existingNeas: ExistingNea[] = [
    { id: 'nea-01', project: 'Downtown Tower Renovation', task: 'Insulation Removal', analyte: 'Asbestos', effectiveDate: '2024-06-01', reviewDate: '2024-07-01', status: 'Active' },
    { id: 'nea-02', project: 'Suburban Office Park', task: 'Concrete Grinding', analyte: 'Silica', effectiveDate: '2024-06-15', reviewDate: '2024-07-15', status: 'Active' },
    { id: 'nea-03', project: 'Genesis Labs HQ', task: 'Paint Stripping', analyte: 'Lead', effectiveDate: '2024-05-20', reviewDate: '2024-06-20', status: 'Expired' },
];
