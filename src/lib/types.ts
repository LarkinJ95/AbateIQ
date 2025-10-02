
import type { LucideIcon } from "lucide-react";

export type Project = {
  id: string;
  name: string;
  jobNumber?: string;
  location: string;
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
};

export type Location = {
  id: string;
  name: string; 
  projectId: string;
};

export type Task = {
  id: string;
  name: string; 
  description: string;
  projectId: string;
  locationId?: string;
};

export type Personnel = {
  id: string;
  name: string;
  employeeId: string;
  fitTestDueDate: string;
  medicalClearanceDueDate: string;
};

export type Sample = {
    id: string;
    projectId: string;
    description: string;
    taskId: string;
    personnelId: string;
    sampleType: "Area" | "Personal" | "Blank" | "Excursion" | "Clearance";
    startTime: string;
    stopTime: string;
    flowRate: number; 
    duration: number; 
    volume: number;
    result?: Result;
};

export type Result = {
    id: string;
    sampleId: string;
    analyte: string;
    method: string;
    units: string;
    concentration: number;
    reportingLimit: number;
    lab: string;
    status: "Pending" | "OK" | "≥AL" | ">PEL" | ">EL";
}

export type ExposureLimit = {
    id: string;
    analyte: string;
    units: string;
    al: number; 
    pel: number; 
    stel: number; 
    el: number; 
}

export type ExistingNea = {
  id: string;
  project: string;
  task: string;
  analyte: string;
  effectiveDate: string;
  supportingSampleIds?: string[];
}

export type Exceedance = {
  id: string;
  resultId: string;
  analyte: string;
  concentration: string;
  limit: string;
  personnel: string;
  location: string;
  correctiveAction: string;
  exceedanceDate: string;
  evidence?: string;
};

export type Survey = {
  id: string;
  siteName: string;
  address: string;
  inspector: string;
  surveyDate: string;
  status: "Completed" | "In Progress" | "Scheduled" | "On Hold" | "Draft";
  surveyType: string[];
  jobNumber?: string;
  sitePhotoUrl?: string;
  sitePhotoHint?: string;
  asbestosSamples?: AsbestosSample[];
  paintSamples?: PaintSample[];
  checklistTemplates?: string[];
};

export type AsbestosSample = {
    id: string;
    sampleNumber: string;
    location: string;
    homogeneousArea: string;
    material: string;
    estimatedQuantity: string;
    friable: boolean;
    asbestosType: 'ND' | 'Chrysotile' | 'Amosite' | 'Crocidolite' | 'Trace';
    asbestosPercentage: number | null;
}

export type PaintSample = {
    id: string;
    location: string;
    paintColor: string;
    result: 'ND' | 'Trace' | 'Positive';
}

export type ChecklistItem = {
  id: string;
  text: string;
  description?: string;
  itemType: 'checkbox' | 'text_input' | 'number_input' | 'file_upload' | 'photo';
  isRequired: boolean;
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  description?: string;
  category: 'pre-survey' | 'during-survey' | 'post-survey' | 'safety' | 'equipment';
  isRequired: boolean;
  items: ChecklistItem[];
};

export type ChecklistResponse = {
  [itemId: string]: {
    response: string;
    isCompleted: boolean;
  }
};


// Old types - will be reviewed and updated/removed
export type PersonnelExposure = {
  name: string;
  asbestos: number;
  silica: number;
  "heavy metals": number;
};

export type Document = {
  id: string;
  name:string;
  type: "Lab Report" | "Photo" | "Chain of Custody";
  uploadDate: string;
  thumbnailUrl: string;
  thumbnailHint: string;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};
