"use client";

import { useTransition } from 'react';
import { deleteWaitlistEntry } from '@/app/portal/admin/waitlist/actions';

type Props = {
  entryId: string;
  parentName: string;
};

export default function WaitlistDeleteButton({ entryId, parentName }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Delete the waitlist entry for ${parentName}? This cannot be undone.`
    );
    if (!confirmed) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      deleteWaitlistEntry(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={entryId} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Deleting...' : 'Delete Entry'}
      </button>
    </form>
  );
}
