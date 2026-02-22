type TemplateArgs = {
  title: string;
  bodyLines: string[];
  buttonLabel?: string;
  buttonUrl?: string;
  preferenceUrl?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderTemplate(args: TemplateArgs): { html: string; text: string } {
  const lineHtml = args.bodyLines
    .map((line) => `<p style="margin:0 0 12px 0;">${escapeHtml(line)}</p>`)
    .join('');

  const buttonHtml =
    args.buttonLabel && args.buttonUrl
      ? `<p style="margin:20px 0 0 0;"><a href="${escapeHtml(args.buttonUrl)}" style="background:#11294a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:6px;display:inline-block;">${escapeHtml(args.buttonLabel)}</a></p>`
      : '';

  const preferenceHtml = args.preferenceUrl
    ? `<p style="margin:18px 0 0 0;font-size:12px;color:#555;">Preferences: <a href="${escapeHtml(args.preferenceUrl)}">${escapeHtml(args.preferenceUrl)}</a></p>`
    : '';

  return {
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.45;"><div style="max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:18px;"><h2 style="margin:0 0 14px 0;color:#11294a;">${escapeHtml(args.title)}</h2>${lineHtml}${buttonHtml}${preferenceHtml}</div></body></html>`,
    text: [args.title, '', ...args.bodyLines, args.buttonUrl ? `Portal: ${args.buttonUrl}` : '', args.preferenceUrl ? `Preferences: ${args.preferenceUrl}` : '']
      .filter(Boolean)
      .join('\n'),
  };
}

export function subRequestCreatedTemplate(input: {
  className: string;
  whenText: string;
  requestingCoach: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = `Sub request: ${input.className} (${input.whenText})`;
  const { html, text } = renderTemplate({
    title: 'Substitute Coach Request',
    bodyLines: [
      `${input.requestingCoach} requested a substitute coach.`,
      `Class: ${input.className}`,
      `When: ${input.whenText}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function subAcceptedTemplate(input: {
  className: string;
  whenText: string;
  acceptingCoach: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = `Sub accepted: ${input.className}`;
  const { html, text } = renderTemplate({
    title: 'Sub Request Accepted',
    bodyLines: [
      `Your sub request was accepted by ${input.acceptingCoach}.`,
      `Class: ${input.className}`,
      `When: ${input.whenText}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function subStudentNoticeTemplate(input: {
  className: string;
  whenText: string;
  subCoach: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = `Class update: ${input.className}`;
  const { html, text } = renderTemplate({
    title: 'Class Coaching Update',
    bodyLines: [
      `Your class has a substitute coach for this session.`,
      `Class: ${input.className}`,
      `When: ${input.whenText}`,
      `Substitute coach: ${input.subCoach}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function subCancelledTemplate(input: {
  className: string;
  whenText: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = `Sub request cancelled: ${input.className}`;
  const { html, text } = renderTemplate({
    title: 'Sub Request Cancelled',
    bodyLines: [`The accepted sub request was cancelled.`, `Class: ${input.className}`, `When: ${input.whenText}`],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function taRequestCreatedTemplate(input: {
  className: string;
  whenText: string;
  requestingCoach: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = `TA request: ${input.className} (${input.whenText})`;
  const { html, text } = renderTemplate({
    title: 'TA Request',
    bodyLines: [
      `${input.requestingCoach} requested TA support.`,
      `Class: ${input.className}`,
      `When: ${input.whenText}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function taAcceptedTemplate(input: {
  className: string;
  whenText: string;
  acceptingTa: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = `TA request accepted: ${input.className}`;
  const { html, text } = renderTemplate({
    title: 'TA Request Accepted',
    bodyLines: [
      `${input.acceptingTa} accepted your TA request.`,
      `Class: ${input.className}`,
      `When: ${input.whenText}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateRequestedTemplate(input: {
  studentName: string;
  whenText: string;
  notes?: string | null;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = `Private session request from ${input.studentName}`;
  const lines = [
    `${input.studentName} requested a private session.`,
    `When: ${input.whenText}`,
  ];
  if (input.notes) lines.push(`Notes: ${input.notes}`);
  const { html, text } = renderTemplate({
    title: 'Private Session Requested',
    bodyLines: lines,
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateConfirmedTemplate(input: {
  coachName: string;
  whenText: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = 'Private session confirmed';
  const { html, text } = renderTemplate({
    title: 'Private Session Confirmed',
    bodyLines: [`Coach: ${input.coachName}`, `When: ${input.whenText}`],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateCancelledTemplate(input: {
  whenText: string;
  cancelledBy: string;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const subject = 'Private session cancelled';
  const { html, text } = renderTemplate({
    title: 'Private Session Cancelled',
    bodyLines: [`When: ${input.whenText}`, `Cancelled by: ${input.cancelledBy}`],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}
