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

type EnrollmentConfirmationClass = {
  name: string;
  type: string;
  coachName: string;
  scheduleText: string;
  timezoneLabel: string;
  zoomLink?: string | null;
  termDates: string;
};

export function enrollmentConfirmationFull(input: {
  studentName: string;
  parentName?: string;
  classes: EnrollmentConfirmationClass[];
  portalLoginUrl: string;
  isParentVersion: boolean;
  studentNeedsPasswordSetup?: boolean;
  contactEmail: string;
  locale?: 'en' | 'zh';
}) {
  const locale = input.locale === 'zh' ? 'zh' : 'en';
  const copy =
    locale === 'zh'
      ? {
          subject: input.isParentVersion
            ? `报名确认：${input.studentName}`
            : `您已成功报名：${input.studentName}`,
          title: '报名确认',
          introParent: `您已为 ${input.studentName} 报名以下课程：`,
          introStudent: '您已报名以下课程：',
          classType: '课程类型',
          coach: '教练',
          schedule: '时间安排',
          zoom: 'Zoom链接',
          term: '学期日期',
          noZoom: '开课前提供',
          whatToExpect:
            '课堂将进行出勤记录，作业和学习资料会发布在学生门户中。',
          portal:
            '可选：进入学生门户查看出勤记录、学习资料和更多内容：',
          setup:
            '您的账号由家长创建。请使用邀请邮件完成密码设置。',
          contact: `如有问题，请联系：${input.contactEmail}`,
          button: '打开门户',
          unsubscribe: '您收到此邮件是因为您已在DSDC注册。通知偏好：',
        }
      : {
          subject: input.isParentVersion
            ? `Enrollment confirmed for ${input.studentName}`
            : `Enrollment confirmed: ${input.studentName}`,
          title: 'Enrollment Confirmed',
          introParent: `You've enrolled ${input.studentName} in the following classes:`,
          introStudent: "You've been enrolled in the following classes:",
          classType: 'Class type',
          coach: 'Coach',
          schedule: 'Schedule',
          zoom: 'Zoom link',
          term: 'Term dates',
          noZoom: 'Provided before class starts',
          whatToExpect:
            'Your coach will take attendance each session. Resources and homework will be posted in the portal.',
          portal:
            'Optional: Access your student portal for attendance records, resources, and more:',
          setup:
            'Your account was created by a parent. Please use your invite email to set your password.',
          contact: `Questions? Email ${input.contactEmail}`,
          button: 'Portal Login',
          unsubscribe: "You're receiving this because you're registered with DSDC. Update preferences:",
        };

  const intro = input.isParentVersion ? copy.introParent : copy.introStudent;

  const classHtml = input.classes
    .map((classItem) => {
      const zoomHref = classItem.zoomLink?.trim() || '';
      const zoomHtml = zoomHref
        ? `<a href="${escapeHtml(zoomHref)}" style="color:#11294a;">${escapeHtml(zoomHref)}</a>`
        : escapeHtml(copy.noZoom);

      return `
      <div style="border:1px solid #e7e7e7;border-radius:10px;padding:12px;margin:0 0 12px 0;">
        <p style="margin:0 0 8px 0;font-weight:700;color:#11294a;">${escapeHtml(classItem.name)}</p>
        <p style="margin:0 0 6px 0;"><strong>${escapeHtml(copy.classType)}:</strong> ${escapeHtml(classItem.type)}</p>
        <p style="margin:0 0 6px 0;"><strong>${escapeHtml(copy.coach)}:</strong> ${escapeHtml(classItem.coachName)}</p>
        <p style="margin:0 0 6px 0;"><strong>${escapeHtml(copy.schedule)}:</strong> ${escapeHtml(classItem.scheduleText)}</p>
        <p style="margin:0 0 6px 0;"><strong>${escapeHtml(copy.zoom)}:</strong> ${zoomHtml}</p>
        <p style="margin:0;"><strong>${escapeHtml(copy.term)}:</strong> ${escapeHtml(classItem.termDates)}</p>
      </div>`;
    })
    .join('');

  const setupLine =
    input.studentNeedsPasswordSetup && !input.isParentVersion
      ? `<p style="margin:0 0 12px 0;">${escapeHtml(copy.setup)}</p>`
      : '';

  const buttonHtml = `<p style="margin:12px 0 0 0;"><a href="${escapeHtml(
    input.portalLoginUrl
  )}" style="background:#11294a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:6px;display:inline-block;">${escapeHtml(
    copy.button
  )}</a></p>`;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.45;"><div style="max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:18px;"><h2 style="margin:0 0 14px 0;color:#11294a;">${escapeHtml(
    copy.title
  )}</h2><p style="margin:0 0 12px 0;">${escapeHtml(intro)}</p>${classHtml}<p style="margin:0 0 12px 0;">${escapeHtml(
    copy.whatToExpect
  )}</p><p style="margin:0 0 12px 0;">${escapeHtml(copy.portal)}</p>${buttonHtml}${setupLine}<p style="margin:16px 0 0 0;">${escapeHtml(
    copy.contact
  )}</p><p style="margin:12px 0 0 0;font-size:12px;color:#555;">${escapeHtml(copy.unsubscribe)} <a href="${escapeHtml(
    input.portalLoginUrl
  )}">${escapeHtml(input.portalLoginUrl)}</a></p></div></body></html>`;

  const textLines = [
    copy.subject,
    '',
    intro,
    '',
    ...input.classes.flatMap((classItem) => [
      `${classItem.name}`,
      `${copy.classType}: ${classItem.type}`,
      `${copy.coach}: ${classItem.coachName}`,
      `${copy.schedule}: ${classItem.scheduleText}`,
      `${copy.zoom}: ${classItem.zoomLink || copy.noZoom}`,
      `${copy.term}: ${classItem.termDates}`,
      '',
    ]),
    copy.whatToExpect,
    copy.portal,
    input.portalLoginUrl,
    input.studentNeedsPasswordSetup && !input.isParentVersion ? copy.setup : '',
    copy.contact,
    `${copy.unsubscribe} ${input.portalLoginUrl}`,
  ].filter(Boolean);

  return {
    subject: copy.subject,
    html,
    text: textLines.join('\n'),
  };
}

