import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Search,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  TriangleAlert,
  User,
  ChevronRight,
  History,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useReports } from "../context/ReportContext";
import {
  CATEGORIES,
  PRIORITY_META,
  STATUS_STEPS,
  STATUS_META,
} from "../constants";
import type { Report } from "../types";
import { Wizard, SuccessCard } from "./CitizenWizard";

type View = "home" | "file" | "track";

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

/* ---------------- Status stepper ---------------- */
function StatusStepper({ report }: { report: Report }) {
  const currentIdx =
    report.status === "closed"
      ? STATUS_STEPS.length
      : STATUS_STEPS.indexOf(report.status);
  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= currentIdx;
        const meta = STATUS_META[s];
        return (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ring-2 transition ${
                  done
                    ? "bg-emerald-500 text-white ring-emerald-500"
                    : "bg-white text-slate-400 ring-slate-200"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  done ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {meta.short}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded ${
                  i < currentIdx ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Timeline ---------------- */
function Timeline({ report }: { report: Report }) {
  const events = [...report.timeline].reverse();
  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute bottom-1 left-[7px] top-1 w-px bg-slate-200" />
      {events.map((e, i) => (
        <motion.li
          key={e.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="relative"
        >
          <span
            className={`absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
              e.kind === "resolution"
                ? "bg-emerald-500"
                : e.kind === "assignment"
                ? "bg-violet-500"
                : "bg-blue-500"
            }`}
          />
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">{e.label}</p>
            <span className="text-[11px] text-slate-400">
              {timeAgo(e.timestamp)}
            </span>
          </div>
          {e.detail && (
            <p className="mt-0.5 text-sm text-slate-500">{e.detail}</p>
          )}
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {e.actor}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}

/* ---------------- Report detail card ---------------- */
function ReportDetail({ report }: { report: Report }) {
  const cat = CATEGORIES.find((c) => c.name === report.category);
  const Icon = cat?.icon ?? FileText;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-slate-500">
              {report.id}
            </p>
            <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_META[report.status].chip}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${STATUS_META[report.status].dot}`}
          />
          {STATUS_META[report.status].label}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <StatusStepper report={report} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-[11px] font-semibold uppercase text-slate-400">
            Priority
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${PRIORITY_META[report.priority].chip}`}
          >
            {PRIORITY_META[report.priority].label}
          </span>
        </div>
        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-[11px] font-semibold uppercase text-slate-400">
            District
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {report.district}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-[11px] font-semibold uppercase text-slate-400">
            Filed
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {timeAgo(report.createdAt)}
          </p>
        </div>
      </div>

      {report.address && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 text-slate-400" /> {report.address}
        </div>
      )}

      {report.photos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {report.photos.map((p, i) => (
            <img
              key={i}
              src={p}
              alt={`${report.title} ${i + 1}`}
              className="h-20 w-28 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
            />
          ))}
        </div>
      )}

      {report.resolutionNotes && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Resolution notes
          </p>
          <p className="mt-1 text-sm text-emerald-900">
            {report.resolutionNotes}
          </p>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Activity log
        </p>
        <Timeline report={report} />
      </div>
    </motion.div>
  );
}

/* ---------------- Track view ---------------- */
function TrackView() {
  const { activeTrackId, setActiveTrackId, getReport } = useReports();
  const [query, setQuery] = useState(activeTrackId);
  const [searched, setSearched] = useState(!!activeTrackId);
  const report = useMemo(
    () => (query.trim() ? getReport(query) : undefined),
    [query, getReport]
  );

  const doSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearched(true);
    if (report) setActiveTrackId(report.id);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={doSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearched(false);
            }}
            placeholder="Enter your Report ID (e.g. CR-2025-4812)"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Track
        </button>
      </form>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {report ? (
            <motion.div key={report.id} exit={{ opacity: 0 }}>
              <ReportDetail report={report} />
            </motion.div>
          ) : searched && query.trim() ? (
            <motion.div
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"
            >
              <TriangleAlert className="mx-auto h-8 w-8 text-amber-500" />
              <p className="mt-3 font-semibold text-slate-800">No report found</p>
              <p className="mt-1 text-sm text-slate-500">
                Check the Report ID and try again. IDs look like{" "}
                <span className="font-mono">CR-2025-1234</span>.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-slate-200 bg-white p-10 text-center"
            >
              <History className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">Track a report</p>
              <p className="mt-1 text-sm text-slate-500">
                Paste the Report ID from your confirmation to follow every update.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Home / shell ---------------- */
export default function CitizenPortal() {
  const { reports, setActiveTrackId } = useReports();
  const [view, setView] = useState<View>("home");
  const [successId, setSuccessId] = useState<string | null>(null);

  const recent = useMemo(
    () =>
      [...reports]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [reports]
  );

  const openTrack = (id: string) => {
    setActiveTrackId(id);
    setView("track");
  };

  if (successId) {
    return (
      <div className="py-10">
        <SuccessCard
          id={successId}
          onTrack={() => {
            openTrack(successId);
            setSuccessId(null);
          }}
          onNew={() => {
            setSuccessId(null);
            setView("file");
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {view === "home" && (
        <div className="mx-auto max-w-5xl">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-16">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5" /> Trusted by{" "}
                {reports.length + 1240} residents
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Report a civic issue. Track it to resolution.
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
                Potholes, broken lights, blocked drains and more — send a report
                with photos and location, and follow every update from the city.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setView("file")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
                >
                  <FileText className="h-4 w-4" /> File a new report
                </button>
                <button
                  onClick={() => setView("track")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/15"
                >
                  <Search className="h-4 w-4" /> Track existing report
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setView("file")}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Report an issue</h3>
                  <p className="text-sm text-slate-500">
                    4 quick steps with photos &amp; map pin
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </div>
            </button>
            <button
              onClick={() => setView("track")}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Search className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Track a report</h3>
                  <p className="text-sm text-slate-500">
                    Follow status with your Report ID
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
              </div>
            </button>
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Recent submissions
              </h2>
              <span className="text-sm text-slate-500">
                {reports.length} total
              </span>
            </div>
            {recent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <User className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 font-semibold text-slate-700">No reports yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  File your first report or load the demo dataset from the
                  Simulation menu.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {recent.map((r) => {
                  const cat = CATEGORIES.find((c) => c.name === r.category);
                  const Icon = cat?.icon ?? FileText;
                  return (
                    <button
                      key={r.id}
                      onClick={() => openTrack(r.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {r.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          <span className="font-mono">{r.id}</span> · {r.district}{" "}
                          · <Clock className="inline h-3 w-3" />{" "}
                          {timeAgo(r.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset sm:inline-flex ${STATUS_META[r.status].chip}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_META[r.status].dot}`}
                        />
                        {STATUS_META[r.status].label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {view === "file" && (
        <div className="py-4">
          <button
            onClick={() => setView("home")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </button>
          <Wizard onDone={(id) => (id ? setSuccessId(id) : setView("home"))} />
        </div>
      )}

      {view === "track" && (
        <div className="py-4">
          <button
            onClick={() => setView("home")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </button>
          <TrackView />
        </div>
      )}
    </div>
  );
}
