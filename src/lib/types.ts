
import type { LucideIcon } from "lucide-react";
import { z } from 'zod';

export type Org = {
  id: string;
  name: string;
}

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  contactName: z.string(),
  contactEmail: z.string().email(),
  status: z.enum(['active', 'inactive', 'suspended']),
  createdAt: z.string(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  weatherApiKey: z.string().optional(),
});
export type Company = z.infer<typeof CompanySchema>;


export type AppFeature = 'dashboard' | 'projects' | 'airMonitoring' | 'surveys' | 'nea' | 'documents' | 'tools' | 'settings' | 'admin';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  orgId?: string;
  status: 'active' | 'inactive' | 'pending';
  organization: string;
  jobTitle: string;
  lastLogin?: string;
  createdAt: string;
  featureAccess?: AppFeature[];
};

export type Project = {
  id: string;
  name: string;
  jobNumber?: string;
  location: string;
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  ownerId?: string;
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
  isInspector?: boolean;
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
    ownerId?: string;
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
  ownerId?: string;
}

export const ExceedanceSchema = z.object({
  id: z.string(),
  resultId: z.string(),
  analyte: z.string(),
  concentration: z.string(),
  limit: z.string(),
  personnel: z.string(),
  location: z.string(),
  correctiveAction: z.string(),
  exceedanceDate: z.string(),
  evidence: z.string().optional(),
  ownerId: z.string(),
  orgId: z.string(),
});

export type Exceedance = z.infer<typeof ExceedanceSchema>;


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
  floorPlanUrl?: string;
  floorPlanHint?: string;
  exteriorPhotoUrls?: string[];
  exteriorPhotoHints?: string[];
  interiorPhotoUrls?: string[];
  interiorPhotoHints?: string[];
  samplePhotoUrls?: string[];
  samplePhotoHints?: string[];
  homogeneousAreas?: HomogeneousArea[];
  asbestosSamples?: AsbestosSample[];
  paintSamples?: PaintSample[];
  functionalAreas?: FunctionalArea[];
  checklistTemplates?: string[];
  ownerId?: string;
};

export type HomogeneousArea = {
    id: string;
    haId: string; // User-defined ID, e.g., "HA-01"
    description: string;
    functionalAreaIds?: string[] | null;
}

export type AsbestosSample = {
    id: string;
    sampleNumber: string;
    homogeneousAreaId: string;
    location: string;
    material: string;
    estimatedQuantity: string;
    friable: boolean;
    asbestosType: 'ND' | 'Chrysotile' | 'Amosite' | 'Crocidolite' | 'Trace';
    asbestosPercentage: number | null;
}

export type PaintSample = {
    id:string;
    location: string;
    paintColor: string;
    analyte: 'Lead' | 'Cadmium' | '';
    resultMgKg: number | null;
}

export type FunctionalArea = {
  id: string;
  faId: string;
  faUse: string;
  length: number | null;
  width: number | null;
  height: number | null;
};

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
  fileUrl?: string;
  ownerId?: string;
  projectId?: string;
  summary?: SummarizeLabReportOutput;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type SummarizeLabReportOutput = {
    summary: string;
    exceedances: string;
};
