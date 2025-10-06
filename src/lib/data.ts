

import { Project, PersonnelExposure, Exceedance, Document, ExistingNea, Sample, Result, Location, Task, Personnel, ExposureLimit, Survey, AsbestosSample, PaintSample, ChecklistTemplate, FunctionalArea, HomogeneousArea, Company } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const projects: Project[] = [];
export const locations: Location[] = [];
export const tasks: Task[] = [];
export const personnel: Personnel[] = [];
export const results: Result[] = [];
export const samples: Sample[] = [];
export const surveys: Survey[] = [];
export const existingNeas: ExistingNea[] = [];
export const exceedances: Exceedance[] = [];
export const documents: Document[] = [];
export const companies: Company[] = [];


export const exposureLimits: ExposureLimit[] = [];

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
    { name: 'J. Doe', asbestos: 80, silica: 65, 'heavy-metals': 45 },
    { name: 'L. Smith', asbestos: 30, silica: 40, 'heavy-metals': 20 },
    { name: 'M. Chen', asbestos: 50, silica: 90, 'heavy-metals': 75 },
    { name: 'R. Patel', asbestos: 20, silica: 15, 'heavy-metals': 10 },
    { name: 'S. Garcia', asbestos: 70, silica: 55, 'heavy-metals': 60 },
];

export const averageResultsData = [
  { analyte: 'Asbestos', average: 0.08, units: 'f/cc' },
  { analyte: 'Silica', average: 0.04, units: 'mg/m³' },
  { analyte: 'Lead', average: 35, units: 'µg/m³' },
  { analyte: 'Cadmium', average: 5, units: 'µg/m³' },
];

    