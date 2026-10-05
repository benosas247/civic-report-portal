export type ReportCategory =
  | "Roads & Pavements"
  | "Street Lighting"
  | "Water & Utilities"
  | "Sanitation & Waste"
  | "Parks & Trees"
  | "Public Facilities"
  | "Traffic Signals"
  | "Other";

export type ReportStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export type Priority = "low" | "medium" | "high" | "critical";

export type Department =
  | "Public Works"
  | "Electrical & Utilities"
  | "Sanitation & Waste"
  | "Parks & Recreation"
  | "Transportation & Traffic"
  | "City Maintenance";

export type PortalRole = "citizen" | "government";

export interface TimelineEvent {
  id: string;
  kind: "status" | "note" | "assignment" | "resolution" | "priority";
  label: string;
  detail?: string;
  actor: string;
  timestamp: string;
}

export interface ResolutionEvidence {
  url: string;
  caption: string;
  uploadedBy: string;
  timestamp: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  subItem: string;
  status: ReportStatus;
  priority: Priority;
  department: Department | null;
  assignedOfficer: string | null;
  district: string;
  address: string;
  coordinates: { x: number; y: number };
  photos: string[];
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  timeline: TimelineEvent[];
  resolutionNotes: string;
  resolutionEvidence: ResolutionEvidence[];
}

export interface FilterOptions {
  search: string;
  status: ReportStatus | "all";
  priority: Priority | "all";
  department: Department | "all";
  district: string | "all";
}
