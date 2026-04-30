"use client";

import { useTransition } from 'react';
import { deleteConsultation } from '@/app/portal/admin/consultations/actions';

type Props = {
  consultationId: string;
  studentName: string;
};

export default function ConsultationDeleteButton({ consultationId, studentName }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Delete the consultation for ${studentName}? This cannot be undone.`
    );
    if (!confirmed) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      deleteConsultation(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={consultationId} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Deleting...' : 'Delete Consultation'}
      </button>
    </form>
  );
}
