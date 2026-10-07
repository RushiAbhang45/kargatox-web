import nodemailer from "nodemailer";

type MailInput = { to: string; subject: string; text: string };

let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;

// Lazily built so a missing SMTP_* config doesn't crash module load — it
// just means sendMail() falls back to logging (same no-op-friendly shape
// src/lib/email.ts had before real SMTP was wired up).
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

export async function sendMail({ to, subject, text }: MailInput) {
  const t = getTransporter();
  if (!t) {
    console.log(`[mail] SMTP not configured — would send to ${to}: ${subject}\n${text}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await t.sendMail({ from, to, subject, text });
}
