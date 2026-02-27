export function isValidTimezone(value: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch (error) {
    console.error("[timezone] error:", error);
    return false;
  }
}
