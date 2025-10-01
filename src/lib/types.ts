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
  clientId: string;
};

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
  id: string;
  sampleId: string;
  project: string;
  date: string;
  status: "Pending" | "Received";
};

export type Exceedance = {
  id: string;
  analyte: string;
  concentration: string;
  limit: string;
  personnel: string;
  location: string;
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
