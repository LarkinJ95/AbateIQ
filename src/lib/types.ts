
import { z } from 'zod';
import type { LucideIcon } from "lucide-react";

// Base Organization Schema
export const OrgSchema = z.object({
  id: z.string().describe("Unique identifier for the organization (orgId)."),
  name: z.string().describe("Name of the organization."),
  createdAt: z.string().datetime().describe("Server-set timestamp of organization creation."),
});
export type Org = z.infer<typeof OrgSchema>;

// User and Personnel Schemas
export const AppFeatureSchema = z.enum(['dashboard', 'projects', 'airMonitoring', 'surveys', 'nea', 'documents', 'tools', 'settings', 'admin']);
export type AppFeature = z.infer<typeof AppFeatureSchema>;

export const UserRoleSchema = z.enum(['admin', 'editor', 'viewer', 'manager']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const PersonSchema = z.object({
  id: z.string().describe("Matches Firebase Auth UID."),
  orgId: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  isInspector: z.boolean().optional().default(false),
  employeeId: z.string().optional(),
  fitTestDueDate: z.string().optional(),
  medicalClearanceDueDate: z.string().optional(),
});
export type Personnel = z.infer<typeof PersonSchema>;
export type User = z.infer<typeof PersonSchema>;


// Project Management Schemas
export const JobSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  clientName: z.string(),
  location: z.string(),
  status: z.enum(["Active", "Completed", "On Hold"]),
  startDate: z.string(),
  endDate: z.string(),
});
export type Project = z.infer<typeof JobSchema>; // Using Project as the UI-facing name for Job
export type Job = z.infer<typeof JobSchema>;

export const SiteSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  jobId: z.string(),
  address: z.string(),
  zone: z.string().optional(),
});
export type Site = z.infer<typeof SiteSchema>;


// Sampling and Analysis Schemas
export const AnalyteSchema = z.object({
    id: z.string(),
    orgId: z.string(),
    name: z.string(),
    method: z.string().optional(),
    unit: z.string(),
    standardRef: z.string().optional(),
    pel: z.number().optional(),
    al: z.number().optional(),
    stel: z.number().optional(),
    el: z.number().optional(),
});
export type Analyte = z.infer<typeof AnalyteSchema>;
export type ExposureLimit = Analyte; // Use Analyte as the single source of truth

export const InstrumentSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  model: z.string(),
  serial: z.string(),
  calibrationLogs: z.array(z.object({
    date: z.string().datetime(),
    preFlow: z.number(),
    postFlow: z.number(),
  })).optional(),
});
export type Instrument = z.infer<typeof InstrumentSchema>;

export const SampleSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  jobId: z.string(),
  siteId: z.string().optional(),
  analyteId: z.string(),
  instrumentId: z.string().optional(),
  description: z.string().optional(),
  mediaType: z.string().optional(),
  startTime: z.string().datetime(),
  stopTime: z.string().datetime(),
  preFlow: z.number().optional(),
  postFlow: z.number().optional(),
  labId: z.string().optional(),
  resultValue: z.number().optional(),
  resultUnit: z.string().optional(),
  resultQualifiers: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  createdByUid: z.string(),
});
export type Sample = z.infer<typeof SampleSchema>;

// Compliance and Audit Schemas
export const ExceedanceSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  jobId: z.string(),
  sampleId: z.string(),
  analyteId: z.string(),
  standardRef: z.string().optional(),
  thresholdValue: z.number().optional(),
  comparisonOperator: z.string().optional(),
  calculatedTWAorConc: z.number().optional(),
  exceeded: z.boolean(),
  reviewerUid: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  locked: z.boolean().default(false),
});
export type Exceedance = z.infer<typeof ExceedanceSchema>;

export const AuditSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  actorUid: z.string(),
  action: z.string(),
  path: z.string(),
  beforeSnapshotHash: z.string().optional(),
  afterSnapshotHash: z.string().optional(),
  serverTimestamp: z.string().datetime(),
});
export type Audit = z.infer<typeof AuditSchema>;


// Legacy and UI-specific types - To be refactored or removed
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Types from old data model, kept for reference during refactoring.
// These should be phased out and replaced with Zod-inferred types.
export type Task = { id: string; name: string; description: string; projectId: string; locationId?: string; };
export type Location = { id: string; name: string; projectId: string; };

// Survey specific types, which can be complex
export const FunctionalAreaSchema = z.object({
  id: z.string(),
  faId: z.string(),
  faUse: z.string(),
  length: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});
export type FunctionalArea = z.infer<typeof FunctionalAreaSchema>;

export const HomogeneousAreaSchema = z.object({
    id: z.string(),
    haId: z.string(),
    description: z.string(),
    functionalAreaIds: z.array(z.string()).optional().nullable(),
});
export type HomogeneousArea = z.infer<typeof HomogeneousAreaSchema>;

export const AsbestosSampleSchema = z.object({
    id: z.string(),
    sampleNumber: z.string(),
    homogeneousAreaId: z.string(),
    location: z.string(),
    material: z.string(),
    estimatedQuantity: z.string().optional(),
    friable: z.boolean().optional(),
    asbestosType: z.enum(['ND', 'Chrysotile', 'Amosite', 'Crocidolite', 'Trace']),
    asbestosPercentage: z.number().nullable(),
});
export type AsbestosSample = z.infer<typeof AsbestosSampleSchema>;

export const PaintSampleSchema = z.object({
    id:z.string(),
    location: z.string(),
    paintColor: z.string(),
    analyte: z.enum(['Lead', 'Cadmium', '']),
    resultMgKg: z.number().nullable(),
});
export type PaintSample = z.infer<typeof PaintSampleSchema>;

export const SurveySchema = z.object({
  id: z.string(),
  orgId: z.string(),
  jobId: z.string().optional(), // Corresponds to Job/Project
  siteName: z.string(),
  address: z.string(),
  inspector: z.string(),
  surveyDate: z.string(),
  status: z.enum(["Completed", "In Progress", "Scheduled", "On Hold", "Draft"]),
  surveyType: z.array(z.string()),
  sitePhotoUrl: z.string().url().optional(),
  sitePhotoHint: z.string().optional(),
  floorPlanUrl: z.string().url().optional(),
  floorPlanHint: z.string().optional(),
  exteriorPhotoUrls: z.array(z.string().url()).optional(),
  interiorPhotoUrls: z.array(z.string().url()).optional(),
  samplePhotoUrls: z.array(z.string().url()).optional(),
  homogeneousAreas: z.array(HomogeneousAreaSchema).optional(),
  asbestosSamples: z.array(AsbestosSampleSchema).optional(),
  paintSamples: z.array(PaintSampleSchema).optional(),
  functionalAreas: z.array(FunctionalAreaSchema).optional(),
  checklistTemplates: z.array(z.string()).optional(),
  ownerId: z.string().optional(),
});
export type Survey = z.infer<typeof SurveySchema>;

export type SummarizeLabReportOutput = {
    summary: string;
    exceedances: string;
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

// Deprecated, use Zod schemas instead
export type ExistingNea = {
  id: string;
  project: string;
  task: string;
  analyte: string;
  effectiveDate: string;
  supportingSampleIds?: string[];
  ownerId?: string;
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

export type Company = {
    id: string;
    name: string;
    contactName: string;
    contactEmail: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    weatherApiKey?: string;
};

    