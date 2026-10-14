import { sendMail } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";

type EnquiryEmailInput = {
  name: string;
  email: string;
  service: string;
  details: string;
  source: string;
};

// README: notify the admin, plus (if enabled) auto-reply the customer.
// Delivery itself lives in src/lib/mailer.ts — this just builds the two
// messages. Settings.notificationEmail/alsoNotify (src/app/admin/(protected)/
// settings/) take priority over ADMIN_NOTIFY_EMAIL once an admin saves them;
// sendAutoReply/autoReplyMessage likewise override the hardcoded defaults.
export async function sendEnquiryEmails({ name, email, service, details, source }: EnquiryEmailInput) {
  const firstName = name.trim().split(" ")[0] || name;
  const settings = await getSettings();

  const recipients = [
    settings.notificationEmail || process.env.ADMIN_NOTIFY_EMAIL,
    ...(settings.alsoNotify ? settings.alsoNotify.split(",").map((s) => s.trim()).filter(Boolean) : []),
  ].filter((r): r is string => Boolean(r));

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
