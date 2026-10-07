import { sendMail } from "@/lib/mailer";

type EnquiryEmailInput = {
  name: string;
  email: string;
  service: string;
  details: string;
  source: string;
};

// README: notify the admin, plus (if enabled) auto-reply the customer.
// Delivery itself lives in src/lib/mailer.ts — this just builds the two
// messages. ADMIN_NOTIFY_EMAIL unset means no admin notification goes out,
// but the customer still gets their auto-reply.
export async function sendEnquiryEmails({ name, email, service, details, source }: EnquiryEmailInput) {
  const firstName = name.trim().split(" ")[0] || name;
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL;

  await Promise.all([
    adminTo
      ? sendMail({
          to: adminTo,
          subject: `New enquiry: ${name} — ${service}`,
          text: `${name} <${email}>\nService: ${service}\nSource: ${source}\n\n${details}`,
        })
      : Promise.resolve(),
    sendMail({
      to: email,
      subject: "Thanks for reaching out to Kargatox",
      text: `Hi ${firstName},\n\nThank you for your requirement. Our team will contact you shortly.\n\n— Kargatox`,
    }),
  ]);
}
