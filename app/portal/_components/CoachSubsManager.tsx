"use client";

import { useEffect, useMemo, useState } from 'react';
import SubRequestCard from '@/app/portal/_components/SubRequestCard';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type ClassOption = {
  id: string;
  name: string;
  timezone: string;
  schedule_day: string | null;
  schedule_start_time: string;
  schedule_end_time: string;
};

type RequestItem = {
  id: string;
  class_id: string;
  className: string;
  session_date: string;
  whenText: string;
  reason: string | null;
  status: string;
  requesting_coach_id: string;
  requestingName: string;
  acceptingName?: string | null;
  isMine: boolean;
  canAccept: boolean;
};

const DAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function getSessionDates(
  scheduleDay: string | null | undefined,
  termStart: string,
  termEnd: string
): Array<{ label: string; date: string }> {
  if (!scheduleDay) return [];
  const dayNum = DAY_MAP[scheduleDay.toLowerCase()];
  if (dayNum === undefined) return [];

  const start = new Date(`${termStart}T00:00:00`);
  const end = new Date(`${termEnd}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: Array<{ label: string; date: string }> = [];
  const current = new Date(start);
  let weekNum = 0;

  while (current <= end) {
    if (current.getDay() === dayNum) {
      weekNum += 1;
      const dateStr = current.toISOString().slice(0, 10);
      const month = current.getMonth() + 1;
      const day = current.getDate();
      if (current >= today) {
        dates.push({
          label: `Week ${weekNum} (${month}/${day})`,
          date: dateStr,
        });
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export default function CoachSubsManager({
  classes,
  subRequests,
  taRequests,
  termStartDate,
  termEndDate,
}: {
  classes: ClassOption[];
  subRequests: RequestItem[];
  taRequests: RequestItem[];
  termStartDate: string | null;
  termEndDate: string | null;
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [loading, setLoading] = useState<'sub' | 'ta' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subClassId, setSubClassId] = useState(classes[0]?.id ?? '');
  const [taClassId, setTaClassId] = useState(classes[0]?.id ?? '');

  useEffect(() => {
    if (!classes.length) {
      setSubClassId('');
      setTaClassId('');
      return;
    }
    if (!classes.some((classRow) => classRow.id === subClassId)) {
      setSubClassId(classes[0].id);
    }
    if (!classes.some((classRow) => classRow.id === taClassId)) {
      setTaClassId(classes[0].id);
    }
  }, [classes, subClassId, taClassId]);

  const subClass = useMemo(
    () => classes.find((classRow) => classRow.id === subClassId),
    [classes, subClassId]
  );
  const taClass = useMemo(
    () => classes.find((classRow) => classRow.id === taClassId),
    [classes, taClassId]
  );

  const subWeeks = useMemo(
    () =>
      subClass && termStartDate && termEndDate
        ? getSessionDates(subClass.schedule_day, termStartDate, termEndDate)
        : [],
    [subClass, termStartDate, termEndDate]
  );
  const taWeeks = useMemo(
    () =>
      taClass && termStartDate && termEndDate
        ? getSessionDates(taClass.schedule_day, termStartDate, termEndDate)
        : [],
    [taClass, termStartDate, termEndDate]
  );

  async function createRequest(
    kind: 'sub' | 'ta',
    payload: { classId: string; sessionDate: string; reason: string }
  ) {
    setLoading(kind);
    setError(null);
    const response = await fetch(kind === 'sub' ? '/api/portal/subs' : '/api/portal/ta-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setLoading(null);
    if (!response.ok) {
      setError(data.error || t('portal.coachSubs.createError', 'Could not create request.'));
      return;
    }
    window.location.reload();
  }

  async function runAction(endpoint: string) {
    const response = await fetch(endpoint, { method: 'POST' });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: data.error || t('portal.coachSubs.requestFailed', 'Request failed.') };
    }
    window.location.reload();
    return { ok: true };
  }

  const mySubs = subRequests.filter((row) => row.isMine);
  const availableSubs = subRequests.filter((row) => !row.isMine && row.status === 'open' && row.canAccept);
  const myTas = taRequests.filter((row) => row.isMine);
  const availableTas = taRequests.filter((row) => !row.isMine && row.status === 'open' && row.canAccept);

  return (
    <div className="space-y-6">
      <div className="grid xl:grid-cols-2 gap-6">
        <form
          className="rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await createRequest('sub', {
              classId: String(formData.get('classId') || ''),
              sessionDate: String(formData.get('sessionDate') || ''),
              reason: String(formData.get('reason') || ''),
            });
          }}
        >
          <h3 className="font-semibold text-navy-800 dark:text-white">
            {t('portal.coachSubs.requestSub', 'Request Sub')}
          </h3>
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">
              {t('portal.common.class', 'Class')}
            </span>
            <select
              required
              name="classId"
              value={subClassId}
              onChange={(event) => setSubClassId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            >
              {classes.map((classRow) => (
                <option key={classRow.id} value={classRow.id}>
                  {classRow.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">
              {t('portal.coachSubs.session', 'Session')}
            </span>
            <select
              required
              name="sessionDate"
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            >
              {subWeeks.length === 0 ? (
                <option value="">{t('portal.coachSubs.noUpcomingSessions', 'No upcoming sessions')}</option>
              ) : (
                subWeeks.map((week) => (
                  <option key={week.date} value={week.date}>
                    {week.label}
                  </option>
                ))
              )}
            </select>
          </label>
          <textarea
            name="reason"
            rows={3}
            placeholder={t('portal.coachSubs.reasonOptional', 'Reason (optional)')}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
          <button
            disabled={loading !== null || !classes.length || subWeeks.length === 0}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
          >
            {loading === 'sub'
              ? t('portal.common.sending', 'Sending...')
              : t('portal.coachSubs.submitSubRequest', 'Submit Sub Request')}
          </button>
        </form>

        <form
          className="rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await createRequest('ta', {
              classId: String(formData.get('classId') || ''),
              sessionDate: String(formData.get('sessionDate') || ''),
              reason: String(formData.get('reason') || ''),
            });
          }}
        >
          <h3 className="font-semibold text-navy-800 dark:text-white">
            {t('portal.coachSubs.requestTa', 'Request TA')}
          </h3>
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">
              {t('portal.common.class', 'Class')}
            </span>
            <select
              required
              name="classId"
              value={taClassId}
              onChange={(event) => setTaClassId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            >
              {classes.map((classRow) => (
                <option key={classRow.id} value={classRow.id}>
                  {classRow.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">
              {t('portal.coachSubs.session', 'Session')}
            </span>
            <select
              required
              name="sessionDate"
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            >
              {taWeeks.length === 0 ? (
                <option value="">{t('portal.coachSubs.noUpcomingSessions', 'No upcoming sessions')}</option>
              ) : (
                taWeeks.map((week) => (
                  <option key={week.date} value={week.date}>
                    {week.label}
                  </option>
                ))
              )}
            </select>
          </label>
          <textarea
            name="reason"
            rows={3}
            placeholder={t('portal.coachSubs.reasonOptional', 'Reason (optional)')}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
          <button
            disabled={loading !== null || !classes.length || taWeeks.length === 0}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
          >
            {loading === 'ta'
              ? t('portal.common.sending', 'Sending...')
              : t('portal.coachSubs.submitTaRequest', 'Submit TA Request')}
          </button>
        </form>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t('portal.coachSubs.mySubRequests', 'My Sub Requests')}
        </h3>
        {mySubs.length ? (
          mySubs.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="sub"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              acceptedByName={request.acceptingName}
              canCancel={request.status === 'open'}
              onCancel={() => runAction(`/api/portal/subs/${request.id}/cancel`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.coachSubs.noSubRequests', 'No sub requests created yet.')}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t('portal.coachSubs.availableSubRequests', 'Available Sub Requests')}
        </h3>
        {availableSubs.length ? (
          availableSubs.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="sub"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              canAccept
              onAccept={() => runAction(`/api/portal/subs/${request.id}/accept`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.coachSubs.noOpenSubRequests', 'No open sub requests for you right now.')}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t('portal.coachSubs.myTaRequests', 'My TA Requests')}
        </h3>
        {myTas.length ? (
          myTas.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="ta"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              acceptedByName={request.acceptingName}
              canCancel={request.status === 'open'}
              onCancel={() => runAction(`/api/portal/ta-requests/${request.id}/cancel`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.coachSubs.noTaRequests', 'No TA requests created yet.')}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t('portal.coachSubs.availableTaRequests', 'Available TA Requests')}
        </h3>
        {availableTas.length ? (
          availableTas.map((request) => (
            <SubRequestCard
              key={request.id}
              requestType="ta"
              className={request.className}
              whenText={request.whenText}
              requestingName={request.requestingName}
              status={request.status}
              reason={request.reason}
              canAccept
              onAccept={() => runAction(`/api/portal/ta-requests/${request.id}/accept`)}
            />
          ))
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.coachSubs.noOpenTaRequests', 'No open TA requests for you right now.')}
          </p>
        )}
      </div>
    </div>
  );
}
