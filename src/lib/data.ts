

import { Project, PersonnelExposure, Exceedance, Document, ExistingNea, Sample, Result, Location, Task, Personnel, ExposureLimit, Survey, AsbestosSample, PaintSample, ChecklistTemplate, FunctionalArea, HomogeneousArea } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const projects: Project[] = [
  { id: 'p1', name: 'Downtown Tower Renovation', jobNumber: '24-1001', location: '123 Main St, Metro City', status: 'Active', startDate: '2024-05-01', endDate: '2024-12-31' },
  { id: 'p2', name: 'Suburban Office Park', jobNumber: '24-1002', location: '456 Oak Ave, Suburbia', status: 'Active', startDate: '2024-06-15', endDate: '2025-01-31' },
  { id: 'p3', name: 'Coastal Bridge Repair', jobNumber: '24-2001', location: '789 Ocean Blvd, Seaside', status: 'On Hold', startDate: '2024-07-01', endDate: '2024-11-30' },
  { id: 'p4', name: 'Genesis Labs HQ', jobNumber: '23-5005', location: '101 Innovation Dr, Tech Park', status: 'Completed', startDate: '2023-01-10', endDate: '2024-04-20' },
  { id: 'p5', name: 'Historic Courthouse Restoration', jobNumber: '24-3001', location: '210 Justice Sq, Old Town', status: 'Active', startDate: '2024-08-01', endDate: '2025-05-01' },
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
  { id: 'per-1', name: 'John Doe', employeeId: '1234', fitTestDueDate: '2025-01-15', medicalClearanceDueDate: '2025-06-01', isInspector: true },
  { id: 'per-2', name: 'Laura Smith', employeeId: '5678', fitTestDueDate: '2024-08-20', medicalClearanceDueDate: '2025-04-10', isInspector: true },
  { id: 'per-3', name: 'Ming Chen', employeeId: '9012', fitTestDueDate: '2024-07-30', medicalClearanceDueDate: '2025-08-15', isInspector: false },
  { id: 'per-4', name: 'Robert Brown', employeeId: '3456', fitTestDueDate: '2023-10-01', medicalClearanceDueDate: '2024-01-01', isInspector: false },

];

export const results: Result[] = [
    { id: 'res-1', sampleId: 'samp-1', analyte: 'Silica', method: 'NIOSH 7500', units: 'mg/m³', concentration: 0.03, reportingLimit: 0.005, lab: 'AccuLabs', status: 'OK' }
];

export const samples: Sample[] = [
    { id: 'samp-1', projectId: 'p1', taskId: 'task-1', personnelId: 'per-1', description: 'Personal sample for drywall sander in Zone A.', sampleType: 'Personal', startTime: '2024-07-21 08:00', stopTime: '2024-07-21 12:00', flowRate: 2.45, duration: 240, volume: 588, result: results.find(r => r.sampleId === 'samp-1')},
    { id: 'samp-2', projectId: 'p2', taskId: 'task-2', personnelId: 'per-2', description: 'Asbestos abatement area sample near containment.', sampleType: 'Area', startTime: '2024-07-22 09:00', stopTime: '2024-07-22 13:00', flowRate: 2.5, duration: 240, volume: 600, result: { id: 'res-2', sampleId: 'samp-2', status: 'Pending', analyte: 'Asbestos', method: 'NIOSH 7400', units: 'f/cc', concentration: 0, reportingLimit: 0.01, lab: 'FutureLabs' }},
    { id: 'samp-3', projectId: 'p1', taskId: 'task-1', personnelId: 'per-3', description: 'General area background sample for silica.', sampleType: 'Area', startTime: '2024-07-23 08:30', stopTime: '2024-07-23 12:30', flowRate: 2.4, duration: 240, volume: 576, result: { id: 'res-3', sampleId: 'samp-3', status: 'Pending', analyte: 'Silica', method: 'NIOSH 7500', units: 'mg/m³', concentration: 0, reportingLimit: 0.005, lab: 'AccuLabs' }},
];

export const exposureLimits: ExposureLimit[] = [
    { id: 'lim-1', analyte: 'Asbestos', units: 'f/cc', al: 0.1, pel: 0.1, stel: 1.0, el: 1.0 },
    { id: 'lim-2', analyte: 'Silica', units: 'mg/m³', al: 0.025, pel: 0.05, stel: 0, el: 0 },
    { id: 'lim-3', analyte: 'Lead', units: 'µg/m³', al: 30, pel: 50, stel: 0, el: 0 },
];

