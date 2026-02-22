"use client";

import { useMemo, useState } from 'react';
import type { Database } from '@/lib/supabase/database.types';

type Resource = Database['public']['Tables']['resources']['Row'] & {
  className?: string | null;
};

type Props = {
  resources: Resource[];
  showDelete?: boolean;
  onDelete?: (resourceId: string) => Promise<void>;
  labels?: {
    open?: string;
    delete?: string;
    empty?: string;
  };
};

export default function ResourceList({ resources, showDelete = false, onDelete, labels }: Props) {
  const [error, setError] = useState<string | null>(null);

  const sortedResources = useMemo(
    () => [...resources].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [resources]
  );

  async function openResource(resource: Resource) {
    setError(null);
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    const response = await fetch(`/api/portal/resources/${resource.id}/signed-url`);
    const data = (await response.json()) as { error?: string; url?: string };
    if (!response.ok || !data.url) {
      setError(data.error || 'Could not open resource.');
      return;
    }
    window.open(data.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {sortedResources.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {labels?.empty || 'No resources available.'}
        </p>
      ) : null}
      {sortedResources.map((resource) => (
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
                {labels?.open || 'Open'}
              </button>
              {showDelete && onDelete ? (
                <button
                  onClick={() => onDelete(resource.id)}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                >
                  {labels?.delete || 'Delete'}
                </button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
