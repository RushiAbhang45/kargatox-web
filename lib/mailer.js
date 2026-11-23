// Ported from legacy-nextjs-app/src/lib/mailer.ts verbatim, CommonJS instead of TS. Lazily
// builds its transporter so a missing SMTP_* config doesn't crash module load — sendMail()
// just logs and no-ops instead, same fallback shape the legacy app used before real SMTP
// was wired up.
const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

// `html` and `replyTo` are optional (added for the branded welcome email, lib/enquiry-mail.js);
// `text` is always sent too, as the plain-text alternative.
async function sendMail({ to, subject, text, html, replyTo }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[mail] SMTP not configured — would send to ${to}: ${subject}\n${text}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await t.sendMail({ from, to, subject, text, ...(html ? { html } : {}), ...(replyTo ? { replyTo } : {}) });
}

module.exports = { sendMail };
