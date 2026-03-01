"use client";

import { useMemo, useState } from 'react';
import type { Database } from '@/lib/supabase/database.types';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';
import {
  getWeekNumber,
  resourceTypeLabel,
  resourceTypeIcon,
  resourceTypePriority,
} from '@/lib/portal/resource-weeks';

type Resource = Database['public']['Tables']['resources']['Row'];
type ResourceType = Database['public']['Enums']['resource_type'];

const resourceTypeOptions: ResourceType[] = [
  'homework',
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
}: {
  classId: string;
  initialResources: Resource[];
  termStartDate: string;
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('homework');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
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

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', title);
    formData.append('type', type);
    formData.append('sessionDate', sessionDate);
    if (url.trim()) formData.append('url', url.trim());
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
    setType('homework');
    setUrl('');
    setFile(null);
  }

  async function onDelete(resourceId: string) {
    const response = await fetch(`/api/portal/resources/${resourceId}`, {
      method: 'DELETE',
    });
    if (!response.ok) return;
    setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
  }

  async function onOpen(resource: Resource) {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
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
            required
            placeholder={t('portal.coachResource.resourceTitle', 'Resource title')}
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
          <input
            placeholder={t('portal.coachResource.externalUrl', 'External URL (optional)')}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 self-end"
          />
        </div>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
        />
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
            return (
              <div
                key={week}
                className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleWeek(week)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-warm-100 dark:bg-navy-800 hover:bg-warm-200 dark:hover:bg-navy-700 transition-colors"
                >
                  <h3 className="font-semibold text-navy-800 dark:text-white">Week {week}</h3>
                  <span className="text-charcoal/50 dark:text-navy-400 text-sm">
                    {isCollapsed ? '>' : 'v'}
                  </span>
                </button>

                {!isCollapsed ? (
                  <div className="divide-y divide-warm-100 dark:divide-navy-700">
                    {types.map(({ type: typeName, resources: items }) => (
                      <div key={typeName} className="px-4 py-3">
                        <h4 className="text-sm font-medium text-charcoal/70 dark:text-navy-300 mb-2 flex items-center gap-1.5">
                          <span>{resourceTypeIcon[typeName]}</span>
                          {resourceTypeLabel[typeName] || typeName}
                        </h4>
                        <div className="space-y-2 pl-1">
                          {items.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-warm-50 dark:hover:bg-navy-800 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-navy-800 dark:text-white truncate">
                                  {resource.title}
                                </p>
                                <p className="text-xs text-charcoal/50 dark:text-navy-400">
                                  Posted{' '}
                                  {new Date(resource.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => onOpen(resource)}
                                  className="px-3 py-1 rounded-md border border-warm-300 dark:border-navy-600 text-sm hover:bg-warm-100 dark:hover:bg-navy-700"
                                >
                                  Open
                                </button>
                                <button
                                  onClick={() => onDelete(resource.id)}
                                  className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
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
