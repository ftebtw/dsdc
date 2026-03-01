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

type Resource = Database['public']['Tables']['resources']['Row'] & {
  className?: string | null;
};

type Props = {
  resources: Resource[];
  termStartDate?: string;
  showDelete?: boolean;
  onDelete?: (resourceId: string) => Promise<void>;
  labels?: {
    open?: string;
    delete?: string;
    empty?: string;
  };
};

export default function ResourceList({
  resources,
  termStartDate,
  showDelete = false,
  onDelete,
  labels,
}: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [error, setError] = useState<string | null>(null);
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set());
  const hasWeeks = Boolean(termStartDate);

  const grouped = useMemo(() => {
    if (!hasWeeks) return null;

    const weekMap = new Map<number, Map<string, Resource[]>>();

    for (const resource of resources) {
      const dateStr = resource.session_date || resource.created_at.slice(0, 10);
      const week = getWeekNumber(termStartDate!, dateStr);
      if (!weekMap.has(week)) weekMap.set(week, new Map());
      const typeMap = weekMap.get(week)!;
      if (!typeMap.has(resource.type)) typeMap.set(resource.type, []);
      typeMap.get(resource.type)!.push(resource);
    }

    return [...weekMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([week, typeMap]) => ({
        week,
        types: [...typeMap.entries()]
          .sort(
            (a, b) =>
              (resourceTypePriority[a[0]] ?? 99) -
              (resourceTypePriority[b[0]] ?? 99)
          )
          .map(([typeName, items]) => ({
            type: typeName,
            resources: items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
          })),
      }));
  }, [resources, termStartDate, hasWeeks]);

  function toggleWeek(week: number) {
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  async function openResource(resource: Resource) {
    setError(null);
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    const response = await fetch(`/api/portal/resources/${resource.id}/signed-url`);
    const data = (await response.json()) as { error?: string; url?: string };
    if (!response.ok || !data.url) {
      setError(data.error || t('portal.resourceList.openError', 'Could not open resource.'));
      return;
    }
    window.open(data.url, '_blank', 'noopener,noreferrer');
  }

  if (resources.length === 0) {
    return (
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        {labels?.empty || t('portal.resourceList.empty', 'No resources available.')}
      </p>
    );
  }

  if (grouped) {
    return (
      <div className="space-y-4">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
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
                                {resource.className ? `${resource.className} - ` : ''}
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
                                onClick={() => openResource(resource)}
                                className="px-3 py-1 rounded-md border border-warm-300 dark:border-navy-600 text-sm hover:bg-warm-100 dark:hover:bg-navy-700"
                              >
                                {labels?.open || t('portal.resourceList.open', 'Open')}
                              </button>
                              {showDelete && onDelete ? (
                                <button
                                  onClick={() => onDelete(resource.id)}
                                  className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
                                >
                                  {labels?.delete || t('portal.resourceList.delete', 'Delete')}
                                </button>
                              ) : null}
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
    );
  }

  const sorted = [...resources].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {sorted.map((resource) => (
        <article
          key={resource.id}
          className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-navy-800 dark:text-white">{resource.title}</p>
              <p className="text-xs text-charcoal/65 dark:text-navy-300">
                {resource.className ? `${resource.className} - ` : ''}
                {resource.type.replace('_', ' ')} - {new Date(resource.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openResource(resource)}
                className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
              >
                {labels?.open || t('portal.resourceList.open', 'Open')}
              </button>
              {showDelete && onDelete ? (
                <button
                  onClick={() => onDelete(resource.id)}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                >
                  {labels?.delete || t('portal.resourceList.delete', 'Delete')}
                </button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
