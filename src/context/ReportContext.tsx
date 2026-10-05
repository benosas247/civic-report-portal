import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  STORAGE_KEY,
  ROLE_KEY,
  TRACK_KEY,
  SAMPLE_PHOTOS,
} from "../constants";
import type {
  Department,
  PortalRole,
  Priority,
  Report,
  ReportCategory,
  ReportStatus,
  ResolutionEvidence,
  TimelineEvent,
} from "../types";

const nowISO = () => new Date().toISOString();

function uid(prefix = "evt"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

function makeReportId(existing: Set<string>): string {
  let id = "";
  do {
    const n = Math.floor(1000 + Math.random() * 9000);
    id = `CR-2025-${n}`;
  } while (existing.has(id));
  return id;
}

function event(
  kind: TimelineEvent["kind"],
  label: string,
  actor: string,
  detail?: string
): TimelineEvent {
  return { id: uid(), kind, label, detail, actor, timestamp: nowISO() };
}

export interface NewReportInput {
  title: string;
  description: string;
  category: ReportCategory;
  subItem: string;
  priority: Priority;
  department: Department | null;
  district: string;
  address: string;
  coordinates: { x: number; y: number };
  photos: string[];
  contactEmail: string;
  contactPhone: string;
}

interface ReportContextValue {
  reports: Report[];
  role: PortalRole;
  setRole: (r: PortalRole) => void;
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  submitReport: (input: NewReportInput) => string;
  updateReportStatus: (
    id: string,
    status: ReportStatus,
    notes: string,
    updatedBy: string
  ) => void;
  assignReport: (
    id: string,
    department: Department,
    officer: string,
    notes: string,
    updatedBy: string
  ) => void;
  updatePriority: (id: string, priority: Priority, updatedBy: string) => void;
  resolveReport: (
    id: string,
    resolutionNotes: string,
    evidence: ResolutionEvidence[],
    resolvedBy: string
  ) => void;
  deleteReport: (id: string) => void;
  seedSampleReports: () => number;
  clearAllReports: () => void;
  getReport: (id: string) => Report | undefined;
}

const ReportContext = createContext<ReportContextValue | null>(null);

function loadReports(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(() => loadReports());
  const [role, setRoleState] = useState<PortalRole>(() => {
    const r = localStorage.getItem(ROLE_KEY);
    return r === "government" ? "government" : "citizen";
  });
  const [activeTrackId, setActiveTrackIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(TRACK_KEY) || "";
    } catch {
      return "";
    }
  });

  const reportsRef = useRef(reports);
  reportsRef.current = reports;

  // Persist + broadcast to other tabs on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      /* quota — ignore */
    }
  }, [reports]);

  // Cross-tab live sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setReports(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setRole = useCallback((r: PortalRole) => {
    setRoleState(r);
    try {
      localStorage.setItem(ROLE_KEY, r);
    } catch {
      /* ignore */
    }
  }, []);

  const setActiveTrackId = useCallback((id: string) => {
    setActiveTrackIdState(id);
    try {
      localStorage.setItem(TRACK_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const submitReport = useCallback((input: NewReportInput) => {
    const existing = new Set(reportsRef.current.map((r) => r.id));
    const id = makeReportId(existing);
    const created = nowISO();
    const report: Report = {
      id,
      ...input,
      assignedOfficer: null,
      status: "submitted",
      createdAt: created,
      updatedAt: created,
      resolvedAt: null,
      resolutionNotes: "",
      resolutionEvidence: [],
      timeline: [
        event(
          "status",
          "Report submitted",
          input.contactEmail || "Citizen",
          "Your report has been received by the CivicReport intake system."
        ),
      ],
    };
    setReports((prev) => [report, ...prev]);
    return id;
  }, []);

  const patch = useCallback(
    (
      id: string,
      mutator: (r: Report) => Partial<Report>,
      evt: TimelineEvent
    ) => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...mutator(r),
                updatedAt: nowISO(),
                timeline: [...r.timeline, evt],
              }
            : r
        )
      );
    },
    []
  );

  const updateReportStatus = useCallback(
    (id: string, status: ReportStatus, notes: string, updatedBy: string) => {
      patch(
        id,
        (r) => ({
          status,
          resolvedAt: status === "resolved" ? nowISO() : r.resolvedAt,
        }),
        event("status", `Status → ${status}`, updatedBy, notes || undefined)
      );
    },
    [patch]
  );

  const assignReport = useCallback(
    (
      id: string,
      department: Department,
      officer: string,
      notes: string,
      updatedBy: string
    ) => {
      patch(
        id,
        (r) => ({
          department,
          assignedOfficer: officer,
          status:
            r.status === "submitted" || r.status === "under_review"
              ? "assigned"
              : r.status,
        }),
        event(
          "assignment",
          `Assigned to ${department}`,
          updatedBy,
          [officer && `Officer: ${officer}`, notes].filter(Boolean).join(" — ")
        )
      );
    },
    [patch]
  );

  const updatePriority = useCallback(
    (id: string, priority: Priority, updatedBy: string) => {
      patch(
        id,
        () => ({ priority }),
        event("priority", `Priority → ${priority}`, updatedBy)
      );
    },
    [patch]
  );

  const resolveReport = useCallback(
    (
      id: string,
      resolutionNotes: string,
      evidence: ResolutionEvidence[],
      resolvedBy: string
    ) => {
      patch(
        id,
        (r) => ({
          status: "resolved",
          resolvedAt: nowISO(),
          resolutionNotes,
          resolutionEvidence: [...r.resolutionEvidence, ...evidence],
        }),
        event("resolution", "Marked resolved", resolvedBy, resolutionNotes)
      );
    },
    [patch]
  );

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAllReports = useCallback(() => setReports([]), []);

  const seedSampleReports = useCallback(() => {
    const base = Date.now();
    const mk = (
      offsetH: number,
      data: Partial<Report> & {
        id: string;
        title: string;
        category: ReportCategory;
        subItem: string;
        status: ReportStatus;
        priority: Priority;
        district: string;
        address: string;
      }
    ): Report => {
      const created = new Date(base - offsetH * 3600_000).toISOString();
      const tl: TimelineEvent[] = [
        event("status", "Report submitted", "Citizen", "Received at intake."),
      ];
      if (data.status !== "submitted")
        tl.push(event("status", "Status → under_review", "Triage Desk"));
      if (data.status === "assigned" || data.department)
        tl.push(
          event(
            "assignment",
            `Assigned to ${data.department ?? "City Maintenance"}`,
            "Triage Desk",
            data.assignedOfficer ? `Officer: ${data.assignedOfficer}` : undefined
          )
        );
      if (data.status === "in_progress" || data.status === "resolved")
        tl.push(event("status", "Status → in_progress", data.assignedOfficer ?? "Field Crew"));
      if (data.status === "resolved")
        tl.push(event("resolution", "Marked resolved", data.assignedOfficer ?? "Field Crew", "Works completed and verified on site."));
      return {
        description: "",
        department: null,
        assignedOfficer: null,
        coordinates: { x: 50, y: 50 },
        photos: [],
        contactEmail: "",
        contactPhone: "",
        createdAt: created,
        updatedAt: created,
        resolvedAt: data.status === "resolved" ? created : null,
        timeline: tl,
        resolutionNotes: "",
        resolutionEvidence: [],
        ...data,
      } as Report;
    };

    const samples: Report[] = [
      mk(2, {
        id: "CR-2025-4812",
        title: "Deep pothole along Awolowo Way near Allen Junction",
        description:
          "A large pothole roughly 60cm wide has opened up on Awolowo Way and is filling with water. Multiple vehicles are swerving into the opposite lane to avoid it, causing near-misses with okada riders.",
        category: "Roads & Pavements",
        subItem: "Potholes",
        status: "submitted",
        priority: "high",
        district: "Ikeja (Lagos)",
        address: "Awolowo Way, near Allen Junction",
        coordinates: { x: 34, y: 62 },
        photos: [SAMPLE_PHOTOS[0]],
      }),
      mk(9, {
        id: "CR-2025-4790",
        title: "Streetlight malfunction along Ahmadu Bello Way",
        description:
          "Two streetlights along Ahmadu Bello Way near the Victoria Island axis are completely dark, making the pedestrian walkway unsafe after sunset for workers returning from offices.",
        category: "Street Lighting",
        subItem: "Light outage",
        status: "under_review",
        priority: "medium",
        district: "Lekki / Victoria Island (Lagos)",
        address: "Ahmadu Bello Way, Victoria Island",
        coordinates: { x: 68, y: 22 },
        photos: [SAMPLE_PHOTOS[1]],
      }),
      mk(26, {
        id: "CR-2025-4731",
        title: "Blocked drainage and flooding on Herbert Macaulay Way",
        description:
          "Water is pooling across the roadway after every rainfall because the drain grate along Herbert Macaulay Way is clogged with refuse and sand-filled bags.",
        category: "Water & Utilities",
        subItem: "Blocked drain",
        status: "assigned",
        priority: "critical",
        department: "Public Works",
        assignedOfficer: "Engr. Babatunde Ojo",
        district: "Yaba / Mainland (Lagos)",
        address: "Herbert Macaulay Way, Yaba",
        coordinates: { x: 18, y: 44 },
        photos: [SAMPLE_PHOTOS[2]],
      }),
      mk(50, {
        id: "CR-2025-4688",
        title: "Overflowing refuse dumpster near Wuse 2 Market",
        description:
          "The public waste container beside Wuse 2 Market has been overflowing for three days with bags strewn on the ground. Attracting stray animals and causing foul odour to shoppers.",
        category: "Sanitation & Waste",
        subItem: "Overflowing bin",
        status: "in_progress",
        priority: "medium",
        department: "Sanitation & Waste",
        assignedOfficer: "Mrs. Adeyemi Nwosu",
        district: "Garki / Wuse (Abuja FCT)",
        address: "Wuse 2 Market, Aminu Kano Cres",
        coordinates: { x: 52, y: 38 },
        photos: [SAMPLE_PHOTOS[3]],
      }),
      mk(74, {
        id: "CR-2025-4602",
        title: "Damaged pedestrian walkway and bench at Millennium Park",
        description:
          "The concrete walkway tiles near the playground section of Millennium Park are broken and the wooden bench has splintered slats with a missing armrest.",
        category: "Parks & Trees",
        subItem: "Damaged bench",
        status: "resolved",
        priority: "low",
        department: "Parks & Recreation",
        assignedOfficer: "Mr. Emeka Obi",
        district: "Maitama / Asokoro (Abuja FCT)",
        address: "Millennium Park, Maitama",
        coordinates: { x: 78, y: 70 },
        photos: [SAMPLE_PHOTOS[4]],
        resolutionNotes: "Bench slats replaced and walkway tiles refitted. Verified on site by FCTA parks crew.",
      }),
      mk(120, {
        id: "CR-2025-4501",
        title: "Traffic signal malfunction at Trans-Amadi Roundabout",
        description:
          "The traffic signal at the Trans-Amadi Industrial Layout roundabout is flashing amber continuously during peak hours, causing congestion and near-accidents with heavy-duty trucks.",
        category: "Traffic Signals",
        subItem: "Signal fault",
        status: "resolved",
        priority: "high",
        department: "Transportation & Traffic",
        assignedOfficer: "Insp. Danladi Musa",
        district: "Port Harcourt City (Rivers)",
        address: "Trans-Amadi Roundabout, PH City",
        coordinates: { x: 40, y: 82 },
        photos: [SAMPLE_PHOTOS[5]],
        resolutionNotes: "Controller board swapped and signal timing re-calibrated by Rivers State Traffic Management Agency.",
      }),
    ];

    setReports((prev) => {
      const existing = new Set(prev.map((r) => r.id));
      const toAdd = samples.filter((s) => !existing.has(s.id));
      return [...toAdd, ...prev];
    });
    return samples.length;
  }, []);

  const getReport = useCallback(
    (id: string) =>
      reportsRef.current.find(
        (r) => r.id.toLowerCase() === id.trim().toLowerCase()
      ),
    []
  );

  const value = useMemo<ReportContextValue>(
    () => ({
      reports,
      role,
      setRole,
      activeTrackId,
      setActiveTrackId,
      submitReport,
      updateReportStatus,
      assignReport,
      updatePriority,
      resolveReport,
      deleteReport,
      seedSampleReports,
      clearAllReports,
      getReport,
    }),
    [
      reports,
      role,
      setRole,
      activeTrackId,
      setActiveTrackId,
      submitReport,
      updateReportStatus,
      assignReport,
      updatePriority,
      resolveReport,
      deleteReport,
      seedSampleReports,
      clearAllReports,
      getReport,
    ]
  );

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}

export function useReports(): ReportContextValue {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReports must be used within ReportProvider");
  return ctx;
}