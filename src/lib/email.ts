/**
 * Lightweight email notification utility.
 * In dev: logs to console. In production: uses Resend (set RESEND_API_KEY env var).
 */

const FROM_EMAIL = "ResourceMatch <noreply@resourcematch.ph>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendViaResend({ to, subject, html }: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    console.log(`[EMAIL] Body: ${html.substring(0, 200)}...`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[EMAIL] Failed to send to ${to}:`, err);
    }
  } catch (error) {
    console.error(`[EMAIL] Error sending to ${to}:`, error);
  }
}

function brandedHtml(content: string): string {
  return `
    <div style="font-family: 'Karla', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-family: 'Montserrat', Arial, sans-serif; color: #04443C; margin: 0;">
          ResourceMatch
        </h2>
      </div>
      ${content}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          ResourceMatch — AI-Vetted Senior Filipino Talent
        </p>
      </div>
    </div>
  `;
}

export function sendNotificationEmail(options: EmailOptions): void {
  // Fire-and-forget — don't block the API response
  void sendViaResend(options);
}

export function notifyNewApplication(
  companyEmail: string,
  candidateName: string,
  jobTitle: string,
  jobId: string
): void {
  sendNotificationEmail({
    to: companyEmail,
    subject: `New application: ${candidateName} applied to "${jobTitle}"`,
    html: brandedHtml(`
      <h3 style="color: #1e293b; margin: 0 0 8px 0;">${candidateName} applied to your job posting</h3>
      <p style="color: #475569; margin: 0 0 16px 0;">
        You have a new application for <strong>${jobTitle}</strong>.
      </p>
      <a href="https://resourcematch.ph/jobs/manage"
         style="display: inline-block; padding: 10px 24px; background: #04443C; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Application
      </a>
    `),
  });
}

export function notifyApplicationStatusChange(
  candidateEmail: string,
  jobTitle: string,
  companyName: string,
  status: string
): void {
  const statusLabels: Record<string, string> = {
    REVIEWED: "reviewed",
    SHORTLISTED: "shortlisted",
    REJECTED: "not selected",
  };
  const label = statusLabels[status] || status.toLowerCase();

  sendNotificationEmail({
    to: candidateEmail,
    subject: `Application update: Your application for "${jobTitle}" has been ${label}`,
    html: brandedHtml(`
      <h3 style="color: #1e293b; margin: 0 0 8px 0;">Application Update</h3>
      <p style="color: #475569; margin: 0 0 16px 0;">
        Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>
        has been <strong>${label}</strong>.
      </p>
      <a href="https://resourcematch.ph/candidate/applications"
         style="display: inline-block; padding: 10px 24px; background: #04443C; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View My Applications
      </a>
    `),
  });
}

export interface MatchCandidate {
  id: number;
  name: string;
  title: string;
  vertical: string;
  experience: number;
  vettingScore: number;
  skills: string[];
}

export function sendMatchDigest(
  companyEmail: string,
  companyName: string,
  matches: MatchCandidate[]
): void {
  const candidateCards = matches
    .map(
      (c) => `
    <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
      <h4 style="color: #1e293b; margin: 0 0 4px 0; font-family: 'Montserrat', Arial, sans-serif;">${c.name}</h4>
      <p style="color: #475569; margin: 0 0 8px 0; font-size: 14px;">${c.title} &middot; ${c.experience} years</p>
      <p style="color: #04443C; margin: 0; font-size: 13px; font-weight: 600;">Vetting Score: ${c.vettingScore}/100</p>
    </div>
  `
    )
    .join("");

  sendNotificationEmail({
    to: companyEmail,
    subject: `${matches.length} new talent match${matches.length !== 1 ? "es" : ""} for ${companyName}`,
    html: brandedHtml(`
      <h3 style="color: #1e293b; margin: 0 0 8px 0;">Weekly Talent Digest</h3>
      <p style="color: #475569; margin: 0 0 16px 0;">
        We found <strong>${matches.length} new professional${matches.length !== 1 ? "s" : ""}</strong>
        matching your preferences.
      </p>
      ${candidateCards}
      <a href="https://resourcematch.ph/dashboard"
         style="display: inline-block; padding: 12px 24px; background: #04443C; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 8px;">
        View All Matches
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
        You're receiving this because you enabled weekly talent alerts.
        <a href="https://resourcematch.ph/dashboard" style="color: #399A8B;">Update preferences</a>
      </p>
    `),
  });
}
