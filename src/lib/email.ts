type EnquiryEmailInput = {
  name: string;
  email: string;
  service: string;
  details: string;
  source: string;
};

/**
 * Logging stub. Swap this out for Resend (or SMTP) once there's an API key —
 * README calls for a notification email to the admin settings' recipient
 * list plus, if enabled, an auto-reply to the customer. Keeping this as a
 * no-op for now means the enquiry flow (save + respond) works end to end
 * without requiring an email account to be configured first.
 */
export async function sendEnquiryEmails(input: EnquiryEmailInput) {
  console.log("[email] would notify admin + auto-reply customer:", input);
}
