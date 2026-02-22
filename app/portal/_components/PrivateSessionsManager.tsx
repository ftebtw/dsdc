"use client";

import PrivateSessionCard from '@/app/portal/_components/PrivateSessionCard';

type SessionItem = {
  id: string;
  coachName: string;
  studentName: string;
  whenText: string;
  status: string;
  student_notes?: string | null;
  coach_notes?: string | null;
  canConfirm?: boolean;
  canCancel?: boolean;
  canComplete?: boolean;
};

export default function PrivateSessionsManager({ sessions }: { sessions: SessionItem[] }) {
  async function callAction(endpoint: string) {
    const response = await fetch(endpoint, { method: 'POST' });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: data.error || 'Action failed.' };
    }
    window.location.reload();
    return { ok: true };
  }

  if (!sessions.length) {
    return <p className="text-sm text-charcoal/70 dark:text-navy-300">No private sessions found.</p>;
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <PrivateSessionCard
          key={session.id}
          coachName={session.coachName}
          studentName={session.studentName}
          whenText={session.whenText}
          status={session.status}
          studentNotes={session.student_notes}
          coachNotes={session.coach_notes}
          canConfirm={Boolean(session.canConfirm)}
          canCancel={Boolean(session.canCancel)}
          canComplete={Boolean(session.canComplete)}
          onConfirm={
            session.canConfirm ? () => callAction(`/api/portal/private-sessions/${session.id}/confirm`) : undefined
          }
          onCancel={
            session.canCancel ? () => callAction(`/api/portal/private-sessions/${session.id}/cancel`) : undefined
          }
          onComplete={
            session.canComplete ? () => callAction(`/api/portal/private-sessions/${session.id}/complete`) : undefined
          }
        />
      ))}
    </div>
  );
}
