import {
  Construction,
  Lightbulb,
  Droplets,
  Recycle,
  Trees,
  Building2,
  TrafficCone,
  Ellipsis,
} from "lucide-react";
import type { ComponentType } from "react";
import type {
  ReportCategory,
  Department,
  Priority,
  ReportStatus,
} from "./types";

type Icon = ComponentType<{ className?: string; size?: number | string }>;

export const CATEGORIES: {
  name: ReportCategory;
  icon: Icon;
  blurb: string;
  subItems: string[];
  defaultDept: Department;
}[] = [
  {
    name: "Roads & Pavements",
    icon: Construction,
    blurb: "Potholes, cracked pavement & damaged sidewalks",
    subItems: [
      "Potholes",
      "Cracked pavement",
      "Damaged sidewalk",
      "Poor drainage",
      "Faded road markings",
    ],
    defaultDept: "Public Works",
  },
  {
    name: "Street Lighting",
    icon: Lightbulb,
    blurb: "Outages, flickering & damaged poles",
    subItems: [
      "Light outage",
      "Flickering",
      "Damaged pole",
      "Exposed wiring",
      "Over-illuminated",
    ],
    defaultDept: "Electrical & Utilities",
  },
  {
    name: "Water & Utilities",
    icon: Droplets,
    blurb: "Leaks, blockages & waterlogging",
    subItems: [
      "Leaking pipe",
      "No water supply",
      "Blocked drain",
      "Waterlogging",
      "Open manhole",
    ],
    defaultDept: "Electrical & Utilities",
  },
  {
    name: "Sanitation & Waste",
    icon: Recycle,
    blurb: "Overflowing bins & illegal dumping",
    subItems: [
      "Overflowing bin",
      "Illegal dumping",
      "Missed collection",
      "Litter & debris",
      "Dead animal",
    ],
    defaultDept: "Sanitation & Waste",
  },
  {
    name: "Parks & Trees",
    icon: Trees,
    blurb: "Green spaces, benches & unsafe trees",
    subItems: [
      "Fallen branch",
      "Damaged bench",
      "Vandalism",
      "Unsafe tree",
      "Playground fault",
    ],
    defaultDept: "Parks & Recreation",
  },
  {
    name: "Public Facilities",
    icon: Building2,
    blurb: "Civic buildings, toilets & accessibility",
    subItems: [
      "Broken door/window",
      "Facility toilet fault",
      "Lighting fault",
      "Accessibility issue",
      "Water fountain",
    ],
    defaultDept: "City Maintenance",
  },
  {
    name: "Traffic Signals",
    icon: TrafficCone,
    blurb: "Signal faults, signs & crosswalks",
    subItems: [
      "Signal fault",
      "Damaged sign",
      "Crosswalk issue",
      "Congestion hotspot",
      "Blocked sightline",
    ],
    defaultDept: "Transportation & Traffic",
  },
  {
    name: "Other",
    icon: Ellipsis,
    blurb: "Anything else affecting the community",
    subItems: ["Noise", "Stray animals", "General concern", "Safety hazard"],
    defaultDept: "City Maintenance",
  },
];

export const DEPARTMENTS: Department[] = [
  "Public Works",
  "Electrical & Utilities",
  "Sanitation & Waste",
  "Parks & Recreation",
  "Transportation & Traffic",
  "City Maintenance",
];

export const STAFF: {
  name: string;
  role: string;
  department: Department;
}[] = [
  { name: "Engr. Babatunde Ojo", role: "Public Works Lead", department: "Public Works" },
  { name: "M. Okafor", role: "Electrical Supervisor", department: "Electrical & Utilities" },
  { name: "Mrs. Adeyemi Nwosu", role: "Sanitation Coordinator", department: "Sanitation & Waste" },
  { name: "Mr. Emeka Obi", role: "Parks Manager", department: "Parks & Recreation" },
  { name: "Insp. Danladi Musa", role: "Traffic Analyst", department: "Transportation & Traffic" },
  { name: "Officer Okon Effiong", role: "Maintenance Chief", department: "City Maintenance" },
];

export const SLA_HOURS: Record<Priority, number> = {
  low: 168,
  medium: 72,
  high: 24,
  critical: 6,
};

export const DISTRICTS: string[] = [
  "Ikeja (Lagos)",
  "Lekki / Victoria Island (Lagos)",
  "Surulere (Lagos)",
  "Yaba / Mainland (Lagos)",
  "Abuja Municipal (AMAC, FCT)",
  "Garki / Wuse (Abuja FCT)",
  "Maitama / Asokoro (Abuja FCT)",
  "Port Harcourt City (Rivers)",
  "Ibadan North / Bodija (Oyo)",
  "Enugu North (Enugu)",
  "Kano Municipal (Kano)",
  "Alimosho (Lagos)",
];

export const SAMPLE_PHOTOS: string[] = [
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/cd55fb64-d08a-491e-b9c3-3d7c3695e9e9/pothole-a43fcb46-1791215329980.webp",
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/cd55fb64-d08a-491e-b9c3-3d7c3695e9e9/broken-streetlight-46bd60f0-1791215330005.webp",
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/cd55fb64-d08a-491e-b9c3-3d7c3695e9e9/flooded-street-29738b5d-1791215329192.webp",
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/cd55fb64-d08a-491e-b9c3-3d7c3695e9e9/overflowing-bin-8459aec3-1791215330381.webp",
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/cd55fb64-d08a-491e-b9c3-3d7c3695e9e9/park-bench-e9576cb4-1791215330238.webp",
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/cd55fb64-d08a-491e-b9c3-3d7c3695e9e9/traffic-signal-4477a154-1791215332588.webp",
];

export const STATUS_STEPS: ReportStatus[] = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
];

export const STATUS_META: Record<
  ReportStatus,
  { label: string; chip: string; dot: string; short: string }
> = {
  submitted: {
    label: "Submitted",
    short: "Received",
    chip: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },
  under_review: {
    label: "Under Review",
    short: "Review",
    chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  assigned: {
    label: "Assigned",
    short: "Assigned",
    chip: "bg-violet-50 text-violet-700 ring-violet-600/20",
    dot: "bg-violet-500",
  },
  in_progress: {
    label: "In Progress",
    short: "Progress",
    chip: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
    dot: "bg-cyan-500",
  },
  resolved: {
    label: "Resolved",
    short: "Resolved",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    short: "Closed",
    chip: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
  },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; bar: string; rank: number }
> = {
  low: {
    label: "Low",
    chip: "bg-slate-100 text-slate-600 ring-slate-500/20",
    bar: "bg-slate-400",
    rank: 0,
  },
  medium: {
    label: "Medium",
    chip: "bg-blue-50 text-blue-700 ring-blue-600/20",
    bar: "bg-blue-500",
    rank: 1,
  },
  high: {
    label: "High",
    chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
    bar: "bg-amber-500",
    rank: 2,
  },
  critical: {
    label: "Critical",
    chip: "bg-rose-50 text-rose-700 ring-rose-600/20",
    bar: "bg-rose-500",
    rank: 3,
  },
};

export const CHART_COLORS = [
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#64748b",
];

export const STORAGE_KEY = "civicreport:reports:v1";
export const ROLE_KEY = "civicreport:role:v1";
export const TRACK_KEY = "civicreport:track:v1";