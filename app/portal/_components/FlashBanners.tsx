type Props = {
  searchParams: Record<string, string | string[] | undefined>;
  successMessages?: Record<string, string>;
  errorMessages?: Record<string, string>;
};

function getFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Renders flash success/error banners driven by URL search params.
 * Pages pair this with server actions that redirect with `?error=<code>`
 * or `?<successKey>=1` after a write completes.
 */
export default function FlashBanners({
  searchParams,
  successMessages = {},
  errorMessages = {},
}: Props) {
  const successKey = Object.keys(successMessages).find(
    (key) => getFirst(searchParams[key])
  );
  const errorCode = getFirst(searchParams.error);
  const errorMessage = errorCode ? errorMessages[errorCode] : null;

  if (!successKey && !errorMessage) return null;

  return (
    <div className="space-y-3">
      {successKey ? (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300"
        >
          {successMessages[successKey]}
        </div>
      ) : null}
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
        >
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
