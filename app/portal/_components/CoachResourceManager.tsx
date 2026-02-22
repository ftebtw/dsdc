"use client";

import { useMemo, useState } from 'react';
import type { Database } from '@/lib/supabase/database.types';

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
}: {
  classId: string;
  initialResources: Resource[];
}) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('homework');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [resources]);

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', title);
    formData.append('type', type);
    if (url.trim()) formData.append('url', url.trim());
    if (file) formData.append('file', file);

    const response = await fetch('/api/portal/resources/upload', {
      method: 'POST',
      body: formData,
    });
    const data = (await response.json()) as { error?: string; resource?: Resource };

    setLoading(false);

    if (!response.ok || !data.resource) {
      setError(data.error || 'Failed to create resource.');
      return;
    }

    setResources((prev) => [data.resource!, ...prev]);
    setTitle('');
    setType('homework');
    setUrl('');
    setFile(null);
  }

  async function onDelete(resourceId: string) {
    const response = await fetch(`/api/portal/resources/${resourceId}`, { method: 'DELETE' });
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
      setError(data.error || 'Could not open resource.');
      return;
    }
    window.open(data.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="grid gap-3 rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900">
        <h3 className="font-semibold text-navy-800 dark:text-white">Add Resource</h3>
        <input
          required
          placeholder="Resource title"
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
              {option.replace('_', ' ')}
            </option>
          ))}
        </select>
        <input
          placeholder="External URL (optional)"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
        />
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
        />
        <p className="text-xs text-charcoal/60 dark:text-navy-300">Provide a file, a URL, or both.</p>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="justify-self-start px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Post Resource'}
        </button>
      </form>

      <div className="space-y-3">
        {sortedResources.length === 0 ? (
          <p className="text-sm text-charcoal/65 dark:text-navy-300">No resources posted for this class yet.</p>
        ) : null}
        {sortedResources.map((resource) => (
          <div
            key={resource.id}
            className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <p className="font-medium text-navy-800 dark:text-white">{resource.title}</p>
              <p className="text-xs text-charcoal/65 dark:text-navy-300">
                {resource.type.replace('_', ' ')} • {new Date(resource.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpen(resource)}
                className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
              >
                Open
              </button>
              <button
                onClick={() => onDelete(resource.id)}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
