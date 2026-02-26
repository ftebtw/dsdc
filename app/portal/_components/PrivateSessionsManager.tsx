"use client";

import PrivateSessionCard from '@/app/portal/_components/PrivateSessionCard';
import { portalT } from '@/lib/portal/parent-i18n';

type SessionItem = {
  id: string;
  coachName: string;
  studentName: string;
  whenText: string;
  status: string;
  student_notes?: string | null;
  coach_notes?: string | null;
  price_cad?: number | null;
  zoom_link?: string | null;
  payment_method?: string | null;
  proposed_date?: string | null;
  proposed_start_time?: string | null;
  proposed_end_time?: string | null;
  proposedByName?: string | null;
  step?: number;

  canAccept?: boolean;
  canReject?: boolean;
  canReschedule?: boolean;
  canAcceptReschedule?: boolean;
  canApprove?: boolean;
  canPay?: boolean;
  canCancel?: boolean;
  canComplete?: boolean;
};

export default function PrivateSessionsManager({
  sessions,
  viewerRole,
  locale = 'en',
}: {
  sessions: SessionItem[];
  viewerRole: 'admin' | 'coach' | 'student' | 'parent';
  locale?: 'en' | 'zh';
}) {
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  async function callAction(endpoint: string, body?: unknown) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      error?: string;
      checkoutUrl?: string;
    };

    if (!response.ok) {
      return { ok: false, error: payload.error || 'Action failed.' };
    }

    if (payload.checkoutUrl) {
      window.location.assign(payload.checkoutUrl);
      return { ok: true };
    }

    window.location.reload();
    return { ok: true };
  }

  if (!sessions.length) {
    return (
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        {t('portal.common.noSessions', 'No private sessions found.')}
      </p>
    );
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
          priceCad={session.price_cad}
          zoomLink={session.zoom_link}
          paymentMethod={session.payment_method}
          proposedDate={session.proposed_date}
          proposedStartTime={session.proposed_start_time}
          proposedEndTime={session.proposed_end_time}
          proposedByName={session.proposedByName}
          step={session.step}
          viewerRole={viewerRole}
          canAccept={Boolean(session.canAccept)}
          canReject={Boolean(session.canReject)}
          canReschedule={Boolean(session.canReschedule)}
          canAcceptReschedule={Boolean(session.canAcceptReschedule)}
          canApprove={Boolean(session.canApprove)}
          canPay={Boolean(session.canPay)}
          canCancel={Boolean(session.canCancel)}
          canComplete={Boolean(session.canComplete)}
          onAccept={
            session.canAccept ? () => callAction(`/api/portal/private-sessions/${session.id}/accept`) : undefined
          }
          onReject={
            session.canReject
              ? (notes) => callAction(`/api/portal/private-sessions/${session.id}/reject`, { coachNotes: notes })
              : undefined
          }
          onReschedule={
            session.canReschedule
              ? (data) =>
                  callAction(`/api/portal/private-sessions/${session.id}/reschedule`, {
                    proposedDate: data.date,
                    proposedStartTime: data.start,
                    proposedEndTime: data.end,
                    notes: data.notes,
                  })
              : undefined
          }
          onAcceptReschedule={
            session.canAcceptReschedule
              ? () => callAction(`/api/portal/private-sessions/${session.id}/accept-reschedule`)
              : undefined
          }
          onApprove={
            session.canApprove
              ? ({ priceCad, zoomLink }) =>
                  callAction(`/api/portal/private-sessions/${session.id}/confirm`, {
                    priceCad,
                    zoomLink,
                  })
              : undefined
          }
          onPayCard={
            session.canPay
              ? () => callAction(`/api/portal/private-sessions/${session.id}/checkout`)
              : undefined
          }
          onPayEtransfer={
            session.canPay
              ? () => callAction(`/api/portal/private-sessions/${session.id}/etransfer`)
              : undefined
          }
          onCancel={
            session.canCancel
              ? (reason) => callAction(`/api/portal/private-sessions/${session.id}/cancel`, { reason })
              : undefined
          }
          onComplete={
            session.canComplete ? () => callAction(`/api/portal/private-sessions/${session.id}/complete`) : undefined
          }
          locale={locale}
        />
      ))}
    </div>
  );
}
