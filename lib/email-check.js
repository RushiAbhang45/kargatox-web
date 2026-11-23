// Contact-form email screening (client change list 2026-11-02: "identify if an email is
// false or misleading"). Two cheap server-side checks that need no third-party service:
//   1. Known throwaway/disposable inbox domains are rejected.
//   2. The domain must be able to receive mail (an MX record, or failing that an A/AAAA
//      record — RFC 5321's implicit-MX fallback).
// This is deliberately NOT the OTP-by-email verification the client floated; they asked
// for that to be discussed before building it. These checks stop typo'd and made-up
// domains without adding a step for genuine enquirers.
//
// Fails open: if DNS itself is unreachable (timeouts, or even a known-good domain can't be
// resolved), the address is accepted rather than blocking real enquiries.
const dns = require("dns").promises;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "guerrillamail.net", "guerrillamailblock.com",
  "sharklasers.com", "grr.la", "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "tempmailo.com", "tempmail.net", "tempail.com", "yopmail.com", "yopmail.net", "trashmail.com",
  "trashmail.de", "getnada.com", "nada.email", "dispostable.com", "maildrop.cc", "throwawaymail.com",
  "fakeinbox.com", "mailnesia.com", "emailondeck.com", "mohmal.com", "burnermail.io", "mintemail.com",
  "spamgourmet.com", "mytemp.email", "tempinbox.com", "discard.email", "mailcatch.com", "moakt.com",
  "emailfake.com", "fakemail.net", "inboxkitten.com", "mailpoof.com", "33mail.com", "spambox.us",
]);

const DNS_TIMEOUT_MS = 3000;

function withTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), DNS_TIMEOUT_MS)),
  ]);
}

const NO_SUCH = new Set(["ENOTFOUND", "ENODATA", "NXDOMAIN"]);

async function domainResolves(domain) {
  try {
    const mx = await withTimeout(dns.resolveMx(domain));
    if (mx.length) return true;
  } catch (err) {
    if (!NO_SUCH.has(err.code)) throw err;
  }
  for (const fn of [dns.resolve4, dns.resolve6]) {
    try {
      const recs = await withTimeout(fn.call(dns, domain));
      if (recs.length) return true;
    } catch (err) {
      if (!NO_SUCH.has(err.code)) throw err;
    }
  }
  return false;
}

// Cached for the life of the instance: whether this environment can do DNS at all.
let dnsWorks;
async function dnsAvailable() {
  if (dnsWorks === undefined) {
    try {
      dnsWorks = await domainResolves("gmail.com");
    } catch {
      dnsWorks = false;
    }
  }
  return dnsWorks;
}

// Returns an error message for the email field, or null if it's acceptable.
async function checkEmailDomain(email) {
  const domain = String(email).split("@").pop().toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return "Please use your work or personal email — temporary inboxes aren't accepted";
  }
  try {
    if (await domainResolves(domain)) return null;
  } catch {
    return null; // DNS hiccup — don't punish the enquirer for it
  }
  if (!(await dnsAvailable())) return null;
  return `We couldn't find a mail server for "${domain}" — please check the spelling`;
}

module.exports = { checkEmailDomain, DISPOSABLE_DOMAINS };
