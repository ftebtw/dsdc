"use client";

import { useMemo, useRef, useState } from 'react';
import type { Database } from '@/lib/supabase/database.types';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';
import {
  getWeekNumber,
  resourceTypeLabel,
  resourceTypeIcon,
  resourceTypePriority,
} from '@/lib/portal/resource-weeks';

type Resource = Database['public']['Tables']['resources']['Row'] & {
  urls?: string[] | null;
};
type ResourceType = Database['public']['Enums']['resource_type'];

function effectiveUrls(resource: { url: string | null; urls?: string[] | null }): string[] {
  const fromArray = (resource.urls ?? []).filter((u): u is string => Boolean(u && u.trim()));
  if (fromArray.length > 0) return fromArray;
  return resource.url ? [resource.url] : [];
}

function shortHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const resourceTypeOptions: ResourceType[] = [
  'lesson_plan',
  'slides',
  'document',
  'recording',
  'other',
];

export default function CoachResourceManager({
  classId,
  initialResources,
  termStartDate,
  initialWeekTitles = {},
}: {
  classId: string;
  initialResources: Resource[];
  termStartDate: string;
  initialWeekTitles?: Record<string, string>;
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [weekTitles, setWeekTitles] = useState<Record<string, string>>(initialWeekTitles);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('lesson_plan');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [urls, setUrls] = useState<string[]>(['']);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editingWeekTitle, setEditingWeekTitle] = useState('');
  const [weekTitleSaving, setWeekTitleSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set());

  const grouped = useMemo(() => {
    const weekMap = new Map<number, Map<string, Resource[]>>();

    for (const resource of resources) {
      const dateStr = resource.session_date || resource.created_at.slice(0, 10);
      const week = getWeekNumber(termStartDate, dateStr);
      if (!weekMap.has(week)) weekMap.set(week, new Map());
      const typeMap = weekMap.get(week)!;
      if (!typeMap.has(resource.type)) typeMap.set(resource.type, []);
      typeMap.get(resource.type)!.push(resource);
    }

    const sorted = [...weekMap.entries()].sort((a, b) => b[0] - a[0]);

    return sorted.map(([week, typeMap]) => {
      const types = [...typeMap.entries()]
        .sort(
          (a, b) =>
            (resourceTypePriority[a[0]] ?? 99) -
            (resourceTypePriority[b[0]] ?? 99)
        )
        .map(([typeName, items]) => ({
          type: typeName,
          resources: items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
        }));
      return { week, types };
    });
  }, [resources, termStartDate]);

  function toggleWeek(week: number) {
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  function clearSelectedFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function beginWeekRename(week: number) {
    setEditingWeek(week);
    setEditingWeekTitle(weekTitles[String(week)] || '');
    setError(null);
  }

  async function saveWeekTitle(week: number) {
    setWeekTitleSaving(true);
    setError(null);

    const trimmed = editingWeekTitle.trim();
    const method = trimmed ? 'POST' : 'DELETE';

    const response = await fetch('/api/portal/resources/week-titles', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId,
        weekNumber: week,
        title: trimmed || undefined,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    setWeekTitleSaving(false);
    if (!response.ok) {
      setError(payload.error || t('portal.coachResource.weekTitleSaveError', 'Could not save week title.'));
      return;
    }

    if (trimmed) {
      setWeekTitles((prev) => ({ ...prev, [String(week)]: trimmed }));
    } else {
      setWeekTitles((prev) => {
        const next = { ...prev };
        delete next[String(week)];
        return next;
      });
    }
    setEditingWeek(null);
    setEditingWeekTitle('');
  }

  function inferredTitleFromForm(): string {
    const trimmedTitle = title.trim();
    if (trimmedTitle) return trimmedTitle;

    const firstLine = description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
    if (firstLine) return firstLine.slice(0, 180);

    if (file?.name) return file.name.trim().slice(0, 180);

    const firstUrl = urls.map((u) => u.trim()).find((u) => u.length > 0);
    if (firstUrl) return firstUrl.slice(0, 180);

    return '';
  }

  function updateUrlAt(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }
  function addUrlRow() {
    setUrls((prev) => (prev.length >= 10 ? prev : [...prev, '']));
  }
  function removeUrlRow(index: number) {
    setUrls((prev) => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== index)));
  }

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = inferredTitleFromForm();
    if (!normalizedTitle) {
      setError(
        t(
          'portal.coachResource.contentRequired',
          'Add a note, link, or file before posting this resource.'
        )
      );
      return;
    }

    setLoading(true);
    setError(null);

    const cleanedUrls = urls.map((u) => u.trim()).filter((u) => u.length > 0);

    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', normalizedTitle);
    if (description.trim()) formData.append('description', description.trim());
    formData.append('type', type);
    formData.append('sessionDate', sessionDate);
    formData.append('publishAt', publishDate);
    for (const u of cleanedUrls) {
      formData.append('urls', u);
    }
    if (file) formData.append('file', file);

    const response = await fetch('/api/portal/resources/upload', {
      method: 'POST',
      body: formData,
    });
    const data = (await response.json()) as {
      error?: string;
      resource?: Resource;
    };

    setLoading(false);

    if (!response.ok || !data.resource) {
      setError(
        data.error ||
          t('portal.coachResource.createError', 'Failed to create resource.')
      );
      return;
    }

    setResources((prev) => [data.resource!, ...prev]);
    setTitle('');
    setDescription('');
    setType('lesson_plan');
    setUrls(['']);
    clearSelectedFile();
  }

  async function onDelete(resourceId: string) {
    const response = await fetch(`/api/portal/resources/${resourceId}`, {
      method: 'DELETE',
    });
    if (!response.ok) return;
    setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
  }

  async function onOpen(resource: Resource, target: 'auto' | 'url' | 'file' = 'auto') {
    if ((target === 'auto' || target === 'url') && resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!resource.file_path) {
      setError(
        t(
          'portal.resourceList.noteOnlyError',
          'This resource is a note only, so there is nothing to open.'
        )
      );
      return;
    }

    const response = await fetch(`/api/portal/resources/${resource.id}/signed-url`);
    const data = (await response.json()) as { error?: string; url?: string };
    if (!response.ok || !data.url) {
      setError(
        data.error ||
          t('portal.resourceList.openError', 'Could not open resource.')
      );
      return;
    }
    window.open(data.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900"
      >
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t('portal.coachResource.addResource', 'Add Resource')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder={t('portal.coachResource.resourceTitle', 'Resource title (optional for note-only posts)')}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value as ResourceType)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          >
            {resourceTypeOptions.map((option) => (
              <option key={option} value={option}>
                {resourceTypeIcon[option]} {resourceTypeLabel[option] || option}
              </option>
            ))}
          </select>
        </div>
        <textarea
          rows={3}
          placeholder={t('portal.coachResource.resourceDescription', 'Text / note (optional)')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
              Session Date (for week grouping)
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(event) => setSessionDate(event.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
              Publish Date
            </label>
            <input
              type="date"
              value={publishDate}
              onChange={(event) => setPublishDate(event.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            />
          </div>
        </div>
        <div className="space-y-2">
          <span className="block text-xs font-medium text-navy-700 dark:text-navy-200">
            {t('portal.coachResource.links', 'Links (optional)')}
          </span>
          {urls.map((u, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={u}
                onChange={(event) => updateUrlAt(index, event.target.value)}
                placeholder={t('portal.coachResource.linkPlaceholder', 'https://...')}
                className="flex-1 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              />
              {urls.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeUrlRow(index)}
                  className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1.5 text-xs text-charcoal/70 dark:text-navy-300 hover:text-red-600 dark:hover:text-red-400"
                  aria-label={t('portal.coachResource.removeLink', 'Remove link')}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
          {urls.length < 10 ? (
            <button
              type="button"
              onClick={addUrlRow}
              className="text-xs font-semibold text-navy-700 hover:text-navy-900 dark:text-gold-300 dark:hover:text-gold-200"
            >
              + {t('portal.coachResource.addLink', 'Add another link')}
            </button>
          ) : null}
        </div>
        <p className="text-xs text-charcoal/60 dark:text-navy-400 -mt-1">
          Set a future publish date to schedule this resource for students and parents.
        </p>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-navy-700 dark:text-navy-200">
            {t('portal.coachResource.fileOptional', 'File (optional)')}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
          />
        </div>
        <p className="text-xs text-charcoal/60 dark:text-navy-400 -mt-1">
          {t(
            'portal.coachResource.fileOrUrl',
            'File and URL are optional. You can post a text-only note with just a title and description.'
          )}
        </p>
        {file ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-charcoal/70 dark:text-navy-300 truncate">
              {t('portal.coachResource.selectedFile', 'Selected file')}: {file.name}
            </span>
            <button
              type="button"
              onClick={clearSelectedFile}
              className="text-blue-600 dark:text-blue-400 underline"
            >
              {t('portal.coachResource.removeFile', 'Remove file')}
            </button>
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="justify-self-start px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
        >
          {loading
            ? t('portal.common.saving', 'Saving...')
            : t('portal.coachResource.postResource', 'Post Resource')}
        </button>
      </form>

      {grouped.length === 0 ? (
        <p className="text-sm text-charcoal/65 dark:text-navy-300">
          {t('portal.coachResource.empty', 'No resources posted for this class yet.')}
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ week, types }) => {
            const isCollapsed = collapsedWeeks.has(week);
            const currentWeekTitle = weekTitles[String(week)]?.trim() || `Week ${week}`;
            return (
              <div
                key={week}
                className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-warm-100 dark:bg-navy-800">
                  <button
                    type="button"
                    onClick={() => toggleWeek(week)}
                    className="flex-1 min-w-0 flex items-center justify-between text-left hover:opacity-90 transition-opacity"
                  >
                    <h3 className="font-semibold text-navy-800 dark:text-white truncate">
                      {currentWeekTitle}
                    </h3>
                    <span className="text-charcoal/50 dark:text-navy-400 text-sm pl-3 shrink-0">
                      {isCollapsed ? '>' : 'v'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => beginWeekRename(week)}
                    className="text-xs text-blue-600 dark:text-blue-400 underline shrink-0"
                  >
                    {t('portal.coachResource.renameWeek', 'Rename')}
                  </button>
                </div>
                {editingWeek === week ? (
                  <div className="px-4 pb-3 bg-warm-100 dark:bg-navy-800 flex flex-wrap items-center gap-2">
                    <input
                      value={editingWeekTitle}
                      onChange={(event) => setEditingWeekTitle(event.target.value)}
                      placeholder={`Week ${week}`}
                      className="flex-1 min-w-[180px] rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      disabled={weekTitleSaving}
                      onClick={() => {
                        void saveWeekTitle(week);
                      }}
                      className="px-3 py-1 rounded-md bg-navy-800 text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {weekTitleSaving
                        ? t('portal.common.saving', 'Saving...')
                        : t('portal.common.save', 'Save')}
                    </button>
                    <button
                      type="button"
                      disabled={weekTitleSaving}
                      onClick={() => {
                        setEditingWeek(null);
                        setEditingWeekTitle('');
                      }}
                      className="px-3 py-1 rounded-md border border-warm-300 dark:border-navy-600 text-xs"
                    >
                      {t('portal.common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={weekTitleSaving}
                      onClick={() => setEditingWeekTitle('')}
                      className="text-xs text-charcoal/70 dark:text-navy-300 underline"
                    >
                      {t('portal.coachResource.resetWeekTitle', 'Reset')}
                    </button>
                  </div>
                ) : null}

                {!isCollapsed ? (
                  <div className="divide-y divide-warm-100 dark:divide-navy-700">
                    {types.map(({ type: typeName, resources: items }) => (
                      <div key={typeName} className="px-4 py-3">
                        <h4 className="text-sm font-medium text-charcoal/70 dark:text-navy-300 mb-2 flex items-center gap-1.5">
                          <span>{resourceTypeIcon[typeName]}</span>
                          {resourceTypeLabel[typeName] || typeName}
                        </h4>
                        <div className="space-y-2 pl-1">
                          {items.map((resource) => {
                            const publishAt = resource.publish_at || resource.created_at;
                            const isScheduled = new Date(publishAt).getTime() > Date.now();
                            const resourceUrls = effectiveUrls(resource);
                            const hasUrl = resourceUrls.length > 0;
                            const hasFile = Boolean(resource.file_path);
                            const hasOpenableTarget = hasUrl || hasFile;
                            return (
                              <div
                                key={resource.id}
                                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-warm-50 dark:hover:bg-navy-800 transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-navy-800 dark:text-white truncate">
                                    {resource.title}
                                  </p>
                                  {isScheduled ? (
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                      Scheduled for{' '}
                                      {new Date(publishAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </p>
                                  ) : null}
                                  {resource.description ? (
                                    <p className="text-xs text-charcoal/65 dark:text-navy-300 mt-0.5 whitespace-pre-wrap break-words">
                                      {resource.description}
                                    </p>
                                  ) : null}
                                  {!hasOpenableTarget ? (
                                    <p className="text-xs text-charcoal/50 dark:text-navy-400 mt-0.5">
                                      {t('portal.resourceList.noteOnly', 'Note only')}
                                    </p>
                                  ) : null}
                                  <p className="text-xs text-charcoal/50 dark:text-navy-400">
                                    Posted{' '}
                                    {new Date(resource.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
                                  {resourceUrls.map((linkUrl, idx) => (
                                    <button
                                      key={`${resource.id}-link-${idx}`}
                                      type="button"
                                      onClick={() => window.open(linkUrl, '_blank', 'noopener,noreferrer')}
                                      title={linkUrl}
                                      className="px-3 py-1 rounded-md border border-warm-300 dark:border-navy-600 text-sm hover:bg-warm-100 dark:hover:bg-navy-700"
                                    >
                                      {resourceUrls.length === 1
                                        ? t('portal.resourceList.openLink', 'Open link')
                                        : `${t('portal.resourceList.link', 'Link')} ${idx + 1}`}
                                      <span className="ml-1 text-charcoal/55 dark:text-navy-400">({shortHost(linkUrl)})</span>
                                    </button>
                                  ))}
                                  {hasFile ? (
                                    <button
                                      type="button"
                                      onClick={() => onOpen(resource, 'file')}
                                      className="px-3 py-1 rounded-md border border-warm-300 dark:border-navy-600 text-sm hover:bg-warm-100 dark:hover:bg-navy-700"
                                    >
                                      {t('portal.resourceList.openFile', 'Open file')}
                                    </button>
                                  ) : null}
                                  <button
                                    onClick={() => onDelete(resource.id)}
                                    className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
