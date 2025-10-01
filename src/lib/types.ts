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
  location: string; // This might be better as a reference to a Location type
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  clientId: string;
};

export type Location = {
  id: string;
  name: string; // e.g., "Building A, 3rd Floor"
  projectId: string;
};

export type Task = {
  id: string;
  name: string; // e.g., "Drywall Sanding"
  description: string;
  projectId: string;
  locationId?: string; // Optional if task is project-wide
};

export type Personnel = {
  id: string;
  name: string;
  fitTestDueDate: string;
  medicalClearanceDueDate: string;
};

export type Equipment = {
    id: string;
    name: string;
    type: "Pump" | "Calibrator" | "Media";
    status: "Available" | "In Use" | "Out of Service";
    calibrationDueDate: string;
}

export type Calibration = {
    id: string;
    equipmentId: string;
    personnelId: string;
    preFlow: number;
    postFlow: number;
    averageFlow: number;
    date: string;
}

export type Sample = {
    id: string;
    projectId: string;
    taskId: string;
    personnelId: string;
    equipmentId: string;
    startTime: string;
    stopTime: string;
    flowRate: number; // L/min
    duration: number; // minutes
    volume: number; // Liters
};

export type Result = {
    id: string;
    sampleId: string;
    analyte: "Asbestos" | "Silica" | "Lead" | "Heavy Metals";
    method: string; // NIOSH/EPA method
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
    al: number; // Action Level
    pel: number; // Permissible Exposure Limit
    stel: number; // Short-Term Exposure Limit
    el: number; // Excursion Limit
}

export type Nea = {
  id: string;
  project: string;
  task: string;
  analyte: string;
  effectiveDate: string;
  reviewDate: string;
  status: "Active" | "Expired";
  supportingSampleIds?: string[];
}

export type Exceedance = {
  id: string;
  resultId: string;
  analyte: string;
  concentration: string;
limt: string;
  personnel: string;
  location: string;
  correctiveAction: string;
  evidence?: string; // path to evidence file
};


// Old types - will be reviewed and updated/removed
export type NeaReview = {
  id: string;
  projectName: string;
  task: string;
  analyte: string;
  dueDate: string;
};

export type PersonnelExposure = {
  name: string;
  asbestos: number;
  silica: number;
  "heavy metals": number;
};

export type PendingResult = {
  id:string;
  sampleId: string;
  project: string;
  date: string;
  status: "Pending" | "Received";
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

export type ExistingNea = {
  id: string;
  project: string;
  task: string;
  analyte: string;
  effectiveDate: string;
  reviewDate: string;
  status: "Active" | "Expired";
}
