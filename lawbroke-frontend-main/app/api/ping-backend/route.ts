import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_BASE!;
  try {
    await fetch(`${base}/healthz`, { cache: "no-store" });
  } catch {}
  return NextResponse.json({ ok: true });
}
