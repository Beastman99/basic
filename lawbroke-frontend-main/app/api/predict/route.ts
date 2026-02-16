// app/api/predict/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  console.log("[/api/predict] GET healthcheck hit");
  return NextResponse.json({ ok: true, hint: "POST JSON to this route" });
}

export async function POST(req: Request) {
  console.log("[/api/predict] POST hit");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "");
  try {
    const body = await req.json();

    if (apiBase) {
      const r = await fetch(`${apiBase}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const ct = r.headers.get("content-type") || "";
      const txt = await r.text();

      if (!r.ok) return NextResponse.json({ error: `HTTP ${r.status}: ${txt.slice(0,300)}` }, { status: r.status });
      if (!ct.includes("application/json"))
        return NextResponse.json({ error: `Non‑JSON: ${ct}; ${txt.slice(0,200)}` }, { status: 502 });

      return NextResponse.json(JSON.parse(txt));
    }

    // Mock so UI works without backend
    return NextResponse.json({
      probabilities: { "Appeal Allowed": 68, Dismissed: 32 },
      reasoning: [
        "Similarity to prior NSWCA decisions on procedural fairness.",
        "Fact pattern favours the appellant on standard of review.",
      ],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Predict failed" }, { status: 500 });
  }
}
