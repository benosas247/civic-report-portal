import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Inbox,
  Wrench,
  CircleCheckBig,
  Hourglass,
  Search,
  Filter,
  MapPin,
  Users,
  ChevronRight,
  Table2,
  PieChart,
  BarChart3,
  X,
} from "lucide-react";
import { useReports } from "../context/ReportContext";
import {
  CATEGORIES,
  CHART_COLORS,
  DEPARTMENTS,
  DISTRICTS,
  PRIORITY_META,
  STATUS_META,
  STATUS_STEPS,
} from "../constants";
import type { Department, Priority, Report, ReportStatus } from "../types";
import { GovDrawer } from "./GovDrawer";

type SortKey = "newest" | "oldest" | "priority";

function ageHours(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3.6e6;
}
function fmtAge(iso: string): string {
  const h = ageHours(iso);
  if (h < 24) return `${Math.max(1, Math.floor(h))}h`;
  return `${Math.floor(h / 24)}d`;
}

/* ---------------- KPI card ---------------- */
function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Inbox;
  label: string;
  value: string | number;
  hint: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

/* ---------------- Donut ---------------- */
function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const seg = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="ml-auto font-semibold text-slate-800">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Horizontal bars ---------------- */
function Bars({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 flex-shrink-0 truncate text-slate-600">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: d.color }}
            />
          </div>
          <span className="w-6 text-right font-semibold text-slate-700">{d.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function GovernmentPortal() {
  const { reports } = useReports();
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState<ReportStatus | "all">("all");
  const [fPriority, setFPriority] = useState<Priority | "all">("all");
  const [fDept, setFDept] = useState<Department | "all">("all");
  const [fDistrict, setFDistrict] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const open = reports.filter((r) => r.status === "submitted" || r.status === "under_review").length;
    const active = reports.filter((r) => r.status === "assigned" || r.status === "in_progress").length;
    const done = reports.filter((r) => r.status === "resolved" || r.status === "closed").length;
    const resolved = reports.filter((r) => r.resolvedAt);
    const avg = resolved.length
      ? resolved.reduce((s, r) => s + ageHours(r.resolvedAt!) - ageHours(r.createdAt), 0) / resolved.length
      : 0;
    return { open, active, done, avg: Math.round(avg) };
  }, [reports]);

  const statusData = useMemo(
    () =>
      (Object.keys(STATUS_META) as ReportStatus[])
        .map((s, i) => ({
          label: STATUS_META[s].label,
          value: reports.filter((r) => r.status === s).length,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }))
        .filter((d) => d.value > 0),
    [reports]
  );

  const catData = useMemo(
    () =>
      CATEGORIES.map((c, i) => ({
        label: c.name,
        value: reports.filter((r) => r.category === c.name).length,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })).filter((d) => d.value > 0),
    [reports]
  );

  const deptData = useMemo(
    () =>
      DEPARTMENTS.map((d, i) => ({
        label: d,
        value: reports.filter((r) => r.department === d).length,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })).filter((d) => d.value > 0),
    [reports]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = reports.filter((r) => {
      if (q && !`${r.id} ${r.title} ${r.description} ${r.subItem}`.toLowerCase().includes(q)) return false;
      if (fStatus !== "all" && r.status !== fStatus) return false;
      if (fPriority !== "all" && r.priority !== fPriority) return false;
      if (fDept !== "all" && r.department !== fDept) return false;
      if (fDistrict !== "all" && r.district !== fDistrict) return false;
      return true;
    });
    out = out.sort((a, b) => {
      if (sort === "priority") return PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank;
      if (sort === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return out;
  }, [reports, search, fStatus, fPriority, fDept, fDistrict, sort]);

  const selected: Report | undefined = selectedId
    ? reports.find((r) => r.id === selectedId) ?? undefined
    : undefined;

  const resetFilters = () => {
    setSearch("");
    setFStatus("all");
    setFPriority("all");
    setFDept("all");
    setFDistrict("all");
  };
  const hasFilters =
    search || fStatus !== "all" || fPriority !== "all" || fDept !== "all" || fDistrict !== "all";

  const sel =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";

  return (
    <div className="mx-auto max-w-7xl">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Inbox} label="Total reports" value={reports.length} hint="All time" tone="bg-blue-50 text-blue-700" />
        <Kpi icon={Hourglass} label="Awaiting triage" value={stats.open} hint="Submitted / review" tone="bg-amber-50 text-amber-700" />
        <Kpi icon={Wrench} label="In progress" value={stats.active} hint="Assigned / active" tone="bg-violet-50 text-violet-700" />
        <Kpi icon={CircleCheckBig} label="Avg resolution" value={stats.avg ? `${stats.avg}h` : "—"} hint={`${stats.done} closed`} tone="bg-emerald-50 text-emerald-700" />
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
            <PieChart className="h-4 w-4 text-slate-400" /> By status
          </h3>
          {statusData.length ? <Donut data={statusData} /> : <p className="text-sm text-slate-400">No data</p>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
            <BarChart3 className="h-4 w-4 text-slate-400" /> By category
          </h3>
          {catData.length ? <Bars data={catData} /> : <p className="text-sm text-slate-400">No data</p>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Users className="h-4 w-4 text-slate-400" /> By department
          </h3>
          {deptData.length ? <Bars data={deptData} /> : <p className="text-sm text-slate-400">No data</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, description…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Filter
          </span>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value as ReportStatus | "all")} className={sel}>
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_META) as ReportStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          <select value={fPriority} onChange={(e) => setFPriority(e.target.value as Priority | "all")} className={sel}>
            <option value="all">All priorities</option>
            {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
              <option key={p} value={p}>{PRIORITY_META[p].label}</option>
            ))}
          </select>
          <select value={fDept} onChange={(e) => setFDept(e.target.value as Department | "all")} className={sel}>
            <option value="all">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={fDistrict} onChange={(e) => setFDistrict(e.target.value)} className={sel}>
            <option value="all">All districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={sel}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
          </select>
          {hasFilters && (
            <button onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Table2 className="h-4 w-4 text-slate-400" /> Reports queue
          </h3>
          <span className="text-xs text-slate-500">{filtered.length} of {reports.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 font-semibold text-slate-700">No matching reports</p>
            <p className="mt-1 text-sm text-slate-500">
              {reports.length === 0 ? "Load the demo dataset from the Simulation menu." : "Adjust your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Report</th>
                  <th className="px-4 py-2.5 font-semibold">Category</th>
                  <th className="px-4 py-2.5 font-semibold">Location</th>
                  <th className="px-4 py-2.5 font-semibold">Priority</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Age</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const cat = CATEGORIES.find((c) => c.name === r.category);
                  const Icon = cat?.icon ?? Inbox;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className="cursor-pointer transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{r.title}</p>
                            <p className="font-mono text-xs text-slate-400">{r.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.category}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" /> {r.district}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${PRIORITY_META[r.priority].chip}`}>
                          {PRIORITY_META[r.priority].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_META[r.status].chip}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[r.status].dot}`} />
                          {STATUS_META[r.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{fmtAge(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GovDrawer report={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
