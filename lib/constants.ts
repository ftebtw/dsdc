/** Contact/e-transfer email - reads from env with fallback. */
export const DSDC_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_ETRANSFER_EMAIL?.trim() || "education.dsdc@gmail.com";