export const existingNeas: ExistingNea[] = [
    { id: 'nea-01', project: 'Downtown Tower Renovation', task: 'Insulation Removal', analyte: 'Asbestos', effectiveDate: '2024-06-01', supportingSampleIds: ['samp-2'] },
    { id: 'nea-02', project: 'Suburban Office Park', task: 'Concrete Grinding', analyte: 'Silica', effectiveDate: '2024-06-15', supportingSampleIds: ['samp-1', 'samp-3'] },
    { id: 'nea-03', project: 'Genesis Labs HQ', task: 'Paint Stripping', analyte: 'Lead', effectiveDate: '2023-05-20' },
];

export const exceedances: Exceedance[] = [
  { id: 'e1', resultId: 'res-1-placeholder', analyte: 'Lead', concentration: '65 µg/m³', limit: '50 µg/m³ (PEL)', personnel: 'L. Smith', location: 'Coastal Bridge, Area B', correctiveAction: 'Stop work, implement wet methods, and re-sample.', exceedanceDate: '2024-07-15', evidence: 'path/to/photo.jpg' },
  { id: 'e2', resultId: 'res-2-placeholder', analyte: 'Silica', concentration: '0.06 mg/m³', limit: '0.05 mg/m³ (PEL)', personnel: 'J. Doe', location: 'Downtown Tower, 10th Floor', correctiveAction: 'Increase ventilation and require respiratory protection.', exceedanceDate: '2024-06-20' },
];

const initialFunctionalAreas: FunctionalArea[] = [
    { id: 'fa-1', faId: 'FA-01', faUse: 'Office', length: 20, width: 15, height: 8 },
    { id: 'fa-2', faId: 'FA-02', faUse: 'Corridor', length: 50, width: 8, height: 8 },
];

const initialHomogeneousAreas: HomogeneousArea[] = [
    { id: 'ha-1', haId: 'HA-01', description: '1st Floor Ceiling Tiles', functionalAreaId: 'fa-1' },
    { id: 'ha-2', haId: 'HA-02', description: 'Lobby 9x9 Floor Tiles', functionalAreaId: 'fa-2' },
];


const initialAsbestosSamples: AsbestosSample[] = [
    { id: 'asb-1', sampleNumber: 'MS-ASB-01', homogeneousAreaId: 'ha-1', location: '10th Floor - Ceiling Tiles', material: 'Acoustic Tile', friable: true, estimatedQuantity: '1000 sqft', asbestosType: 'Chrysotile', asbestosPercentage: 5 },
    { id: 'asb-2', sampleNumber: 'MS-ASB-02', homogeneousAreaId: 'ha-2', location: 'Lobby - Floor Tiles', material: '9x9 Vinyl Tile', friable: false, estimatedQuantity: '500 sqft', asbestosType: 'ND', asbestosPercentage: null },
    { id: 'asb-3', sampleNumber: 'MS-ASB-03', homogeneousAreaId: 'ha-1', location: '10th Floor - Damaged Tiles', material: 'Acoustic Tile', friable: true, estimatedQuantity: '50 sqft', asbestosType: 'Chrysotile', asbestosPercentage: 5 },
];

const initialPaintSamples: PaintSample[] = [
    { id: 'paint-1', location: 'Exterior Window Sills', paintColor: 'White', analyte: 'Lead', resultMgKg: 1200 },
    { id: 'paint-2', location: 'Interior Door Frames', paintColor: 'Brown', analyte: 'Lead', resultMgKg: null },
];

