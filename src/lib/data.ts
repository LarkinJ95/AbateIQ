import { Client, Project, NeaReview, PersonnelExposure, Exceedance, Document, ExistingNea, Sample, Result, Location, Task, Personnel, ExposureLimit } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const clients: Client[] = [
  { id: '1', name: 'Apex Construction', logoUrl: findImage('client-logo-1')?.imageUrl ?? '', logoHint: findImage('client-logo-1')?.imageHint ?? '' },
  { id: '2', name: 'Innovate Builders', logoUrl: findImage('client-logo-2')?.imageUrl ?? '', logoHint: findImage('client-logo-2')?.imageHint ?? '' },
  { id: '3', name: 'Terra Firma', logoUrl: findImage('client-logo-3')?.imageUrl ?? '', logoHint: findImage('client-logo-3')?.imageHint ?? '' },
];

export const projects: Project[] = [
  { id: 'p1', name: 'Downtown Tower Renovation', location: '123 Main St, Metro City', status: 'Active', clientId: '1', startDate: '2024-05-01', endDate: '2024-12-31' },
  { id: 'p2', name: 'Suburban Office Park', location: '456 Oak Ave, Suburbia', status: 'Active', clientId: '1', startDate: '2024-06-15', endDate: '2025-01-31' },
  { id: 'p3', name: 'Coastal Bridge Repair', location: '789 Ocean Blvd, Seaside', status: 'On Hold', clientId: '2', startDate: '2024-07-01', endDate: '2024-11-30' },
  { id: 'p4', name: 'Genesis Labs HQ', location: '101 Innovation Dr, Tech Park', status: 'Completed', clientId: '2', startDate: '2023-01-10', endDate: '2024-04-20' },
  { id: 'p5', name: 'Historic Courthouse Restoration', location: '210 Justice Sq, Old Town', status: 'Active', clientId: '3', startDate: '2024-08-01', endDate: '2025-05-01' },
];

export const locations: Location[] = [
  { id: 'loc-1', name: 'Downtown Tower - 10th Floor', projectId: 'p1' },
  { id: 'loc-2', name: 'Downtown Tower - Lobby', projectId: 'p1' },
  { id: 'loc-3', name: 'Suburban Office Park - Building 3', projectId: 'p2' },
];

export const tasks: Task[] = [
  { id: 'task-1', name: 'Drywall Sanding', description: 'Sanding interior drywall before painting.', projectId: 'p1', locationId: 'loc-1' },
  { id: 'task-2', name: 'Insulation Abatement', description: 'Removal of old asbestos insulation.', projectId: 'p2', locationId: 'loc-3' },
  { id: 'task-3', name: 'Weld-Coating Removal', description: 'Grinding lead-based paint off bridge girders.', projectId: 'p3' },
];

export const personnel: Personnel[] = [
  { id: 'per-1', name: 'John Doe', employeeId: '1234', fitTestDueDate: '2025-01-15', medicalClearanceDueDate: '2025-06-01' },
  { id: 'per-2', name: 'Laura Smith', employeeId: '5678', fitTestDueDate: '2024-08-20', medicalClearanceDueDate: '2025-04-10' },
  { id: 'per-3', name: 'Ming Chen', employeeId: '9012', fitTestDueDate: '2024-07-30', medicalClearanceDueDate: '2025-08-15' },
  { id: 'per-4', name: 'Robert Brown', employeeId: '3456', fitTestDueDate: '2023-10-01', medicalClearanceDueDate: '2024-01-01' },

];

export const results: Result[] = [
    { id: 'res-1', sampleId: 'samp-1', analyte: 'Silica', method: 'NIOSH 7500', units: 'mg/m³', concentration: 0.03, reportingLimit: 0.005, lab: 'AccuLabs', status: 'OK' }
];

