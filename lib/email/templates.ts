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

  const spamNoticeHtml =
    '<p style="font-size:12px;color:#888;margin:16px 0 0 0;">If this email landed in your spam folder, please mark it as "not spam" so future messages arrive in your inbox.</p>';

  return {
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.45;"><div style="max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:18px;"><h2 style="margin:0 0 14px 0;color:#11294a;">${escapeHtml(args.title)}</h2>${lineHtml}${buttonHtml}${preferenceHtml}${spamNoticeHtml}</div></body></html>`,
    text: [args.title, '', ...args.bodyLines, args.buttonUrl ? `Portal: ${args.buttonUrl}` : '', args.preferenceUrl ? `Preferences: ${args.preferenceUrl}` : '']
      .filter(Boolean)
      .join('\n'),
  };
}

export function verificationEmailTemplate(args: {
  name: string;
  verifyUrl: string;
  locale: "en" | "zh";
}): { subject: string; html: string; text: string } {
  const isZh = args.locale === "zh";
  const subject = isZh ? "DSDC - 请验证您的邮箱" : "DSDC - Please verify your email";

  const { html, text } = renderTemplate({
    title: isZh ? "验证您的邮箱" : "Verify Your Email",
    bodyLines: isZh
      ? [
          `您好 ${args.name}，`,
          "感谢您注册 DSDC！请点击下方按钮验证您的邮箱并继续注册。",
          "此链接将在 24 小时后过期。",
        ]
      : [
          `Hi ${args.name},`,
          "Thanks for signing up for DSDC! Please click the button below to verify your email and continue registration.",
          "This link expires in 24 hours.",
        ],
    buttonLabel: isZh ? "验证邮箱" : "Verify Email",
    buttonUrl: args.verifyUrl,
  });

  return { subject, html, text };
}

export function linkVerificationCodeTemplate(input: {
  parentName: string;
  code: string;
}) {
  const subject = "DSDC - Verify Parent-Student Link";
  const { html, text } = renderTemplate({
    title: "Parent Account Link Verification",
    bodyLines: [
      `${input.parentName} has requested to link their parent account to your student account on the DSDC portal.`,
      "If you approve this link, share this verification code with them:",
      "",
    ],
  });

  const codeBlock = `<div style="margin:16px 0;padding:16px;background:#f0f4f8;border-radius:8px;text-align:center;"><p style="margin:0 0 8px 0;font-size:13px;color:#555;">Verification Code</p><p style="margin:0;font-size:32px;font-weight:bold;letter-spacing:0.2em;color:#11294a;font-family:monospace;">${escapeHtml(input.code)}</p></div><p style="margin:12px 0 0 0;font-size:13px;color:#888;">This code expires in 30 minutes. If you did not expect this, you can safely ignore this email.</p>`;
  const htmlWithCode = html.replace(
    "</div></body></html>",
    `${codeBlock}</div></body></html>`
  );
  const textWithCode =
    text + `\n\nVerification Code: ${input.code}\n\nThis code expires in 30 minutes.`;

  return { subject, html: htmlWithCode, text: textWithCode };
}

export function calendarEventTemplate(args: {
  eventTitle: string;
  eventDescription?: string;
  eventDate: string;
  eventTime: string;
  creatorName: string;
  isImportant: boolean;
  recipientName: string;
  preferenceUrl: string;
}): { html: string; text: string } {
  const importantPrefix = args.isImportant ? "Important - " : "";
  const detailsLine = args.eventDescription ? `Details: ${args.eventDescription}` : "";

  const bodyLines = [
    `Hi ${args.recipientName},`,
    "",
    `${importantPrefix}A new event has been added to the DSDC calendar by ${args.creatorName}:`,
    "",
    `Event: ${args.eventTitle}`,
    `Date: ${args.eventDate}`,
    `Time: ${args.eventTime}`,
    detailsLine,
  ].filter(Boolean) as string[];

  return renderTemplate({
    title: args.isImportant
      ? `Important Event: ${args.eventTitle}`
      : `New Event: ${args.eventTitle}`,
    bodyLines,
    buttonLabel: "View Calendar",
    buttonUrl: "https://dsdc.ca/portal",
    preferenceUrl: args.preferenceUrl,
  });
}

