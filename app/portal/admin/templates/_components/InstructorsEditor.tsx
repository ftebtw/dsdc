"use client";

import { Plus, Trash2, Upload, X } from "lucide-react";
import { emptyInstructor, readFileAsDataUrl, type Instructor } from "./types";

export default function InstructorsEditor({
  value,
  onChange,
}: {
  value: Instructor[];
  onChange: (next: Instructor[]) => void;
}) {
  function add() {
    onChange([...value, emptyInstructor()]);
  }
  function remove(id: string) {
    onChange(value.filter((i) => i.id !== id));
  }
  function update(id: string, patch: Partial<Instructor>) {
    onChange(value.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  async function handlePhoto(id: string, file: File | null) {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    update(id, { photoDataUrl: dataUrl });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-charcoal/85 dark:text-navy-100/85">
          Instructors
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md bg-navy-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-navy-700 dark:bg-gold-400 dark:text-navy-900 dark:hover:bg-gold-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Add instructor
        </button>
      </div>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed border-warm-300 dark:border-navy-500 p-4 text-center text-sm text-charcoal/60 dark:text-navy-200/60">
          No instructors yet.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((instructor, idx) => (
            <div
              key={instructor.id}
              className="rounded-lg border border-warm-200 dark:border-navy-600/70 bg-white dark:bg-navy-900/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-charcoal/55 dark:text-navy-200/70">
                  Instructor {idx + 1}
                </div>
                {value.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(instructor.id)}
                    className="inline-flex items-center gap-1 rounded text-xs text-charcoal/60 hover:text-red-600 dark:text-navy-200/60 dark:hover:text-red-400"
                    aria-label="Remove instructor"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="flex gap-3">
                <div className="shrink-0">
                  <PhotoSlot
                    photoDataUrl={instructor.photoDataUrl}
                    onPick={(file) => handlePhoto(instructor.id, file)}
                    onClear={() => update(instructor.id, { photoDataUrl: "" })}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={instructor.name}
                    onChange={(e) => update(instructor.id, { name: e.target.value })}
                    placeholder="Name (e.g. Alex Smith)"
                    className="w-full rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-200/40"
                  />
                  <textarea
                    value={instructor.description}
                    onChange={(e) => update(instructor.id, { description: e.target.value })}
                    placeholder="Short bio (e.g. Canadian National Debate Team coach...)"
                    rows={2}
                    className="w-full resize-none rounded-md border border-warm-300 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-navy-500 focus:outline-none dark:border-navy-500 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-200/40"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoSlot({
  photoDataUrl,
  onPick,
  onClear,
}: {
  photoDataUrl: string;
  onPick: (file: File | null) => void;
  onClear: () => void;
}) {
  if (photoDataUrl) {
    return (
      <div className="relative h-20 w-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoDataUrl}
          alt="Instructor headshot"
          className="h-20 w-20 rounded-full object-cover ring-2 ring-warm-300 dark:ring-navy-600"
        />
        <button
          type="button"
          onClick={onClear}
          className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-charcoal shadow-sm ring-1 ring-warm-300 hover:bg-red-50 hover:text-red-600 dark:bg-navy-700 dark:text-white dark:ring-navy-500"
          aria-label="Remove photo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
  return (
    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-warm-300 bg-warm-50 text-center text-[10px] font-semibold uppercase tracking-wide text-charcoal/55 transition-colors hover:border-navy-400 hover:bg-warm-100 dark:border-navy-500 dark:bg-navy-900/60 dark:text-navy-200/65 dark:hover:border-gold-400">
      <Upload className="mb-0.5 h-4 w-4" />
      Photo
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
