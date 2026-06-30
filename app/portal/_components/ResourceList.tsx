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
  urls?: string[] | null;
};

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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const hasWeeks = Boolean(termStartDate);

  type Group = {
    key: string;
    label: string;
    sortDate: string;
    types: Array<{ type: string; resources: Resource[] }>;
  };

  const grouped = useMemo<Group[] | null>(() => {
    if (!hasWeeks) return null;
    type Bucket = {
      key: string;
      label: string;
      sortDate: string;
      typeMap: Map<string, Resource[]>;
    };
    const buckets = new Map<string, Bucket>();

    for (const resource of resources) {
      const dateStr = resource.session_date || resource.created_at.slice(0, 10);
      const sectionName = (resource as { section?: string | null }).section?.trim();
      const week = sectionName ? null : getWeekNumber(termStartDate!, dateStr);
      const key = sectionName ? `section:${sectionName}` : `week:${week}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          key,
          label: sectionName ? sectionName : `Week ${week}`,
          sortDate: dateStr,
          typeMap: new Map(),
        };
        buckets.set(key, bucket);
      }
      if (dateStr > bucket.sortDate) bucket.sortDate = dateStr;
      if (!bucket.typeMap.has(resource.type)) bucket.typeMap.set(resource.type, []);
      bucket.typeMap.get(resource.type)!.push(resource);
    }

    return [...buckets.values()]
      .sort((a, b) => {
        if (a.sortDate !== b.sortDate) return a.sortDate < b.sortDate ? 1 : -1;
        return a.key < b.key ? 1 : -1;
      })
      .map((bucket) => ({
        key: bucket.key,
        label: bucket.label,
        sortDate: bucket.sortDate,
        types: [...bucket.typeMap.entries()]
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

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function openResource(resource: Resource, target: 'auto' | 'url' | 'file' = 'auto') {
    setError(null);
    if (target === 'auto' || target === 'url') {
      const firstUrl = effectiveUrls(resource)[0];
      if (firstUrl) {
        window.open(firstUrl, '_blank', 'noopener,noreferrer');
        return;
      }
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
        {grouped.map(({ key, label, types }) => {
          const isCollapsed = collapsedGroups.has(key);
          return (
            <div
              key={key}
              className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleGroup(key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-warm-100 dark:bg-navy-800 hover:bg-warm-200 dark:hover:bg-navy-700 transition-colors"
              >
                <h3 className="font-semibold text-navy-800 dark:text-white">{label}</h3>
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
                        {items.map((resource) => {
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
                                  {resource.className ? `${resource.className} - ` : ''}
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
                                    onClick={() => openResource(resource, 'file')}
                                    className="px-3 py-1 rounded-md border border-warm-300 dark:border-navy-600 text-sm hover:bg-warm-100 dark:hover:bg-navy-700"
                                  >
                                    {t('portal.resourceList.openFile', 'Open file')}
                                  </button>
                                ) : null}
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
    );
  }

  const sorted = [...resources].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {sorted.map((resource) => {
        const resourceUrls = effectiveUrls(resource);
        const hasUrl = resourceUrls.length > 0;
        const hasFile = Boolean(resource.file_path);
        const hasOpenableTarget = hasUrl || hasFile;
        return (
          <article
            key={resource.id}
            className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium text-navy-800 dark:text-white">{resource.title}</p>
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
                <p className="text-xs text-charcoal/65 dark:text-navy-300">
                  {resource.className ? `${resource.className} - ` : ''}
                  {resource.type.replace('_', ' ')} - {new Date(resource.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {resourceUrls.map((linkUrl, idx) => (
                  <button
                    key={`${resource.id}-link-${idx}`}
                    type="button"
                    onClick={() => window.open(linkUrl, '_blank', 'noopener,noreferrer')}
                    title={linkUrl}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
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
                    onClick={() => openResource(resource, 'file')}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    {t('portal.resourceList.openFile', 'Open file')}
                  </button>
                ) : null}
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
        );
      })}
    </div>
  );
}
