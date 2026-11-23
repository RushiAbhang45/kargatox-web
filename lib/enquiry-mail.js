// Ported from legacy-nextjs-app/src/lib/email.ts's sendEnquiryEmails(). Builds and
// sends the two emails a new enquiry triggers: a notification to the team
// (Settings.notificationEmail/alsoNotify, falling back to ADMIN_NOTIFY_EMAIL) and, if
// enabled, a welcome email to the enquirer (Settings.sendAutoReply/autoReplyMessage).
// Delivery itself is lib/mailer.js's sendMail() — the same function the admin
// Enquiries "Send reply" action already uses.
//
// Client change list 2026-11-02 turned the plain auto-reply into a branded welcome email
// addressed by first name, sent from hello@kargatox.com (set SMTP_FROM to
// "Kargatox <hello@kargatox.com>" on an SMTP account allowed to send as that address).
// Its message body is still Settings → "Auto-reply message" (with {firstName}), so the
// client's final welcome copy can be pasted in the admin panel without a code change;
// the HTML wrapper adds the branding, the "what happens next" steps and — if they said
// yes to a meeting — a button to pick a slot in Calendly.
const { sendMail } = require("./mailer");
const { getSettings } = require("./settings");
const { CONTACT_EMAIL, CALENDLY_URL, SITE_URL } = require("./seo-data");

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function calendlyLink(name, email) {
  const u = new URL(CALENDLY_URL);
  u.searchParams.set("name", name);
  u.searchParams.set("email", email);
  return u.toString();
}

function welcomeHtml({ firstName, name, email, message, wantsMeeting }) {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1e293b;">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const meeting = wantsMeeting
    ? `<tr><td style="padding:8px 32px 8px;">
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1e293b;">You mentioned you'd like to talk it through. Pick a time that suits you:</p>
        <a href="${esc(calendlyLink(name, email))}" style="display:inline-block;background:#f26a1b;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:999px;">Book your discovery call →</a>
      </td></tr>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f7f6f3;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f3;padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e3dc;">
  <tr><td style="background:#0f172a;padding:24px 32px;">
    <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.4px;">Karga<span style="color:#ff8a3d;">tox</span></span>
    <div style="margin-top:4px;font-size:11px;letter-spacing:2px;color:#aeb9d8;">KNOWLEDGE PARTNERS</div>
  </td></tr>
  <tr><td style="padding:32px 32px 8px;">
    <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#0f172a;">Welcome, ${esc(firstName)}.</h1>
    ${paragraphs}
  </td></tr>
  ${meeting}
  <tr><td style="padding:16px 32px 8px;">
    <div style="font-size:11px;letter-spacing:1.6px;color:#f26a1b;font-weight:700;margin-bottom:10px;">WHAT HAPPENS NEXT</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr><td valign="top" style="width:30px;font-size:13px;color:#f26a1b;font-weight:700;padding:4px 0;">01</td>
          <td style="font-size:14px;line-height:1.55;color:#334155;padding:4px 0;"><strong style="color:#0f172a;">Discovery Call</strong><br/>A brief technical discussion to align on your data needs and current workflow gaps.</td></tr>
      <tr><td valign="top" style="width:30px;font-size:13px;color:#f26a1b;font-weight:700;padding:4px 0;">02</td>
          <td style="font-size:14px;line-height:1.55;color:#334155;padding:4px 0;"><strong style="color:#0f172a;">Scope Definition</strong><br/>We outline the specific deliverables, methodologies, and timeline.</td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:24px 32px 28px;border-top:1px solid #eceae4;font-size:12px;line-height:1.6;color:#64748b;">
    Kargatox, Coffice 24x7 (CO-102), Sai Vision, Pimple Saudagar, Pune, Maharashtra 411027<br/>
    <a href="mailto:${CONTACT_EMAIL}" style="color:#1f5fd6;text-decoration:none;">${CONTACT_EMAIL}</a> ·
    <a href="tel:+917887789471" style="color:#1f5fd6;text-decoration:none;">+91 78877 89471</a> ·
    <a href="${SITE_URL}" style="color:#1f5fd6;text-decoration:none;">kargatox.com</a>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

function welcomeText({ firstName, name, email, message, wantsMeeting }) {
  return [
    message,
    wantsMeeting ? `\nBook your discovery call: ${calendlyLink(name, email)}` : "",
    "\nWhat happens next",
    "01 Discovery Call — A brief technical discussion to align on your data needs and current workflow gaps.",
    "02 Scope Definition — We outline the specific deliverables, methodologies, and timeline.",
    `\nKargatox · ${CONTACT_EMAIL} · +91 78877 89471 · ${SITE_URL}`,
  ]
    .join("\n")
    .replaceAll("{firstName}", firstName);
}

async function sendEnquiryEmails({ id, name, email, phone, service, details, source, linkedinUrl, website, wantsMeeting }) {
  const firstName = name.trim().split(" ")[0] || name;
  const settings = await getSettings();

  const recipients = [
    settings.notificationEmail || process.env.ADMIN_NOTIFY_EMAIL,
    ...(settings.alsoNotify
      ? settings.alsoNotify
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []),
  ].filter(Boolean);

  const notification = [
    `${name} <${email}>`,
    phone ? `Phone: ${phone}` : null,
    `Service: ${service}`,
    `Source: ${source}`,
    `Wants a meeting: ${wantsMeeting ? "Yes" : "No"}`,
    linkedinUrl ? `LinkedIn: ${linkedinUrl}` : null,
    website ? `Website: ${website} (scan results will appear in the admin panel shortly)` : null,
    "",
    details,
    "",
    id ? `Open in admin: ${SITE_URL}/admin/enquiries?id=${id}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const message = settings.autoReplyMessage.replaceAll("{firstName}", firstName);

  await Promise.all([
    recipients.length > 0
      ? sendMail({
          to: recipients.join(", "),
          subject: `New enquiry: ${name} — ${service}${wantsMeeting ? " (wants a meeting)" : ""}`,
          text: notification,
          replyTo: email,
        })
      : Promise.resolve(),
    settings.sendAutoReply
      ? sendMail({
          to: email,
          subject: `Welcome to Kargatox, ${firstName}`,
          text: welcomeText({ firstName, name, email, message, wantsMeeting }),
          html: welcomeHtml({ firstName, name, email, message, wantsMeeting }),
          replyTo: CONTACT_EMAIL,
        })
      : Promise.resolve(),
  ]);
}

module.exports = { sendEnquiryEmails, welcomeHtml };
