import Link from 'next/link';
import { formatInTimeZone } from 'date-fns-tz';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const PAGE_SIZE = 200;
const VANCOUVER_TIMEZONE = 'America/Vancouver';

type LoginRoleFilter = 'admin' | 'coach' | 'ta';

type LoginLogRow = {
  id: string;
  user_id: string;
  email: string;
  role: string;
  display_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  logged_in_at: string;
};

type ProfileLite = {
  id: string;
  display_name: string | null;
  email: string;
};

function parseRoleFilter(value: string | undefined): LoginRoleFilter | null {
  if (value === 'admin' || value === 'coach' || value === 'ta') return value;
  return null;
}

function parseDateFilter(value: string | undefined): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function parseOffset(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

function truncateText(value: string | null, maxLength = 60): string {
  if (!value) return '-';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

export default async function AdminLoginLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    role?: string;
    start?: string;
    end?: string;
    offset?: string;
  }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const roleFilter = parseRoleFilter(params.role);
  const startDate = parseDateFilter(params.start);
  const endDate = parseDateFilter(params.end);
  const offset = parseOffset(params.offset);

  let query = supabase
    .from('portal_login_log')
    .select('id,user_id,email,role,display_name,ip_address,user_agent,logged_in_at', { count: 'exact' })
    .order('logged_in_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (roleFilter) {
    query = query.eq('role', roleFilter);
  }
  if (startDate) {
    query = query.gte('logged_in_at', `${startDate}T00:00:00.000Z`);
  }
  if (endDate) {
    query = query.lte('logged_in_at', `${endDate}T23:59:59.999Z`);
  }

  const { data: loginRowsData, count } = await query;
  const loginRows = (loginRowsData ?? []) as LoginLogRow[];

  const userIds = [...new Set(loginRows.map((row) => row.user_id))];
  const { data: profilesData } = userIds.length
    ? await supabase.from('profiles').select('id,display_name,email').in('id', userIds)
    : { data: [] as ProfileLite[] };
  const profileMap = Object.fromEntries(
    ((profilesData ?? []) as ProfileLite[]).map((profile) => [profile.id, profile])
  ) as Record<string, ProfileLite>;

  const hasMore = typeof count === 'number' ? offset + loginRows.length < count : loginRows.length === PAGE_SIZE;
  const nextOffset = offset + PAGE_SIZE;

  const loadMoreParams = new URLSearchParams();
  if (roleFilter) loadMoreParams.set('role', roleFilter);
  if (startDate) loadMoreParams.set('start', startDate);
  if (endDate) loadMoreParams.set('end', endDate);
  loadMoreParams.set('offset', String(nextOffset));

  return (
    <SectionCard title="Login Log" description="Recent admin, coach, and TA sign-ins to the portal.">
      <form method="get" className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
        <label className="block">
          <span className="mb-1 block text-sm text-navy-700 dark:text-navy-200">Role</span>
          <select
            name="role"
            defaultValue={roleFilter ?? ''}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="coach">Coach</option>
            <option value="ta">TA</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-navy-700 dark:text-navy-200">From</span>
          <input
            type="date"
            name="start"
            defaultValue={startDate ?? ''}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-navy-700 dark:text-navy-200">To</span>
          <input
            type="date"
            name="end"
            defaultValue={endDate ?? ''}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
        </label>

        <input type="hidden" name="offset" value="0" />

        <button
          type="submit"
          className="rounded-lg bg-navy-800 text-white px-4 py-2.5 text-sm font-semibold hover:bg-navy-700"
        >
          Apply filters
        </button>

        <Link
          href="/portal/admin/login-log"
          className="rounded-lg border border-warm-300 dark:border-navy-600 px-4 py-2.5 text-sm font-medium text-center text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
        >
          Reset
        </Link>
      </form>

      <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-900/60">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Logged In At (Vancouver)</th>
              <th className="px-4 py-3 text-left">IP Address</th>
              <th className="px-4 py-3 text-left">User Agent</th>
            </tr>
          </thead>
          <tbody>
            {loginRows.length === 0 ? (
              <tr className="border-t border-warm-200 dark:border-navy-700">
                <td colSpan={5} className="px-4 py-6 text-center text-charcoal/70 dark:text-navy-300">
                  No login events found for the selected filters.
                </td>
              </tr>
            ) : null}

            {loginRows.map((row) => {
              const profile = profileMap[row.user_id];
              const displayName = profile?.display_name || row.display_name || profile?.email || row.email;
              const formattedTime = formatInTimeZone(
                new Date(row.logged_in_at),
                VANCOUVER_TIMEZONE,
                'yyyy-MM-dd HH:mm zzz'
              );

              return (
                <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-4 py-3 text-navy-800 dark:text-white">{displayName}</td>
                  <td className="px-4 py-3 uppercase">{row.role}</td>
                  <td className="px-4 py-3">{formattedTime}</td>
                  <td className="px-4 py-3">{row.ip_address || '-'}</td>
                  <td className="px-4 py-3">{truncateText(row.user_agent)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore ? (
        <div className="mt-4">
          <Link
            href={`/portal/admin/login-log?${loadMoreParams.toString()}`}
            className="inline-flex rounded-lg border border-warm-300 dark:border-navy-600 px-4 py-2 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
          >
            Load more
          </Link>
        </div>
      ) : null}
    </SectionCard>
  );
}
