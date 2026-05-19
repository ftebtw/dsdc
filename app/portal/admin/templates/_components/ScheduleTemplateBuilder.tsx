"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileImage, FileText, Plus, Trash2 } from "lucide-react";
import RecurrenceEditor from "./RecurrenceEditor";
import SingleClassPoster from "./SingleClassPoster";
import TermOverviewPoster from "./TermOverviewPoster";
import {
  POSTER_DIMENSIONS,
  emptyClassEntry,
  type BuilderMode,
  type ClassEntry,
  type PosterAspect,
} from "./types";

export default function ScheduleTemplateBuilder({
  defaultTimezone,
}: {
  defaultTimezone: string;
}) {
  const [mode, setMode] = useState<BuilderMode>("single");
  const [timezone, setTimezone] = useState<string>(defaultTimezone);
  const [singleEntry, setSingleEntry] = useState<ClassEntry>(() => ({
    ...emptyClassEntry(),
    title: "Beginner Debate",
    coach: "Alex",
  }));
  const [termTitle, setTermTitle] = useState<string>("Spring 2026 Class Schedule");
  const [termSubtitle, setTermSubtitle] = useState<string>("April – June");
  const [termEntries, setTermEntries] = useState<ClassEntry[]>([
    { ...emptyClassEntry(), title: "Beginner Debate", coach: "Alex" },
  ]);
  const [aspect, setAspect] = useState<PosterAspect>(mode === "term" ? "landscape" : "portrait");
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const previewScale = useMemo(() => {
    const target = 560;
    const dims = POSTER_DIMENSIONS[aspect];
    const maxDim = Math.max(dims.width, dims.height);
    return target / maxDim;
  }, [aspect]);

  function changeMode(next: BuilderMode) {
    setMode(next);
    setAspect(next === "term" ? "landscape" : "portrait");
  }

  function addTermEntry() {
    setTermEntries((prev) => [...prev, emptyClassEntry()]);
  }

  function removeTermEntry(id: string) {
    setTermEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function updateTermEntry(id: string, patch: Partial<ClassEntry>) {
    setTermEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function filenameBase(): string {
    if (mode === "single") {
      const slug = (singleEntry.title || "DSDC-Schedule").trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
      return slug || "DSDC-Schedule";
    }
    const slug = (termTitle || "DSDC-Schedule").trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
    return slug || "DSDC-Schedule";
  }

  async function exportPng() {
    if (!previewRef.current) return;
    setBusy("png");
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      triggerDownload(dataUrl, `${filenameBase()}.png`);
    } catch (err) {
      console.error("PNG export failed", err);
      alert("PNG export failed. Check console for details.");
    } finally {
      setBusy(null);
    }
  }

  async function exportPdf() {
    if (!previewRef.current) return;
    setBusy("pdf");
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const dims = POSTER_DIMENSIONS[aspect];
      const pdf = new jsPDF({
        orientation: dims.width > dims.height ? "landscape" : "portrait",
        unit: "px",
        format: [dims.width, dims.height],
        hotfixes: ["px_scaling"],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, dims.width, dims.height);
      pdf.save(`${filenameBase()}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
      alert("PDF export failed. Check console for details.");
    } finally {
      setBusy(null);
    }
  }

  function triggerDownload(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="flex gap-2 rounded-xl bg-warm-100 p-1 dark:bg-navy-900/60">
          <button
            type="button"
            onClick={() => changeMode("single")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "single"
                ? "bg-white text-navy-900 shadow-sm dark:bg-navy-800 dark:text-white"
                : "text-charcoal/70 hover:text-charcoal dark:text-navy-200/70"
            }`}
          >
            Single Class Poster
          </button>
          <button
            type="button"
            onClick={() => changeMode("term")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "term"
                ? "bg-white text-navy-900 shadow-sm dark:bg-navy-800 dark:text-white"
                : "text-charcoal/70 hover:text-charcoal dark:text-navy-200/70"
            }`}
          >
            Term Overview
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white/70 dark:bg-navy-900/40 p-4">
          <FieldLabel>Time zone</FieldLabel>
          <TimezoneSelect value={timezone} onChange={setTimezone} />

          <FieldLabel>Aspect ratio</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(POSTER_DIMENSIONS) as PosterAspect[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAspect(a)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  aspect === a
                    ? "border-navy-800 bg-navy-800 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-navy-900"
                    : "border-warm-300 bg-white text-charcoal/70 hover:border-navy-400 dark:border-navy-500 dark:bg-navy-800 dark:text-navy-100/70"
                }`}
              >
                {POSTER_DIMENSIONS[a].label}
              </button>
            ))}
          </div>
        </div>

        {mode === "single" ? (
          <SingleClassForm entry={singleEntry} onChange={setSingleEntry} />
        ) : (
          <TermForm
            title={termTitle}
            subtitle={termSubtitle}
            entries={termEntries}
            onTitleChange={setTermTitle}
            onSubtitleChange={setTermSubtitle}
            onAdd={addTermEntry}
            onRemove={removeTermEntry}
            onUpdate={updateTermEntry}
          />
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={exportPng}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-700 disabled:opacity-50 dark:bg-gold-400 dark:text-navy-900 dark:hover:bg-gold-300"
          >
            <FileImage className="h-4 w-4" />
            {busy === "png" ? "Generating..." : "Download PNG"}
          </button>
          <button
            type="button"
            onClick={exportPdf}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-navy-800 bg-white px-4 py-2.5 text-sm font-semibold text-navy-800 shadow-sm transition-colors hover:bg-navy-50 disabled:opacity-50 dark:border-gold-400 dark:bg-transparent dark:text-gold-300 dark:hover:bg-gold-400/10"
          >
            <FileText className="h-4 w-4" />
            {busy === "pdf" ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-wide text-charcoal/60 dark:text-navy-200/70">
            Live preview
          </div>
          <div className="text-xs text-charcoal/50 dark:text-navy-200/50">
            {POSTER_DIMENSIONS[aspect].width} × {POSTER_DIMENSIONS[aspect].height}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-warm-200 bg-warm-50 dark:border-navy-600/70 dark:bg-navy-900/40 p-4">
          <div
            className="mx-auto origin-top-left"
            style={{
              width: POSTER_DIMENSIONS[aspect].width * previewScale,
              height: POSTER_DIMENSIONS[aspect].height * previewScale,
            }}
          >
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
                width: POSTER_DIMENSIONS[aspect].width,
                height: POSTER_DIMENSIONS[aspect].height,
              }}
            >
              <div ref={previewRef}>
                {mode === "single" ? (
                  <SingleClassPoster entry={singleEntry} timezone={timezone} aspect={aspect} />
                ) : (
                  <TermOverviewPoster
                    title={termTitle}
                    subtitle={termSubtitle}
                    entries={termEntries}
                    timezone={timezone}
                    aspect={aspect}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal/55 dark:text-navy-200/60">
          <Download className="h-3.5 w-3.5" />
          Exports render at 2× pixel density for crisp output.
        </div>
      </div>
    </div>
  );
}

const TIMEZONES: { value: string; label: string }[] = [
  { value: "America/Vancouver", label: "Pacific - Vancouver (PT)" },
  { value: "America/Los_Angeles", label: "Pacific - Los Angeles (PT)" },
  { value: "America/Edmonton", label: "Mountain - Edmonton (MT)" },
  { value: "America/Denver", label: "Mountain - Denver (MT)" },
  { value: "America/Winnipeg", label: "Central - Winnipeg (CT)" },
  { value: "America/Chicago", label: "Central - Chicago (CT)" },
  { value: "America/Toronto", label: "Eastern - Toronto (ET)" },
  { value: "America/New_York", label: "Eastern - New York (ET)" },
  { value: "America/Halifax", label: "Atlantic - Halifax (AT)" },
  { value: "America/St_Johns", label: "Newfoundland - St. John's (NT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Asia/Shanghai", label: "Shanghai / Beijing (CST)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
];

function TimezoneSelect({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white"
    >
      {TIMEZONES.map((tz) => (
        <option key={tz.value} value={tz.value}>
          {tz.label}
        </option>
      ))}
    </select>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-semibold text-charcoal/85 dark:text-navy-100/85">{children}</div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-200/40"
    />
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white"
    />
  );
}

function SingleClassForm({ entry, onChange }: { entry: ClassEntry; onChange: (next: ClassEntry) => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white/70 dark:bg-navy-900/40 p-4">
      <FieldLabel>Class title</FieldLabel>
      <TextInput value={entry.title} onChange={(t) => onChange({ ...entry, title: t })} placeholder="e.g. Beginner Debate" />

      <FieldLabel>Time</FieldLabel>
      <div className="flex items-center gap-2">
        <TimeInput value={entry.startTime} onChange={(t) => onChange({ ...entry, startTime: t })} />
        <span className="text-charcoal/60 dark:text-navy-200/60">to</span>
        <TimeInput value={entry.endTime} onChange={(t) => onChange({ ...entry, endTime: t })} />
      </div>

      <FieldLabel>Coach</FieldLabel>
      <TextInput value={entry.coach} onChange={(t) => onChange({ ...entry, coach: t })} placeholder="e.g. Alex" />

      <FieldLabel>Recurrence</FieldLabel>
      <RecurrenceEditor value={entry.recurrence} onChange={(r) => onChange({ ...entry, recurrence: r })} />
    </div>
  );
}

function TermForm({
  title,
  subtitle,
  entries,
  onTitleChange,
  onSubtitleChange,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  entries: ClassEntry[];
  onTitleChange: (next: string) => void;
  onSubtitleChange: (next: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ClassEntry>) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white/70 dark:bg-navy-900/40 p-4">
      <FieldLabel>Schedule title</FieldLabel>
      <TextInput value={title} onChange={onTitleChange} placeholder="e.g. Spring 2026 Class Schedule" />

      <FieldLabel>Subtitle (optional)</FieldLabel>
      <TextInput value={subtitle} onChange={onSubtitleChange} placeholder="e.g. April – June" />

      <div className="border-t border-warm-200 dark:border-navy-600/70 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <FieldLabel>Classes</FieldLabel>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-md bg-navy-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-navy-700 dark:bg-gold-400 dark:text-navy-900 dark:hover:bg-gold-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Add class
          </button>
        </div>

        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-warm-300 dark:border-navy-500 p-4 text-center text-sm text-charcoal/60 dark:text-navy-200/60">
              No classes yet. Click "Add class" to start.
            </div>
          ) : (
            entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50 dark:bg-navy-900/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/55 dark:text-navy-200/70">
                    Class {idx + 1}
                  </div>
                  {entries.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => onRemove(entry.id)}
                      className="inline-flex items-center gap-1 rounded text-xs text-charcoal/60 hover:text-red-600 dark:text-navy-200/60 dark:hover:text-red-400"
                      aria-label="Remove class"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <TextInput
                    value={entry.title}
                    onChange={(t) => onUpdate(entry.id, { title: t })}
                    placeholder="Class title"
                  />
                  <div className="flex items-center gap-2">
                    <TimeInput value={entry.startTime} onChange={(t) => onUpdate(entry.id, { startTime: t })} />
                    <span className="text-xs text-charcoal/60 dark:text-navy-200/60">to</span>
                    <TimeInput value={entry.endTime} onChange={(t) => onUpdate(entry.id, { endTime: t })} />
                  </div>
                  <TextInput
                    value={entry.coach}
                    onChange={(t) => onUpdate(entry.id, { coach: t })}
                    placeholder="Coach name"
                  />
                  <RecurrenceEditor
                    value={entry.recurrence}
                    onChange={(r) => onUpdate(entry.id, { recurrence: r })}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
