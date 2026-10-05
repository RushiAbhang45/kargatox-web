import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enquirySchema } from "@/lib/enquiry-schema";
import { rateLimit } from "@/lib/rate-limit";
import { sendEnquiryEmails } from "@/lib/email";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { allowed } = rateLimit(`enquiry:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real users never see this field (visually hidden + out of tab
  // order in the form). A filled value means a bot filled every input it
  // could find — pretend success without saving or emailing anything.
  if (typeof (body as Record<string, unknown>).company === "string" && (body as Record<string, unknown>).company) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, phone, service, details, source, revenueCheckId } = parsed.data;

  // A client-supplied id, so don't trust it as a valid FK — a stale or
  // tampered value should drop the link, not fail the whole submission.
  const revenueCheck = revenueCheckId
    ? await prisma.revenueCheck.findUnique({ where: { id: revenueCheckId }, select: { id: true } })
    : null;

  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      service,
      details,
      source,
      status: "NEW",
      revenueCheckId: revenueCheck?.id ?? null,
    },
  });

  await sendEnquiryEmails({ name, email, service, details, source });

  return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
}
