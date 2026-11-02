import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revenueCheckSchema } from "@/lib/revenue-check-schema";
import { rateLimit } from "@/lib/rate-limit";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { allowed } = rateLimit(`revenue-check:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = revenueCheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { leads, sales, retention, weakest, sessionId, email, city } = parsed.data;

  const revenueCheck = await prisma.revenueCheck.create({
    data: { leads, sales, retention, weakest, sessionId, email: email || null, city: city || null },
  });

  return NextResponse.json({ ok: true, id: revenueCheck.id }, { status: 201 });
}
