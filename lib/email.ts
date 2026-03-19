import { Resend } from 'resend';
import type { NotificationBatch } from '@/types';

function getResend() { return new Resend(process.env.RESEND_API_KEY); }
const FROM    = () => process.env.RESEND_FROM_EMAIL ?? 'keeper@example.com';
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// NOTIF-01: new submission → GM
export async function sendSubmissionNotification(toEmail: string, toName: string, batch: NotificationBatch) {
  return getResend().emails.send({
    from: FROM(), to: toEmail,
    subject: `Action Required: New Asset Submission — ${batch.quantity}× ${batch.assetType}`,
    html: buildEmail({
      title: 'New Asset Submission', greeting: `Hi ${toName},`,
      body: `${batch.submitterName} from ${batch.department} has submitted assets for review.`,
      details: [
        { label: 'Reference',  value: batch.referenceId },
        { label: 'Asset',      value: `${batch.quantity}× ${batch.assetType}` },
        { label: 'Condition',  value: batch.condition },
        { label: 'Department', value: batch.department },
      ],
      ctaText: 'Review & Approve',
      ctaUrl: `${APP_URL()}/assets/${batch.id}`,
    }),
  });
}

// NOTIF-02: dept approved → GM for final sign-off
export async function sendGmApprovalNotification(toEmail: string, toName: string, batch: NotificationBatch, approverName: string) {
  return getResend().emails.send({
    from: FROM(), to: toEmail,
    subject: `Final Approval Needed: ${batch.referenceId} — ${batch.quantity}× ${batch.assetType}`,
    html: buildEmail({
      title: 'Final Approval Required', greeting: `Hi ${toName},`,
      body: `${approverName} has reviewed and approved a batch. Your final sign-off is needed.`,
      details: [
        { label: 'Reference', value: batch.referenceId },
        { label: 'Asset',     value: `${batch.quantity}× ${batch.assetType}` },
      ],
      ctaText: 'Give Final Approval',
      ctaUrl: `${APP_URL()}/assets/${batch.id}`,
    }),
  });
}

// NOTIF-03: fully approved → original submitter
export async function sendApprovalConfirmation(toEmail: string, toName: string, batch: NotificationBatch) {
  return getResend().emails.send({
    from: FROM(), to: toEmail,
    subject: `Approved: Your submission ${batch.referenceId}`,
    html: buildEmail({
      title: 'Your Submission Has Been Approved', greeting: `Hi ${toName},`,
      body: 'Great news — your asset submission has been approved. Keeper will be in touch about next steps.',
      details: [
        { label: 'Reference', value: batch.referenceId },
        { label: 'Asset',     value: `${batch.quantity}× ${batch.assetType}` },
      ],
      ctaText: 'View Asset Journey',
      ctaUrl: `${APP_URL()}/assets/${batch.id}`,
    }),
  });
}

// NOTIF-04: rejected → original submitter
export async function sendRejectionNotification(toEmail: string, toName: string, batch: NotificationBatch, reason: string) {
  return getResend().emails.send({
    from: FROM(), to: toEmail,
    subject: `Update on your submission ${batch.referenceId}`,
    html: buildEmail({
      title: 'Submission Not Approved', greeting: `Hi ${toName},`,
      body: `Your submission for ${batch.quantity}× ${batch.assetType} was not approved. Reason: "${reason}".`,
      details: [{ label: 'Reference', value: batch.referenceId }],
      ctaText: 'View Details',
      ctaUrl: `${APP_URL()}/assets/${batch.id}`,
    }),
  });
}

function buildEmail({ title, greeting, body, details, ctaText, ctaUrl }: {
  title: string; greeting: string; body: string;
  details: { label: string; value: string }[];
  ctaText: string; ctaUrl: string;
}) {
  const rows = details.map(d =>
    `<tr><td style="padding:4px 12px;color:#6b7a8d;font-size:14px;">${d.label}</td>
     <td style="padding:4px 12px;font-weight:600;font-size:14px;">${d.value}</td></tr>`
  ).join('');
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f4f6f9;padding:24px;">
    <div style="background:#1A3C5E;padding:16px 24px;border-radius:8px 8px 0 0;">
      <span style="color:white;font-size:20px;font-weight:bold;">KEEPER</span>
    </div>
    <div style="background:white;padding:24px;border-radius:0 0 8px 8px;">
      <h2 style="color:#1A3C5E;margin-top:0;">${title}</h2>
      <p style="color:#333;">${greeting}</p>
      <p style="color:#333;">${body}</p>
      <table style="width:100%;background:#f4f6f9;border-radius:6px;margin:16px 0;">${rows}</table>
      <a href="${ctaUrl}" style="display:inline-block;background:#2A7FBF;color:white;
         padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
        ${ctaText}
      </a>
      <p style="color:#6b7a8d;font-size:12px;margin-top:24px;">Keeper Platform</p>
    </div>
  </div>`;
}