export const surveys: Survey[] = [
    { id: 'surv-1', siteName: 'Metro High School', address: '123 Education Ln, Metro City', inspector: 'John Doe', surveyDate: '2024-07-15', status: 'Completed', surveyType: ['Asbestos'], jobNumber: '24-1003', sitePhotoUrl: findImage('doc-thumb-2')?.imageUrl, sitePhotoHint: findImage('doc-thumb-2')?.imageHint, homogeneousAreas: initialHomogeneousAreas, asbestosSamples: initialAsbestosSamples, functionalAreas: initialFunctionalAreas, checklistTemplates: ['pre-survey', 'safety'] },
    { id: 'surv-2', siteName: 'Coastal Power Plant', address: '789 Power Rd, Seaside', inspector: 'Laura Smith', surveyDate: '2024-07-20', status: 'In Progress', surveyType: ['Lead', 'Cadmium'], jobNumber: '24-2005', paintSamples: initialPaintSamples, checklistTemplates: ['pre-survey', 'safety', 'equipment'] },
    { id: 'surv-3', siteName: 'Old City Hall', address: '210 Government Ave, Old Town', inspector: 'John Doe', surveyDate: '2024-08-01', status: 'Scheduled', surveyType: ['Asbestos', 'Lead'], jobNumber: '24-3005' },
    { id: 'surv-4', siteName: 'Suburbia Shopping Mall', address: '456 Market St, Suburbia', inspector: 'Ming Chen', surveyDate: '2024-07-25', status: 'Draft', surveyType: ['Cadmium'] },
];

export const checklistTemplates: ChecklistTemplate[] = [
    {
        id: 'cl-pre-survey',
        name: 'Pre-Survey Preparations',
        description: 'Initial steps to take before arriving on site.',
        category: 'pre-survey',
        isRequired: true,
        items: [
            { id: 'pre-1', text: 'Review project scope and objectives', itemType: 'checkbox', isRequired: true },
            { id: 'pre-2', text: 'Confirm site access and contact person', itemType: 'text_input', isRequired: true, description: 'Enter contact name and phone number.' },
            { id: 'pre-3', text: 'Prepare sampling equipment', itemType: 'checkbox', isRequired: true },
        ],
    },
    {
        id: 'cl-safety',
        name: 'On-Site Safety Review',
        description: 'Initial safety checks upon arrival.',
        category: 'safety',
        isRequired: true,
        items: [
            { id: 'safe-1', text: 'Site safety briefing conducted', itemType: 'checkbox', isRequired: true },
            { id: 'safe-2', text: 'Personal Protective Equipment (PPE) confirmed', itemType: 'checkbox', isRequired: true },
            { id: 'safe-3', text: 'Identified site hazards', itemType: 'text_input', isRequired: false, description: 'List any observed hazards (e.g., trip hazards, electrical).' },
        ],
    },
     {
        id: 'cl-equipment',
        name: 'Equipment Calibration',
        description: 'Verify equipment is calibrated and ready.',
        category: 'equipment',
        isRequired: false,
        items: [
            { id: 'equip-1', text: 'Confirm pump calibration date', itemType: 'checkbox', isRequired: true },
            { id: 'equip-2', text: 'Take photo of calibration certificate', itemType: 'photo', isRequired: false },
        ],
    },
];


export const personnelExposureData: PersonnelExposure[] = [
    { name: 'J. Doe', asbestos: 80, silica: 65, 'heavy metals': 45 },
    { name: 'L. Smith', asbestos: 30, silica: 40, 'heavy metals': 20 },
    { name: 'M. Chen', asbestos: 50, silica: 90, 'heavy metals': 75 },
    { name: 'R. Patel', asbestos: 20, silica: 15, 'heavy metals': 10 },
    { name: 'S. Garcia', asbestos: 70, silica: 55, 'heavy metals': 60 },
];

export const documents: Document[] = [
  { id: 'd1', name: 'Lab Report - DT-S-001', type: 'Lab Report', uploadDate: '2024-07-15', thumbnailUrl: findImage('doc-thumb-1')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-1')?.imageHint ?? '' },
  { id: 'd2', name: 'Site Photo - Area C', type: 'Photo', uploadDate: '2024-07-14', thumbnailUrl: findImage('doc-thumb-2')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-2')?.imageHint ?? '' },
  { id: 'd3', name: 'Chain of Custody - Batch 4', type: 'Chain of Custody', uploadDate: '2024-07-12', thumbnailUrl: findImage('doc-thumb-3')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-3')?.imageHint ?? '' },
  { id: 'd4', name: 'Lab Report - OP-S-004', type: 'Lab Report', uploadDate: '2024-07-11', thumbnailUrl: findImage('doc-thumb-4')?.imageUrl ?? '', thumbnailHint: findImage('doc-thumb-4')?.imageHint ?? '' },
];
