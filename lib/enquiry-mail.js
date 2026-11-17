// Ported from legacy-nextjs-app/src/lib/email.ts's sendEnquiryEmails(). Builds and
// sends the two emails a new enquiry triggers: a notification to the team
// (Settings.notificationEmail/alsoNotify, falling back to ADMIN_NOTIFY_EMAIL) and, if
// enabled, an auto-reply to the enquirer (Settings.sendAutoReply/autoReplyMessage).
// Delivery itself is lib/mailer.js's sendMail() — the same function the admin
// Enquiries "Send reply" action already uses.
const { sendMail } = require("./mailer");
const { getSettings } = require("./settings");

async function sendEnquiryEmails({ name, email, service, details, source }) {
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

  await Promise.all([
    recipients.length > 0
      ? sendMail({
          to: recipients.join(", "),
          subject: `New enquiry: ${name} — ${service}`,
          text: `${name} <${email}>\nService: ${service}\nSource: ${source}\n\n${details}`,
        })
      : Promise.resolve(),
    settings.sendAutoReply
      ? sendMail({
          to: email,
          subject: "Thanks for reaching out to Kargatox",
          text: settings.autoReplyMessage.replaceAll("{firstName}", firstName),
        })
      : Promise.resolve(),
  ]);
}

module.exports = { sendEnquiryEmails };
