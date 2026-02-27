import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPortalEmail } from "@/lib/email/send";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional().default(""),
  grade: z.string().max(50).optional().default(""),
  heardAbout: z.string().max(100).optional().default(""),
  message: z.string().max(5000).optional().default(""),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ ok: true }); // silent rate limit
  }

  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const { name, email, phone, grade, heardAbout, message } = body.data;

  const lines = [
    `<strong>Name:</strong> ${escapeHtml(name)}`,
    `<strong>Email:</strong> ${escapeHtml(email)}`,
    phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}` : null,
    grade ? `<strong>Grade:</strong> ${escapeHtml(grade)}` : null,
    heardAbout ? `<strong>Heard About Us:</strong> ${escapeHtml(heardAbout)}` : null,
    message ? `<strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}` : null,
  ]
    .filter(Boolean)
    .join("<br/><br/>");

  const textLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    grade ? `Grade: ${grade}` : null,
    heardAbout ? `Heard About Us: ${heardAbout}` : null,
    message ? `Message:\n${message}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const contactEmail = process.env.PORTAL_CONTACT_EMAIL?.trim() || "education.dsdc@gmail.com";

  const result = await sendPortalEmail({
    to: contactEmail,
    subject: `DSDC Contact Form — ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d; border-bottom: 2px solid #d4a843; padding-bottom: 8px;">
          New Contact Form Submission
        </h2>
        <div style="padding: 16px 0; line-height: 1.8;">
          ${lines}
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 12px; color: #999;">
          Reply directly to this email to respond to ${escapeHtml(name)} at ${escapeHtml(email)}.
        </p>
      </div>
    `,
    text: `New DSDC Contact Form Submission\n\n${textLines}`,
  });

  if (!result.ok) {
    console.error("[contact] Email send failed:", result.error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