export function reportCardApproved(input: {
  studentName: string;
  className: string;
  termName: string;
  portalUrl: string;
}) {
  const subject = `Report card ready: ${input.className}`;
  const { html, text } = renderTemplate({
    title: 'Report Card Ready',
    bodyLines: [
      `Hi ${input.studentName}, your report card is now approved and ready to view.`,
      `Class: ${input.className}`,
      `Term: ${input.termName}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.portalUrl,
  });
  return { subject, html, text };
}

export function reportCardRejected(input: {
  coachName: string;
  studentName: string;
  className: string;
  reviewerNotes: string;
  portalUrl: string;
}) {
  const subject = `Report card revision needed: ${input.studentName}`;
  const { html, text } = renderTemplate({
    title: 'Report Card Needs Revision',
    bodyLines: [
      `Hi ${input.coachName}, the submitted report card needs revisions.`,
      `Student: ${input.studentName}`,
      `Class: ${input.className}`,
      `Reviewer notes: ${input.reviewerNotes}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.portalUrl,
  });
  return { subject, html, text };
}

export function absenceReported(input: {
  studentName: string;
  className: string;
  sessionDate: string;
  reportedBy: string;
  portalUrl: string;
  preferenceUrl?: string;
}) {
  const subject = `Absence reported: ${input.studentName}`;
  const { html, text } = renderTemplate({
    title: 'Absence Reported',
    bodyLines: [
      `${input.reportedBy} reported an absence.`,
      `Student: ${input.studentName}`,
      `Class: ${input.className}`,
      `Session date: ${input.sessionDate}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function manualEnrollmentNotice(input: {
  studentName: string;
  className: string;
  termName: string;
  portalUrl: string;
  preferenceUrl?: string;
}) {
  const subject = `Enrollment update: ${input.className}`;
  const { html, text } = renderTemplate({
    title: 'Manual Enrollment Confirmation',
    bodyLines: [
      `Hi ${input.studentName}, you were enrolled in a class by the DSDC team.`,
      `Class: ${input.className}`,
      `Term: ${input.termName}`,
    ],
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function parentLinkedNotice(input: { studentName: string; portalUrl: string }) {
  const subject = 'Student linked to your parent account';
  const { html, text } = renderTemplate({
    title: 'Parent Link Confirmed',
    bodyLines: [
      `${input.studentName} is now linked to your parent account.`,
      'You can now view classes, attendance, resources, and legal documents for this student.',
    ],
    buttonLabel: 'Open Parent Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.portalUrl,
  });
  return { subject, html, text };
}

export function legalDocumentUploaded(input: {
  documentTitle: string;
  portalUrl: string;
  preferenceUrl?: string;
}) {
  const subject = `New legal document: ${input.documentTitle}`;
  const { html, text } = renderTemplate({
    title: 'New Legal Document Requires Signature',
    bodyLines: [
      `A new legal document was posted: ${input.documentTitle}.`,
      'Please review and sign it in the portal.',
    ],
    buttonLabel: 'Review Document',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function classReminderTemplate(input: {
  className: string;
  whenText: string;
  reminderType: '1day' | '1hour';
  zoomLink?: string | null;
  portalUrl: string;
  preferenceUrl?: string;
}) {
  const lead =
    input.reminderType === '1day'
      ? `Reminder: ${input.className} starts in about 24 hours.`
      : `Reminder: ${input.className} starts in about 1 hour.`;

  const lines = [lead, `When: ${input.whenText}`];
  if (input.zoomLink) {
    lines.push(`Zoom: ${input.zoomLink}`);
  }

  const subject =
    input.reminderType === '1day'
      ? `Class reminder (tomorrow): ${input.className}`
      : `Class reminder (1 hour): ${input.className}`;
  const { html, text } = renderTemplate({
    title: 'Upcoming Class Reminder',
    bodyLines: lines,
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function legalDocReminderTemplate(input: {
  documentTitle: string;
  recipientName: string;
  portalUrl: string;
}) {
  const subject = `Unsigned legal document reminder: ${input.documentTitle}`;
  const { html, text } = renderTemplate({
    title: 'Action Required: Legal Document Signature',
    bodyLines: [
      `Hi ${input.recipientName}, you still have unsigned legal documents in the DSDC portal.`,
      `Document: ${input.documentTitle}`,
      'Please sign as soon as possible.',
    ],
    buttonLabel: 'Sign Document',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.portalUrl,
  });
  return { subject, html, text };
}

export function reportCardNudgeTemplate(input: {
  coachName: string;
  className: string;
  missingCount: number;
  termEndDate: string;
  portalUrl: string;
}) {
  const subject = `Report card nudge: ${input.className} (${input.missingCount} pending)`;
  const { html, text } = renderTemplate({
    title: 'Report Card Submission Reminder',
    bodyLines: [
      `Hi ${input.coachName}, you still have report cards pending.`,
      `Class: ${input.className}`,
      `Pending report cards: ${input.missingCount}`,
      `Term end date: ${input.termEndDate}`,
    ],
    buttonLabel: 'Open Report Cards',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.portalUrl,
  });
  return { subject, html, text };
}

type EtransferClassItem = { name: string; type?: string };

function formatEtransferClassLines(classes: EtransferClassItem[]): string[] {
  return classes.map((classRow) =>
    classRow.type ? `- ${classRow.name} (${classRow.type})` : `- ${classRow.name}`
  );
}

export function etransferInstructions(input: {
  studentName: string;
  classes: EtransferClassItem[];
  totalAmountCad: number;
  etransferEmail: string;
  pendingPageUrl: string;
  expiresAt: string;
  locale?: 'en' | 'zh';
  isParentVersion?: boolean;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? 'DSDC报名电子转账说明'
    : 'E-Transfer Instructions for Your DSDC Enrollment';

  const intro = isZh
    ? input.isParentVersion
      ? `您好，您已为 ${input.studentName} 预留以下课程名额：`
      : `您好 ${input.studentName}，您已预留以下课程名额：`
    : input.isParentVersion
      ? `You've reserved a spot for ${input.studentName} in the following classes:`
      : `Hi ${input.studentName}, your spot has been reserved for the following classes:`;

  const bodyLines = [
    intro,
    ...formatEtransferClassLines(input.classes),
    isZh
      ? `请向 ${input.etransferEmail} 发送 Interac 电子转账，金额为 CAD $${input.totalAmountCad.toFixed(2)}。`
      : `Please send an Interac e-transfer for CAD $${input.totalAmountCad.toFixed(2)} to ${input.etransferEmail}.`,
    isZh
      ? "请在转账留言中注明您的全名和 'DSDC Enrollment'。"
      : "Include your full name and 'DSDC Enrollment' in the transfer message.",
    isZh ? '完成后请点击下方按钮确认。' : 'After sending, please confirm using the button below.',
    isZh
      ? `名额将于 ${input.expiresAt} 过期。`
      : `Your reservation will expire in 24 hours (${input.expiresAt}).`,
    isZh ? '如有问题请联系 education.dsdc@gmail.com。' : 'Questions? Contact education.dsdc@gmail.com.',
  ];

  const { html, text } = renderTemplate({
    title: isZh ? '电子转账报名说明' : 'E-Transfer Enrollment Instructions',
    bodyLines,
    buttonLabel: isZh ? '我已发送电子转账' : 'I Have Sent the E-Transfer',
    buttonUrl: input.pendingPageUrl,
  });

  return { subject, html, text };
}

export function etransferReminder(input: {
  studentName: string;
  pendingPageUrl: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? '提醒：您的DSDC报名尚未完成'
    : "Reminder: Your DSDC enrollment isn't finalized yet";

  const { html, text } = renderTemplate({
    title: isZh ? '报名提醒' : 'Enrollment Reminder',
    bodyLines: [
      isZh
        ? `您好 ${input.studentName}，我们注意到您尚未确认电子转账。`
        : `Hi ${input.studentName}, we noticed you haven't confirmed your e-transfer yet.`,
      isZh
        ? '您的课程预留即将到期。如果您已发送转账，请点击下方确认。'
        : "Your class reservation will expire soon. If you've already sent the e-transfer, please confirm below.",
      isZh ? '如需帮助，请联系 education.dsdc@gmail.com。' : 'If you need help, contact education.dsdc@gmail.com.',
    ],
    buttonLabel: isZh ? '我已发送电子转账' : 'I Have Sent the E-Transfer',
    buttonUrl: input.pendingPageUrl,
  });

  return { subject, html, text };
}

export function etransferSentConfirmation(input: {
  studentName: string;
  classes: EtransferClassItem[];
  locale?: 'en' | 'zh';
  isParentVersion?: boolean;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? '我们已收到您的转账通知——报名待确认'
    : "We've noted your e-transfer - enrollment pending";

  const bodyLines = [
    isZh
      ? input.isParentVersion
        ? `您好，感谢您确认 ${input.studentName} 的电子转账：`
        : `您好 ${input.studentName}，感谢您确认电子转账：`
      : input.isParentVersion
        ? `Thank you for confirming ${input.studentName}'s e-transfer for:`
        : `Hi ${input.studentName}, thank you for confirming your e-transfer for:`,
    ...formatEtransferClassLines(input.classes),
    isZh
      ? '报名正在等待管理员核实转账。核实后您将收到确认邮件。'
      : "Enrollment is now pending admin verification. You'll receive a confirmation email once the transfer is verified.",
    isZh
      ? '如需更多信息（如我们无法找到转账记录），我们会通过邮件或电话联系您。'
      : "If we need more information (e.g. we can't locate the e-transfer), we'll contact you by email or phone.",
    isZh ? '如有问题请联系 education.dsdc@gmail.com。' : 'Questions? Contact education.dsdc@gmail.com.',
  ];

  const { html, text } = renderTemplate({
    title: isZh ? '转账通知已收到' : 'E-Transfer Noted',
    bodyLines,
  });
  return { subject, html, text };
}

export function etransferLapsed(input: {
  studentName: string;
  classes: EtransferClassItem[];
  registerUrl: string;
  locale?: 'en' | 'zh';
  isParentVersion?: boolean;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? '您的DSDC报名预留已过期'
    : 'Your DSDC enrollment reservation has expired';

  const bodyLines = [
    isZh
      ? input.isParentVersion
        ? `您好，${input.studentName} 以下课程的预留已过期：`
        : `您好 ${input.studentName}，以下课程的预留已过期：`
      : input.isParentVersion
        ? `${input.studentName}'s reservation for the following classes has expired:`
        : `Hi ${input.studentName}, your reservation for the following classes has expired:`,
    ...formatEtransferClassLines(input.classes),
    isZh
      ? '如仍需报名，请重新提交注册申请。'
      : 'If you still want to enroll, please submit a new registration request.',
    isZh ? '如有问题请联系 education.dsdc@gmail.com。' : 'Questions? Contact education.dsdc@gmail.com.',
  ];

  const { html, text } = renderTemplate({
    title: isZh ? '预留已过期' : 'Reservation Expired',
    bodyLines,
    buttonLabel: isZh ? '重新注册' : 'Register Again',
    buttonUrl: input.registerUrl,
  });
  return { subject, html, text };
}

export function etransferCancelled(input: {
  studentName: string;
  classes: EtransferClassItem[];
  reason?: string;
  contactEmail: string;
  registerUrl: string;
  locale?: 'en' | 'zh';
  isParentVersion?: boolean;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? '您的DSDC报名申请已取消'
    : 'Your DSDC enrollment request has been cancelled';

  const bodyLines = [
    isZh
      ? input.isParentVersion
        ? `您好，${input.studentName} 以下课程的报名申请已取消：`
        : `您好 ${input.studentName}，您以下课程的报名申请已取消：`
      : input.isParentVersion
        ? `${input.studentName}'s enrollment request for the following classes has been cancelled:`
        : `Hi ${input.studentName}, your enrollment request for the following classes has been cancelled:`,
    ...formatEtransferClassLines(input.classes),
  ];

  if (input.reason?.trim()) {
    bodyLines.push(isZh ? `取消原因：${input.reason}` : `Reason: ${input.reason}`);
  }

  bodyLines.push(
    isZh
      ? `如您认为有误，请联系 ${input.contactEmail}。`
      : `If you believe this is an error, please contact ${input.contactEmail}.`,
    isZh ? '您可随时重新提交报名申请。' : 'You can submit a new enrollment request at any time.'
  );

  const { html, text } = renderTemplate({
    title: isZh ? '报名已取消' : 'Enrollment Cancelled',
    bodyLines,
    buttonLabel: isZh ? '重新注册' : 'Register Again',
    buttonUrl: input.registerUrl,
  });
  return { subject, html, text };
}
