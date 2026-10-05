import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  Mail,
  Phone,
  UserCheck,
  ShieldCheck,
  Trash2,
  Clock,
  ImagePlus,
  CircleCheckBig,
  Flag,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useReports } from "../context/ReportContext";
import {
  DEPARTMENTS,
  PRIORITY_META,
  SAMPLE_PHOTOS,
  STAFF,
  STATUS_META,
  STATUS_STEPS,
} from "../constants";
import type {
  Department,
  Priority,
  Report,
  ReportStatus,
  ResolutionEvidence,
} from "../types";

const OPERATOR = "City Operations";
const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

function nextStatuses(current: ReportStatus): ReportStatus[] {
  const idx = STATUS_STEPS.indexOf(current);
  const opts = idx >= 0 ? STATUS_STEPS.slice(idx + 1) : STATUS_STEPS;
  return [...opts, "closed"];
}

function evidenceFor(url: string, caption: string): ResolutionEvidence {
  return { url, caption, uploadedBy: OPERATOR, timestamp: new Date().toISOString() };
}

export function GovDrawer({
  report,
  onClose,
}: {
  report?: Report;
  onClose: () => void;
}) {
  const { updateReportStatus, assignReport, updatePriority, resolveReport, deleteReport } =
    useReports();

  const [dept, setDept] = useState<Department>("Public Works");
  const [officer, setOfficer] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [resNote, setResNote] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);

  if (!report) return null;

  const staffForDept = STAFF.filter((s) => s.department === dept);
  const canAssign = !!officer;
  const canResolve = resNote.trim().length >= 4;

  const doAssign = () => {
    if (!canAssign) return;
    assignReport(report.id, dept, officer, assignNote.trim(), OPERATOR);
    toast.success("Report assigned", { description: `${dept} · ${officer}` });
    setAssignNote("");
  };
  const doStatus = (s: ReportStatus) => {
    updateReportStatus(report.id, s, statusNote.trim(), OPERATOR);
    toast.success(`Status → ${STATUS_META[s].label}`);
    setStatusNote("");
  };
  const doPriority = (p: Priority) => {
    updatePriority(report.id, p, OPERATOR);
    toast.success(`Priority → ${PRIORITY_META[p].label}`);
  };
  const doResolve = () => {
    if (!canResolve) return;
    const ev = evidence.map((u, i) => evidenceFor(u, `Resolution photo ${i + 1}`));
    resolveReport(report.id, resNote.trim(), ev, OPERATOR);
    toast.success("Report resolved", { description: "Citizen can now confirm & close." });
    setResNote("");
    setEvidence([]);
  };
  const doDelete = () => {
    deleteReport(report.id);
    toast.success("Report removed");
    onClose();
  };

  const timeline = [...report.timeline].reverse();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-slate-400">{report.id}</p>
            <h2 className="truncate text-base font-bold text-slate-900">{report.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_META[report.status].chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[report.status].dot}`} />
                {STATUS_META[report.status].label}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${PRIORITY_META[report.priority].chip}`}>
                {PRIORITY_META[report.priority].label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* summary */}
          <section className="space-y-2 text-sm">
            <p className="text-slate-600">{report.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {report.district}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {report.category}</span>
              {report.address && <span className="col-span-2">{report.address}</span>}
              {report.contactEmail && (
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {report.contactEmail}</span>
              )}
              {report.contactPhone && (
                <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {report.contactPhone}</span>
              )}
            </div>
            {report.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-1">
                {report.photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="h-16 w-24 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
                ))}
              </div>
            )}
          </section>

          {/* assign */}
          <section className="rounded-xl border border-slate-200 p-3">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <UserCheck className="h-4 w-4 text-violet-600" /> Assign &amp; route
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select
                value={dept}
                onChange={(e) => {
                  setDept(e.target.value as Department);
                  setOfficer("");
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Officer…</option>
                {staffForDept.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <input
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="Internal note (optional)"
              className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={doAssign}
              disabled={!canAssign}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" /> Assign to {officer || "officer"}
            </button>
            {report.assignedOfficer && (
              <p className="mt-1.5 text-xs text-slate-500">
                Currently: <span className="font-semibold">{report.assignedOfficer}</span> · {report.department}
              </p>
            )}
          </section>

          {/* status */}
          <section className="rounded-xl border border-slate-200 p-3">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Flag className="h-4 w-4 text-blue-600" /> Move status
            </h3>
            <input
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Public status note (optional)"
              className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {nextStatuses(report.status).map((s) => (
                <button
                  key={s}
                  onClick={() => doStatus(s)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition hover:bg-slate-50 ${STATUS_META[s].chip}`}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </section>

          {/* priority */}
          <section className="rounded-xl border border-slate-200 p-3">
            <h3 className="text-sm font-bold text-slate-800">Priority</h3>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => doPriority(p)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
                    report.priority === p
                      ? "bg-slate-900 text-white ring-slate-900"
                      : `${PRIORITY_META[p].chip} hover:bg-slate-50`
                  }`}
                >
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          </section>

          {/* resolve */}
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-emerald-800">
              <CircleCheckBig className="h-4 w-4" /> Resolve &amp; evidence
            </h3>
            <textarea
              value={resNote}
              onChange={(e) => setResNote(e.target.value)}
              rows={2}
              placeholder="Describe the fix completed…"
              className="mt-2 w-full resize-none rounded-lg border border-emerald-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Before / after photos
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SAMPLE_PHOTOS.map((p) => {
                const on = evidence.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() =>
                      setEvidence((prev) =>
                        on ? prev.filter((x) => x !== p) : [...prev, p].slice(0, 4)
                      )
                    }
                    className={`relative h-14 w-14 overflow-hidden rounded-lg ring-2 transition ${
                      on ? "ring-emerald-500" : "ring-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={p} alt="" className="h-full w-full object-cover" />
                    {on && (
                      <span className="absolute inset-0 grid place-items-center bg-emerald-500/30">
                        <CircleCheckBig className="h-5 w-5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
              <span className="grid h-14 w-14 place-items-center rounded-lg border-2 border-dashed border-emerald-200 text-emerald-400">
                <ImagePlus className="h-4 w-4" />
              </span>
            </div>
            <button
              onClick={doResolve}
              disabled={!canResolve}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
            >
              <ShieldCheck className="h-4 w-4" /> Mark resolved
            </button>
          </section>

          {/* timeline */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Activity log
            </h3>
            <ol className="relative space-y-3 pl-5">
              <span className="absolute bottom-1 left-[6px] top-1 w-px bg-slate-200" />
              {timeline.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                  <p className="text-sm font-semibold text-slate-800">{e.label}</p>
                  {e.detail && <p className="text-xs text-slate-500">{e.detail}</p>}
                  <p className="text-[11px] text-slate-400">{e.actor}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* footer */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={doDelete}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" /> Delete report
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
