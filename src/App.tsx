import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Building2,
  Database,
  RotateCcw,
  ChevronDown,
  Check,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { ReportProvider, useReports } from "./context/ReportContext";
import CitizenPortal from "./components/CitizenPortal";
import GovernmentPortal from "./components/GovernmentPortal";
import type { PortalRole } from "./types";

const ROLES: { id: PortalRole; label: string; icon: typeof Users }[] = [
  { id: "citizen", label: "Citizen", icon: Users },
  { id: "government", label: "Government", icon: Building2 },
];

function SimulationMenu() {
  const { seedSampleReports, clearAllReports, reports } = useReports();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        <Database className="h-4 w-4" />
        <span className="hidden sm:inline">Simulation</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 z-40 mt-1.5 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {reports.length} report{reports.length === 1 ? "" : "s"} in local store
          </p>
          <button
            onClick={() => {
              const n = seedSampleReports();
              toast.success(`Loaded ${n} demo reports`);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Check className="h-4 w-4 text-emerald-600" /> Seed sample data
          </button>
          <button
            onClick={() => {
              clearAllReports();
              toast.success("All reports cleared");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset / clear all
          </button>
        </motion.div>
      )}
    </div>
  );
}

function Shell() {
  const { role, setRole } = useReports();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight">CivicReport</p>
              <p className="text-[11px] font-medium text-slate-500">
                City Issue &amp; Infrastructure Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-100 p-1">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="role-pill"
                        className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                      />
                    )}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative hidden sm:inline">{r.label}</span>
                  </button>
                );
              })}
            </div>
            <SimulationMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {role === "citizen" ? <CitizenPortal /> : <GovernmentPortal />}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row">
          <p>CivicReport — a demo GovTech incident &amp; complaint management system.</p>
          <p>Data is stored locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ReportProvider>
      <Shell />
      <Toaster position="top-center" richColors closeButton />
    </ReportProvider>
  );
}
