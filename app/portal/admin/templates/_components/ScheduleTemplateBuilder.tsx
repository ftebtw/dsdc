"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileImage, FileText, FolderOpen, Plus, Save, Trash2 } from "lucide-react";
import InstructorsEditor from "./InstructorsEditor";
import RecurrenceEditor from "./RecurrenceEditor";
import SingleClassPoster from "./SingleClassPoster";
import TermOverviewPoster from "./TermOverviewPoster";
import {
  POSTER_DIMENSIONS,
  emptyClassEntry,
  emptyInstructor,
  type BuilderMode,
  type ClassEntry,
  type Instructor,
  type PosterAspect,
} from "./types";

type SavedTemplate = {
  id: string;
  name: string;
  mode: BuilderMode;
  data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

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
    description: "An introduction to competitive debate for new students. Build argumentation, rebuttal, and public speaking confidence.",
    instructors: [{ ...emptyInstructor(), name: "Alex Smith", description: "Canadian National Debate Team coach." }],
  }));
  const [termTitle, setTermTitle] = useState<string>("Spring 2026 Class Schedule");
  const [termSubtitle, setTermSubtitle] = useState<string>("April – June");
  const [termEntries, setTermEntries] = useState<ClassEntry[]>([
    {
      ...emptyClassEntry(),
      title: "Beginner Debate",
      instructors: [{ ...emptyInstructor(), name: "Alex Smith" }],
    },
  ]);
  const [aspect, setAspect] = useState<PosterAspect>(mode === "term" ? "landscape" : "portrait");
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);

  // Saved templates state
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);
  const [loadedTemplateName, setLoadedTemplateName] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const [templatesBusy, setTemplatesBusy] = useState<null | "save" | "update" | "delete">(null);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Fetch saved templates on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portal/schedule-templates");
        const json = (await res.json()) as { templates?: SavedTemplate[]; error?: string };
        if (cancelled) return;
        if (res.ok && json.templates) {
          setSavedTemplates(json.templates);
        }
      } catch (e) {
        if (!cancelled) console.error("Failed to load saved templates", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function serializeCurrent(): { mode: BuilderMode; data: Record<string, unknown> } {
    if (mode === "single") {
      return {
        mode: "single",
        data: { timezone, aspect, entry: singleEntry },
      };
    }
    return {
      mode: "term",
      data: {
        timezone,
        aspect,
        termTitle,
        termSubtitle,
        entries: termEntries,
      },
    };
  }

  function applyTemplate(template: SavedTemplate) {
    setLoadedTemplateId(template.id);
    setLoadedTemplateName(template.name);
    const data = template.data as Record<string, unknown>;
    const tz = typeof data.timezone === "string" ? data.timezone : timezone;
    const tplAspect = (data.aspect as PosterAspect) ?? (template.mode === "term" ? "landscape" : "portrait");
    setTimezone(tz);
    setAspect(tplAspect);
    setMode(template.mode);
    if (template.mode === "single" && data.entry) {
      setSingleEntry(data.entry as ClassEntry);
    } else if (template.mode === "term") {
      if (typeof data.termTitle === "string") setTermTitle(data.termTitle);
      if (typeof data.termSubtitle === "string") setTermSubtitle(data.termSubtitle);
      if (Array.isArray(data.entries)) setTermEntries(data.entries as ClassEntry[]);
    }
    setTemplatesError(null);
  }

  function clearLoadedReference() {
    setLoadedTemplateId(null);
    setLoadedTemplateName("");
  }

  async function saveAsNew(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      setTemplatesError("Template name is required.");
      return;
    }
    setTemplatesBusy("save");
    setTemplatesError(null);
    try {
      const payload = { name: trimmed, ...serializeCurrent() };
      const res = await fetch("/api/portal/schedule-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { template?: SavedTemplate; error?: string };
      if (!res.ok || !json.template) {
        setTemplatesError(json.error || "Failed to save template.");
        return;
      }
      setSavedTemplates((prev) => [json.template!, ...prev]);
      setLoadedTemplateId(json.template.id);
      setLoadedTemplateName(json.template.name);
      setShowNameInput(false);
      setNameInputValue("");
    } catch (e) {
      console.error(e);
      setTemplatesError("Network error. Try again.");
    } finally {
      setTemplatesBusy(null);
    }
  }

  async function updateLoaded() {
    if (!loadedTemplateId) return;
    setTemplatesBusy("update");
    setTemplatesError(null);
    try {
      const payload = serializeCurrent();
      const res = await fetch(`/api/portal/schedule-templates/${loadedTemplateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { template?: SavedTemplate; error?: string };
      if (!res.ok || !json.template) {
        setTemplatesError(json.error || "Failed to update template.");
        return;
      }
      setSavedTemplates((prev) =>
        prev
          .map((t) => (t.id === json.template!.id ? json.template! : t))
          .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
      );
    } catch (e) {
      console.error(e);
      setTemplatesError("Network error. Try again.");
    } finally {
      setTemplatesBusy(null);
    }
  }

  async function deleteLoaded() {
    if (!loadedTemplateId) return;
    if (!confirm(`Delete "${loadedTemplateName}"? This cannot be undone.`)) return;
    setTemplatesBusy("delete");
    setTemplatesError(null);
    try {
      const res = await fetch(`/api/portal/schedule-templates/${loadedTemplateId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setTemplatesError(json.error || "Failed to delete template.");
        return;
      }
      setSavedTemplates((prev) => prev.filter((t) => t.id !== loadedTemplateId));
      clearLoadedReference();
    } catch (e) {
      console.error(e);
      setTemplatesError("Network error. Try again.");
    } finally {
      setTemplatesBusy(null);
    }
  }

  function handleTemplateSelect(id: string) {
    if (!id) {
      clearLoadedReference();
      return;
    }
    const template = savedTemplates.find((t) => t.id === id);
    if (template) applyTemplate(template);
  }

  const previewRef = useRef<HTMLDivElement>(null);
  const previewSlotRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(560);

  useEffect(() => {
    const el = previewSlotRef.current;
    if (!el) return;
    setSlotWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSlotWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const previewScale = useMemo(() => {
    const dims = POSTER_DIMENSIONS[aspect];
    // Fit the poster width to the available container width, but cap so it
    // doesn't get unreasonably large on wide viewports and respect a max height.
    const widthScale = Math.max(0.1, slotWidth) / dims.width;
    const maxHeight = 720;
    const heightScale = maxHeight / dims.height;
    return Math.min(widthScale, heightScale, 0.7);
  }, [aspect, slotWidth]);

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
        <SavedTemplatesPanel
          templates={savedTemplates}
          loadedId={loadedTemplateId}
          loadedName={loadedTemplateName}
          busy={templatesBusy}
          error={templatesError}
          showNameInput={showNameInput}
          nameInputValue={nameInputValue}
          onSelect={handleTemplateSelect}
          onUpdate={updateLoaded}
          onDelete={deleteLoaded}
          onSaveAsNewClick={() => {
            setNameInputValue(loadedTemplateName || "");
            setShowNameInput(true);
            setTemplatesError(null);
          }}
          onSaveAsNewConfirm={() => saveAsNew(nameInputValue)}
          onSaveAsNewCancel={() => {
            setShowNameInput(false);
            setNameInputValue("");
            setTemplatesError(null);
          }}
          onNameInputChange={setNameInputValue}
          onClearLoaded={clearLoadedReference}
        />

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
          <div ref={previewSlotRef} className="w-full" />
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

function SavedTemplatesPanel({
  templates,
  loadedId,
  loadedName,
  busy,
  error,
  showNameInput,
  nameInputValue,
  onSelect,
  onUpdate,
  onDelete,
  onSaveAsNewClick,
  onSaveAsNewConfirm,
  onSaveAsNewCancel,
  onNameInputChange,
  onClearLoaded,
}: {
  templates: SavedTemplate[];
  loadedId: string | null;
  loadedName: string;
  busy: null | "save" | "update" | "delete";
  error: string | null;
  showNameInput: boolean;
  nameInputValue: string;
  onSelect: (id: string) => void;
  onUpdate: () => void;
  onDelete: () => void;
  onSaveAsNewClick: () => void;
  onSaveAsNewConfirm: () => void;
  onSaveAsNewCancel: () => void;
  onNameInputChange: (next: string) => void;
  onClearLoaded: () => void;
}) {
  const loaded = templates.find((t) => t.id === loadedId);
  return (
    <div className="rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white/70 dark:bg-navy-900/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-charcoal/85 dark:text-navy-100/85 flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-charcoal/60 dark:text-navy-200/70" />
          Saved templates
        </div>
        <span className="text-xs text-charcoal/55 dark:text-navy-200/55">
          {templates.length} saved
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={loadedId ?? ""}
          onChange={(e) => onSelect(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white"
        >
          <option value="">— New template (unsaved) —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.mode === "single" ? "Single class" : "Term overview"})
            </option>
          ))}
        </select>

        {loadedId ? (
          <>
            <button
              type="button"
              onClick={onUpdate}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-md bg-navy-800 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-700 disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900 dark:hover:bg-gold-300"
              title="Save changes to this template"
            >
              <Check className="h-3.5 w-3.5" />
              {busy === "update" ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onSaveAsNewClick}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-md border border-warm-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal/85 hover:bg-warm-50 disabled:opacity-60 dark:border-navy-500 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
              title="Save current state as a new template"
            >
              <Save className="h-3.5 w-3.5" />
              Save as new
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-md border border-warm-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal/70 hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-60 dark:border-navy-500 dark:bg-navy-800 dark:text-navy-200 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              title="Delete this template"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {busy === "delete" ? "Deleting..." : "Delete"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onSaveAsNewClick}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-md bg-navy-800 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-700 disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900 dark:hover:bg-gold-300"
          >
            <Save className="h-3.5 w-3.5" />
            Save current as template
          </button>
        )}
      </div>

      {showNameInput ? (
        <div className="space-y-2 rounded-md border border-warm-200 bg-warm-50 p-3 dark:border-navy-600/70 dark:bg-navy-900/60">
          <div className="text-xs font-semibold text-charcoal/75 dark:text-navy-100/75">
            Name this template
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              autoFocus
              value={nameInputValue}
              onChange={(e) => onNameInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveAsNewConfirm();
                if (e.key === "Escape") onSaveAsNewCancel();
              }}
              placeholder="e.g. Beginner Debate – Spring 2026"
              className="flex-1 min-w-[180px] rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white"
            />
            <button
              type="button"
              onClick={onSaveAsNewConfirm}
              disabled={busy !== null || !nameInputValue.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-navy-800 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-700 disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900 dark:hover:bg-gold-300"
            >
              {busy === "save" ? "Saving..." : "Save template"}
            </button>
            <button
              type="button"
              onClick={onSaveAsNewCancel}
              className="rounded-md border border-warm-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal/85 hover:bg-warm-50 dark:border-navy-500 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-700 dark:text-red-400">{error}</p> : null}

      {loaded ? (
        <div className="flex items-center justify-between gap-2 text-xs text-charcoal/60 dark:text-navy-200/60">
          <span>
            Loaded: <strong className="text-charcoal/85 dark:text-navy-100/85">{loaded.name}</strong>{" "}
            · updated {new Date(loaded.updated_at).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={onClearLoaded}
            className="rounded text-xs text-charcoal/55 underline-offset-2 hover:text-charcoal hover:underline dark:text-navy-200/55 dark:hover:text-white"
          >
            Detach
          </button>
        </div>
      ) : null}
    </div>
  );
}

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

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-200/40"
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

      <FieldLabel>Description</FieldLabel>
      <TextArea
        value={entry.description}
        onChange={(t) => onChange({ ...entry, description: t })}
        placeholder="What students will learn, who it's for, etc."
        rows={2}
      />

      <FieldLabel>Time</FieldLabel>
      <div className="flex items-center gap-2">
        <TimeInput value={entry.startTime} onChange={(t) => onChange({ ...entry, startTime: t })} />
        <span className="text-charcoal/60 dark:text-navy-200/60">to</span>
        <TimeInput value={entry.endTime} onChange={(t) => onChange({ ...entry, endTime: t })} />
      </div>

      <FieldLabel>Recurrence</FieldLabel>
      <RecurrenceEditor value={entry.recurrence} onChange={(r) => onChange({ ...entry, recurrence: r })} />

      <InstructorsEditor
        value={entry.instructors}
        onChange={(instructors: Instructor[]) => onChange({ ...entry, instructors })}
      />
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
                  <TextArea
                    value={entry.description}
                    onChange={(t) => onUpdate(entry.id, { description: t })}
                    placeholder="Short description (optional)"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <TimeInput value={entry.startTime} onChange={(t) => onUpdate(entry.id, { startTime: t })} />
                    <span className="text-xs text-charcoal/60 dark:text-navy-200/60">to</span>
                    <TimeInput value={entry.endTime} onChange={(t) => onUpdate(entry.id, { endTime: t })} />
                  </div>
                  <RecurrenceEditor
                    value={entry.recurrence}
                    onChange={(r) => onUpdate(entry.id, { recurrence: r })}
                  />
                  <InstructorsEditor
                    value={entry.instructors}
                    onChange={(instructors: Instructor[]) => onUpdate(entry.id, { instructors })}
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