export const samples: Sample[] = [
    { id: 'samp-1', projectId: 'p1', taskId: 'task-1', personnelId: 'per-1', startTime: '2024-07-21 08:00', stopTime: '2024-07-21 12:00', flowRate: 2.45, duration: 240, volume: 588, result: results.find(r => r.sampleId === 'samp-1')},
    { id: 'samp-2', projectId: 'p2', taskId: 'task-2', personnelId: 'per-2', startTime: '2024-07-22 09:00', stopTime: '2024-07-22 13:00', flowRate: 2.5, duration: 240, volume: 600, result: { id: 'res-2', sampleId: 'samp-2', status: 'Pending', analyte: 'Asbestos', method: 'NIOSH 7400', units: 'f/cc', concentration: 0, reportingLimit: 0.01, lab: 'FutureLabs' }},
    { id: 'samp-3', projectId: 'p1', taskId: 'task-1', personnelId: 'per-3', startTime: '2024-07-23 08:30', stopTime: '2024-07-23 12:30', flowRate: 2.4, duration: 240, volume: 576, result: { id: 'res-3', sampleId: 'samp-3', status: 'Pending', analyte: 'Silica', method: 'NIOSH 7500', units: 'mg/m³', concentration: 0, reportingLimit: 0.005, lab: 'AccuLabs' }},
];

export const exposureLimits: ExposureLimit[] = [
    { id: 'lim-1', analyte: 'Asbestos', units: 'f/cc', al: 0.1, pel: 0.1, stel: 1.0, el: 1.0 },
    { id: 'lim-2', analyte: 'Silica', units: 'mg/m³', al: 0.025, pel: 0.05, stel: 0, el: 0 },
    { id: 'lim-3', analyte: 'Lead', units: 'µg/m³', al: 30, pel: 50, stel: 0, el: 0 },
];

export const existingNeas: ExistingNea[] = [
    { id: 'nea-01', project: 'Downtown Tower Renovation', task: 'Insulation Removal', analyte: 'Asbestos', effectiveDate: '2024-06-01', reviewDate: '2024-07-01', status: 'Active' },
    { id: 'nea-02', project: 'Suburban Office Park', task: 'Concrete Grinding', analyte: 'Silica', effectiveDate: '2024-06-15', reviewDate: '2024-07-15', status: 'Active' },
    { id: 'nea-03', project: 'Genesis Labs HQ', task: 'Paint Stripping', analyte: 'Lead', effectiveDate: '2024-05-20', reviewDate: '2024-06-20', status: 'Expired' },
];

export const exceedances: Exceedance[] = [
  { id: 'e1', resultId: 'res-1-placeholder', analyte: 'Lead', concentration: '65 µg/m³', limit: '50 µg/m³ (PEL)', personnel: 'L. Smith', location: 'Coastal Bridge, Area B', correctiveAction: 'Stop work, implement wet methods, and re-sample.', evidence: 'path/to/photo.jpg' },
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

export const activeExceedances: Exceedance[] = [
  { id: 'e1', resultId: 'res-1-placeholder', analyte: 'Lead', concentration: '65 µg/m³', limit: '50 µg/m³ (PEL)', personnel: 'L. Smith', location: 'Coastal Bridge, Area B', correctiveAction: 'Stop work, implement wet methods, and re-sample.' },
];

export const documents: Document[] = [
  { id: 'd1', name: 'Lab Report - DT-S-001', type: 'Lab Report', uploadDate: '2024-07-15', thumbnailUrl: findImage('doc-thumb-1')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-1')?.imageHint ?? '' },
  { id: 'd2', name: 'Site Photo - Area C', type: 'Photo', uploadDate: '2024-07-14', thumbnailUrl: findImage('doc-thumb-2')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-2')?.imageHint ?? '' },
  { id: 'd3', name: 'Chain of Custody - Batch 4', type: 'Chain of Custody', uploadDate: '2024-07-12', thumbnailUrl: findImage('doc-thumb-3')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-3')?.imageHint ?? '' },
  { id: 'd4', name: 'Lab Report - OP-S-004', type: 'Lab Report', uploadDate: '2024-07-11', thumbnailUrl: findImage('doc-thumb-4')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-4')?.imageHint ?? '' },
];
