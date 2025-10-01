
import type { LucideIcon } from "lucide-react";

export type Client = {
  id: string;
  name: string;
  logoUrl: string;
  logoHint: string;
};

export type Project = {
  id: string;
  name: string;
  location: string;
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  clientId: string;
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
    taskId: string;
    personnelId: string;
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
  evidence?: string;
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
  name: string;
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
