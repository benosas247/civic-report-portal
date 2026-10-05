import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  MapPin,
  Upload,
  Image as ImageIcon,
  Mail,
  Phone,
  X,
  Sparkles,
  ShieldCheck,
  CircleCheckBig,
} from "lucide-react";
import { toast } from "sonner";
import { useReports } from "../context/ReportContext";
import { CATEGORIES, DISTRICTS, PRIORITY_META, SAMPLE_PHOTOS } from "../constants";
import type { Priority, ReportCategory } from "../types";

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Category", "Details", "Location", "Confirm"] as const;
const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

const emptyForm = {
  category: "" as ReportCategory | "",
  subItem: "",
  title: "",
  description: "",
  priority: "medium" as Priority,
  district: "",
  address: "",
  coordinates: { x: 50, y: 50 },
  photos: [] as string[],
  contactEmail: "",
  contactPhone: "",
  consent: false,
};

const inputCls =
  "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const lblCls = "text-xs font-semibold uppercase tracking-wide text-slate-400";

export function Wizard({ onDone }: { onDone: (id: string) => void }) {
  const { submitReport } = useReports();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState(emptyForm);
  const mapRef = useRef<HTMLDivElement>(null);

  const cat = CATEGORIES.find((c) => c.name === form.category);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.category && !!form.subItem;
    if (step === 1)
      return form.title.trim().length >= 4 && form.description.trim().length >= 10;
    if (step === 2) return !!form.district && form.address.trim().length >= 3;
    return form.consent && /.+@.+\..+/.test(form.contactEmail);
  };

  const handleMap = (e: React.MouseEvent) => {
    const el = mapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    set("coordinates", { x: Math.min(98, Math.max(2, x)), y: Math.min(98, Math.max(2, y)) });
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 4 - form.photos.length)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () =>
          setForm((f) => ({ ...f, photos: [...f.photos, String(reader.result)].slice(0, 4) }));
        reader.readAsDataURL(file);
      });
  };

  const submit = () => {
    if (!cat) return;
    const id = submitReport({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category as ReportCategory,
      subItem: form.subItem,
      priority: form.priority,
      department: cat.defaultDept,
      district: form.district,
      address: form.address.trim(),
      coordinates: form.coordinates,
      photos: form.photos,
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
    });
    toast.success("Report filed", { description: `Reference ${id}` });
    onDone(id);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition ${
                  i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                    ? "bg-slate-900 text-white ring-4 ring-slate-900/10"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-sm font-semibold sm:block ${i <= step ? "text-slate-800" : "text-slate-400"}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 rounded ${i < step ? "bg-emerald-500" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? undefined : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900">What kind of issue is it?</h3>
                <p className="mt-1 text-sm text-slate-500">Pick the closest category to route your report correctly.</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const active = form.category === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => {
                          set("category", c.name);
                          set("subItem", "");
                        }}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                          active ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${active ? "text-blue-700" : "text-slate-500"}`} />
                        <span className="text-xs font-semibold text-slate-700">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                {cat && (
                  <div className="mt-4">
                    <label className={lblCls}>Specific issue</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cat.subItems.map((s) => (
                        <button
                          key={s}
                          onClick={() => set("subItem", s)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition ${
                            form.subItem === s ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Describe the problem</h3>
                  <p className="mt-1 text-sm text-slate-500">A clear title and detail help crews act faster.</p>
                </div>
                <div>
                  <label className={lblCls}>Title</label>
                  <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Deep pothole near Allen Junction, Ikeja" className={inputCls} />
                </div>
                <div>
                  <label className={lblCls}>Description</label>
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="What is wrong, how long has it been an issue, and who does it affect?" className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className={lblCls}>Urgency</label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => set("priority", p)}
                        className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                          form.priority === p ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {PRIORITY_META[p].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Where is it?</h3>
                  <p className="mt-1 text-sm text-slate-500">Tap the map to drop a pin, or type the address.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={lblCls}>District</label>
                    <select value={form.district} onChange={(e) => set("district", e.target.value)} className={`${inputCls} bg-white`}>
                      <option value="">Select district…</option>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lblCls}>Address / landmark</label>
                    <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 14 Broad Street, Marina or near Allen Roundabout" className={inputCls} />
                  </div>
                </div>
                <div ref={mapRef} onClick={handleMap} className="relative h-48 cursor-crosshair overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(0deg,#eef2f7_1px,transparent_1px),linear-gradient(90deg,#eef2f7_1px,transparent_1px)] bg-[size:24px_24px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-emerald-50/40" />
                  <div className="absolute -translate-x-1/2 -translate-y-full transition-all" style={{ left: `${form.coordinates.x}%`, top: `${form.coordinates.y}%` }}>
                    <MapPin className="h-7 w-7 fill-rose-500 text-rose-600 drop-shadow" />
                  </div>
                  <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                    {form.coordinates.x},{form.coordinates.y} · click to reposition
                  </div>
                </div>
                <div>
                  <label className={lblCls}>Photos (optional)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.photos.map((p, i) => (
                      <div key={i} className="group relative">
                        <img src={p} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                        <button
                          onClick={() => set("photos", form.photos.filter((_, j) => j !== i))}
                          className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {form.photos.length < 4 && (
                      <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-blue-400 hover:text-blue-500">
                        <Upload className="h-5 w-5" />
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                      </label>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <Sparkles className="h-3.5 w-3.5" /> Demo photo:
                    {SAMPLE_PHOTOS.slice(0, 3).map((p, i) => (
                      <button key={i} onClick={() => set("photos", [...form.photos, p].slice(0, 4))} className="h-7 w-7 overflow-hidden rounded ring-1 ring-slate-200 hover:ring-blue-400">
                        <img src={p} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Review &amp; confirm</h3>
                  <p className="mt-1 text-sm text-slate-500">Check the details and add contact info for updates.</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    {cat && <cat.icon className="h-4 w-4 text-blue-700" />}
                    <span className="font-semibold text-slate-800">{cat?.name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{form.subItem}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{form.title}</p>
                  <p className="mt-1 text-slate-600">{form.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {form.district} · {form.address}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ring-1 ring-inset ${PRIORITY_META[form.priority].chip}`}>
                      {PRIORITY_META[form.priority].label}
                    </span>
                    {form.photos.length > 0 && (
                      <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> {form.photos.length} photo(s)</span>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={lblCls}>Email</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className={lblCls}>Phone (optional)</label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+1 555 000 0000" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3 text-sm">
                  <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600" />
                  <span className="text-slate-600">I confirm this report is accurate and consent to the city storing these details to resolve the issue.</span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => (step === 0 ? onDone("") : setStep((s) => (s - 1) as Step))}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Cancel" : "Back"}
        </button>
        {step < 3 ? (
          <button
            disabled={!canNext()}
            onClick={() => setStep((s) => (s + 1) as Step)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            disabled={!canNext()}
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShieldCheck className="h-4 w-4" /> Submit report
          </button>
        )}
      </div>
    </div>
  );
}

export function SuccessCard({ id, onTrack, onNew }: { id: string; onTrack: () => void; onNew: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Report ID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed — write it down: " + id);
    }
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50">
        <CircleCheckBig className="h-8 w-8 text-emerald-600" />
      </div>
      <h3 className="mt-4 text-xl font-bold text-slate-900">Report filed successfully</h3>
      <p className="mt-1 text-sm text-slate-500">Save your reference ID to track progress anytime.</p>
      <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
        <span className="font-mono text-lg font-bold text-slate-900">{id}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={onTrack} className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Track this report</button>
        <button onClick={onNew} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">File another</button>
      </div>
    </motion.div>
  );
}