export function referralCreditTemplate(args: {
  referrerName: string;
  creditAmount: number;
  promoCode: string;
}): { html: string; text: string } {
  return renderTemplate({
    title: `You earned CAD $${args.creditAmount.toFixed(2)}!`,
    bodyLines: [
      `Hi ${args.referrerName},`,
      "",
      `Great news. Someone you referred has enrolled in DSDC classes, and you've earned CAD $${args.creditAmount.toFixed(2)} in referral credit.`,
      "",
      `Your promo code: ${args.promoCode}`,
      "",
      "Apply this code at checkout to get a discount on your next term tuition or private coaching session purchase. This code is one-time use.",
      "",
      "Keep sharing your referral link to earn more credits.",
    ],
    buttonLabel: "Open Referral Dashboard",
    buttonUrl: "https://dsdc.ca/portal",
  });
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
  reason?: string | null;
  portalUrl: string;
  preferenceUrl: string;
}) {
  const lines = [`When: ${input.whenText}`, `Cancelled by: ${input.cancelledBy}`];
  if (input.reason?.trim()) {
    lines.push(`Reason: ${input.reason.trim()}`);
  }
  const subject = 'Private session cancelled';
  const { html, text } = renderTemplate({
    title: 'Private Session Cancelled',
    bodyLines: lines,
    buttonLabel: 'Open Portal',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateCoachAcceptedTemplate(input: {
  coachName: string;
  studentName: string;
  whenText: string;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? '私教申请已通过教练确认' : 'Coach accepted your private session request';
  const { html, text } = renderTemplate({
    title: isZh ? '教练已确认' : 'Coach Accepted',
    bodyLines: isZh
      ? [
          `${input.coachName} 已接受 ${input.studentName} 的私教申请。`,
          `时间：${input.whenText}`,
          '当前状态：等待管理员审批与定价。',
        ]
      : [
          `${input.coachName} has accepted ${input.studentName}'s private session request.`,
          `When: ${input.whenText}`,
          'Status: awaiting admin approval and pricing.',
        ],
    buttonLabel: isZh ? '查看私教安排' : 'View Session',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateCoachRejectedTemplate(input: {
  coachName: string;
  studentName: string;
  reason?: string | null;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const lines = isZh
    ? [
        `很抱歉，${input.coachName} 未通过 ${input.studentName} 的私教申请。`,
      ]
    : [
        `Coach ${input.coachName} has declined ${input.studentName}'s private session request.`,
      ];
  if (input.reason?.trim()) {
    lines.push(isZh ? `原因：${input.reason.trim()}` : `Reason: ${input.reason.trim()}`);
  }
  const subject = isZh ? '私教申请未通过' : 'Private session request declined';
  const { html, text } = renderTemplate({
    title: isZh ? '私教申请未通过' : 'Private Session Declined',
    bodyLines: lines,
    buttonLabel: isZh ? '查看私教安排' : 'View Session',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateRescheduleProposedTemplate(input: {
  proposerName: string;
  proposedWhenText: string;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? '私教时间调整提议' : 'Private session reschedule proposed';
  const { html, text } = renderTemplate({
    title: isZh ? '新的时间提议' : 'New Time Proposed',
    bodyLines: isZh
      ? [
          `${input.proposerName} 为私教课提出了新时间：`,
          input.proposedWhenText,
          '您可以接受该时间或继续提出其他时间。',
        ]
      : [
          `${input.proposerName} proposed a new private session time:`,
          input.proposedWhenText,
          'You can accept this time or propose another one.',
        ],
    buttonLabel: isZh ? '查看私教安排' : 'View Session',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateRescheduleAcceptedTemplate(input: {
  whenText: string;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? '私教改期已确认' : 'Private session reschedule accepted';
  const { html, text } = renderTemplate({
    title: isZh ? '改期已确认' : 'Reschedule Accepted',
    bodyLines: isZh
      ? ['新的私教时间已确认：', input.whenText, '当前状态：等待管理员审批。']
      : ['The new private session time has been accepted:', input.whenText, 'Status: awaiting admin approval.'],
    buttonLabel: isZh ? '查看私教安排' : 'View Session',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateAdminApprovedTemplate(input: {
  studentName: string;
  coachName: string;
  whenText: string;
  priceCad: number;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? '私教课已审批，请完成支付' : 'Private session approved - payment required';
  const { html, text } = renderTemplate({
    title: isZh ? '私教课已审批' : 'Private Session Approved',
    bodyLines: isZh
      ? [
          `${input.studentName} 的私教课已审批。`,
          `教练：${input.coachName}`,
          `时间：${input.whenText}`,
          `价格：CAD $${input.priceCad.toFixed(2)}`,
          '请在门户中完成银行卡或电子转账支付以确认课程。',
        ]
      : [
          `${input.studentName}'s private session has been approved.`,
          `Coach: ${input.coachName}`,
          `When: ${input.whenText}`,
          `Price: CAD $${input.priceCad.toFixed(2)}`,
          'Please complete payment in the portal (card or e-transfer) to confirm the session.',
        ],
    buttonLabel: isZh ? '完成支付' : 'Complete Payment',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateAdminApprovedCoachTemplate(input: {
  coachName: string;
  studentName: string;
  whenText: string;
  priceCad: number;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? '私教课已通过管理员审批' : 'Admin approved private session';
  const { html, text } = renderTemplate({
    title: isZh ? '管理员已审批' : 'Admin Approval Complete',
    bodyLines: isZh
      ? [
          `${input.coachName}，管理员已审批您与 ${input.studentName} 的私教课。`,
          `时间：${input.whenText}`,
          `价格：CAD $${input.priceCad.toFixed(2)}`,
          '当前状态：等待学生支付确认。',
        ]
      : [
          `Hi ${input.coachName}, admin approved your private session with ${input.studentName}.`,
          `When: ${input.whenText}`,
          `Price: CAD $${input.priceCad.toFixed(2)}`,
          'Status: awaiting student payment.',
        ],
    buttonLabel: isZh ? '查看私教安排' : 'View Session',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privatePaymentConfirmedTemplate(input: {
  studentName: string;
  coachName: string;
  whenText: string;
  zoomLink?: string | null;
  paymentMethod: 'stripe' | 'etransfer';
  isCoachVersion?: boolean;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const paymentLabel = input.paymentMethod === 'etransfer'
    ? (isZh ? '电子转账' : 'E-Transfer')
    : (isZh ? '银行卡' : 'Card');
  const subject = isZh ? '私教课已确认' : 'Private session confirmed';

  const intro = input.isCoachVersion
    ? isZh
      ? `学生 ${input.studentName} 已完成支付，课程已确认。`
      : `${input.studentName} has completed payment. The session is confirmed.`
    : isZh
      ? '支付已确认，您的私教课已确认。'
      : 'Payment is confirmed and your private session is booked.';

  const lines = [
    intro,
    isZh ? `教练：${input.coachName}` : `Coach: ${input.coachName}`,
    isZh ? `时间：${input.whenText}` : `When: ${input.whenText}`,
    isZh ? `支付方式：${paymentLabel}` : `Payment method: ${paymentLabel}`,
  ];
  if (input.zoomLink?.trim()) {
    lines.push(isZh ? `Zoom 链接：${input.zoomLink.trim()}` : `Zoom link: ${input.zoomLink.trim()}`);
  }

  const { html, text } = renderTemplate({
    title: isZh ? '私教课已确认' : 'Private Session Confirmed',
    bodyLines: lines,
    buttonLabel: isZh ? '查看课程' : 'View Session',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateEtransferInstructionsTemplate(input: {
  studentName: string;
  coachName: string;
  whenText: string;
  amountCad: number;
  etransferEmail: string;
  zoomLink?: string | null;
  portalUrl: string;
  preferenceUrl?: string;
  locale?: 'en' | 'zh';
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? '私教课电子转账支付说明' : 'E-Transfer instructions for your private session';
  const lines = isZh
    ? [
        `${input.studentName} 的私教课已确认，支付方式为电子转账。`,
        `教练：${input.coachName}`,
        `时间：${input.whenText}`,
        `应付金额：CAD $${input.amountCad.toFixed(2)}`,
        `请将电子转账发送至：${input.etransferEmail}`,
        '请在转账留言中注明您的姓名和 “DSDC Private Session”。',
        '管理员核实到账后将完成内部确认。',
      ]
    : [
        `${input.studentName}'s private session is confirmed with e-transfer payment.`,
        `Coach: ${input.coachName}`,
        `When: ${input.whenText}`,
        `Amount due: CAD $${input.amountCad.toFixed(2)}`,
        `Send e-transfer to: ${input.etransferEmail}`,
        "Include your name and 'DSDC Private Session' in the transfer message.",
        'Admin will verify receipt and finalize internally.',
      ];
  if (input.zoomLink?.trim()) {
    lines.push(isZh ? `Zoom 链接：${input.zoomLink.trim()}` : `Zoom link: ${input.zoomLink.trim()}`);
  }

  const { html, text } = renderTemplate({
    title: isZh ? '电子转账说明' : 'E-Transfer Instructions',
    bodyLines: lines,
    buttonLabel: isZh ? '查看私教安排' : 'View Session',
    buttonUrl: input.portalUrl,
    preferenceUrl: input.preferenceUrl,
  });
  return { subject, html, text };
}

export function privateEtransferAdminNoticeTemplate(input: {
  studentName: string;
  coachName: string;
  whenText: string;
  amountCad: number;
  portalUrl: string;
}) {
  const subject = `Private session e-transfer selected: ${input.studentName}`;
  const { html, text } = renderTemplate({
    title: 'Private Session E-Transfer Selected',
    bodyLines: [
      `${input.studentName} selected e-transfer for a private session.`,
      `Coach: ${input.coachName}`,
      `When: ${input.whenText}`,
      `Amount: CAD $${input.amountCad.toFixed(2)}`,
      'Please verify receipt of funds.',
    ],
    buttonLabel: 'Open Admin Portal',
    buttonUrl: input.portalUrl,
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

export function etransferAdminSentNotice(input: {
  studentName: string;
  studentEmail: string;
  classes: { name: string }[];
  totalAmountCad: number;
  queueUrl: string;
}) {
  const classList = input.classes.map((classItem) => classItem.name).join(', ');
  const subject = `E-transfer sent: ${input.studentName} ($${input.totalAmountCad.toFixed(2)} CAD)`;
  const { html, text } = renderTemplate({
    title: 'E-Transfer Marked as Sent',
    bodyLines: [
      `${input.studentName} (${input.studentEmail}) has confirmed sending an e-transfer.`,
      `Classes: ${classList}`,
      `Amount: CAD $${input.totalAmountCad.toFixed(2)}`,
      'Please verify receipt and confirm their enrollment in the admin portal.',
    ],
    buttonLabel: 'Open E-Transfer Queue',
    buttonUrl: input.queueUrl,
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

export function pendingApprovalStudentTemplate(input: {
  studentName: string;
  classList: string;
  portalUrl: string;
  locale?: 'en' | 'zh';
  isParentVersion?: boolean;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? '\u62a5\u540d\u7533\u8bf7\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u5ba1\u6838'
    : 'Enrollment submitted - awaiting admin approval';

  const intro = isZh
    ? input.isParentVersion
      ? `\u60a8\u597d\uff0c${input.studentName} \u7684\u62a5\u540d\u7533\u8bf7\u5df2\u63d0\u4ea4\uff1a${input.classList}`
      : `\u60a8\u597d ${input.studentName}\uff0c\u60a8\u7684\u62a5\u540d\u7533\u8bf7\u5df2\u63d0\u4ea4\uff1a${input.classList}`
    : input.isParentVersion
      ? `Enrollment request submitted for ${input.studentName}: ${input.classList}`
      : `Your enrollment request for ${input.classList} has been submitted.`;

  const { html, text } = renderTemplate({
    title: isZh ? '\u62a5\u540d\u7533\u8bf7\u5df2\u63d0\u4ea4' : 'Enrollment Request Submitted',
    bodyLines: isZh
      ? [
          intro,
          '\u7ba1\u7406\u5458\u5c06\u6838\u5b9e\u4ed8\u6b3e\u540e\u786e\u8ba4\u60a8\u7684\u62a5\u540d\u3002',
          '\u5ba1\u6838\u5b8c\u6210\u540e\u60a8\u5c06\u6536\u5230\u786e\u8ba4\u90ae\u4ef6\u3002',
        ]
      : [
          intro,
          'An admin will verify your payment and confirm enrollment shortly.',
          "You'll receive a confirmation email once approved.",
        ],
    buttonLabel: isZh ? '\u6253\u5f00\u95e8\u6237' : 'Open Portal',
    buttonUrl: input.portalUrl,
  });

  return { subject, html, text };
}

export function pendingApprovalAdminTemplate(input: {
  studentName: string;
  studentEmail: string;
  classList: string;
  queueUrl: string;
}) {
  const subject = `New enrollment pending approval: ${input.studentName}`;
  const { html, text } = renderTemplate({
    title: 'Enrollment Pending Approval',
    bodyLines: [
      `New enrollment pending approval: ${input.studentName} (${input.studentEmail}).`,
      `Classes: ${input.classList}`,
      'Please verify payment and approve or reject this request.',
    ],
    buttonLabel: 'Review Pending Approvals',
    buttonUrl: input.queueUrl,
  });
  return { subject, html, text };
}

export function pendingApprovalRejectedTemplate(input: {
  studentName: string;
  classList: string;
  reason?: string;
  contactEmail: string;
  registerUrl: string;
  locale?: 'en' | 'zh';
  isParentVersion?: boolean;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? '\u62a5\u540d\u7533\u8bf7\u672a\u901a\u8fc7\u5ba1\u6279'
    : 'Enrollment request was not approved';

  const intro = isZh
    ? input.isParentVersion
      ? `${input.studentName} \u7684\u62a5\u540d\u7533\u8bf7\u672a\u901a\u8fc7\u5ba1\u6279\uff1a${input.classList}`
      : `\u60a8\u7684\u62a5\u540d\u7533\u8bf7\u672a\u901a\u8fc7\u5ba1\u6279\uff1a${input.classList}`
    : input.isParentVersion
      ? `${input.studentName}'s enrollment request for ${input.classList} was not approved.`
      : `Your enrollment request for ${input.classList} was not approved.`;

  const bodyLines = [
    intro,
    ...(input.reason?.trim()
      ? [isZh ? `\u539f\u56e0\uff1a${input.reason.trim()}` : `Reason: ${input.reason.trim()}`]
      : []),
    isZh
      ? `\u5982\u6709\u7591\u95ee\uff0c\u8bf7\u8054\u7cfb ${input.contactEmail}\u3002`
      : `Please contact ${input.contactEmail} if you have questions.`,
  ];

  const { html, text } = renderTemplate({
    title: isZh ? '\u7533\u8bf7\u672a\u901a\u8fc7' : 'Request Not Approved',
    bodyLines,
    buttonLabel: isZh ? '\u91cd\u65b0\u6ce8\u518c' : 'Register Again',
    buttonUrl: input.registerUrl,
  });

  return { subject, html, text };
}

export function pendingApprovalExpiredTemplate(input: {
  studentName: string;
  classList: string;
  registerUrl: string;
  locale?: 'en' | 'zh';
  isParentVersion?: boolean;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh
    ? '报名申请已过期'
    : 'Your enrollment request has expired';
  const intro = isZh
    ? input.isParentVersion
      ? `${input.studentName} 的报名申请已过期：${input.classList}`
      : `您的报名申请已过期：${input.classList}`
    : input.isParentVersion
      ? `${input.studentName}'s enrollment request has expired: ${input.classList}`
      : `Your enrollment request has expired: ${input.classList}`;

  const { html, text } = renderTemplate({
    title: isZh ? '报名申请已过期' : 'Enrollment Request Expired',
    bodyLines: isZh
      ? [
          intro,
          '由于我们未能在 48 小时内核实付款，申请已自动过期。',
          '如您仍希望报名，请重新提交注册申请。',
        ]
      : [
          intro,
          'Your request expired because payment could not be verified within 48 hours.',
          'Please register again if you would like to enroll.',
        ],
    buttonLabel: isZh ? '重新注册' : 'Register Again',
    buttonUrl: input.registerUrl,
  });

  return { subject, html, text };
}

export function pendingApprovalAdminReminderTemplate(input: {
  pendingCount: number;
  oldestSubmittedAtText: string;
  queueUrl: string;
}) {
  const subject = `Pending approvals reminder (${input.pendingCount})`;
  const { html, text } = renderTemplate({
    title: 'Pending Enrollment Approvals',
    bodyLines: [
      `You have ${input.pendingCount} pending enrollment approvals awaiting review.`,
      `Oldest submitted: ${input.oldestSubmittedAtText}.`,
      'Please verify payments before requests expire.',
    ],
    buttonLabel: 'Review Pending Approvals',
    buttonUrl: input.queueUrl,
  });

  return { subject, html, text };
}
